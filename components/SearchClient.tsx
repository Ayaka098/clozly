"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchRequest, SearchResponse } from "@/lib/types";
import {
  clearSearchRequest,
  loadSearchRequest,
  loadSearchSession,
  saveSearchRequest,
  saveSearchSession
} from "@/lib/searchSession";

const defaultRequest: SearchRequest = {
  freeText: "",
  itemType: "tops",
  budgetMin: 3000,
  budgetMax: 12000,
  gender: undefined,
  season: [],
  color: [],
  material: [],
  mood: "",
  exclude: []
};

const itemOptions = [
  { value: "tops", label: "トップス" },
  { value: "outer", label: "アウター" },
  { value: "bottoms", label: "ボトムス" },
  { value: "onepiece", label: "ワンピース" },
  { value: "shoes", label: "シューズ" },
  { value: "bags", label: "バッグ" },
  { value: "others", label: "その他" }
];

const seasonOptions = ["春", "夏", "秋", "冬"];
const colorOptions = ["白", "黒", "ベージュ", "ブラウン", "グレー", "ネイビー", "ブルー", "グリーン"];
const materialOptions = ["コットン", "リネン", "ウール", "ニット", "デニム", "レザー"];
const moodOptions = ["きれいめ", "カジュアル", "モード", "ミニマル", "オフィス", "リラックス"];
const genderOptions = [
  { value: "", label: "指定なし" },
  { value: "womens", label: "レディース" },
  { value: "mens", label: "メンズ" }
];

const BUDGET_MIN = 100;
const BUDGET_MAX = 20000;
const BUDGET_STEP = 100;

export default function SearchClient() {
  const router = useRouter();
  const [request, setRequest] = useState<SearchRequest>(defaultRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedRequest = loadSearchRequest() ?? loadSearchSession()?.request;
    if (storedRequest) setRequest(storedRequest);
  }, []);

  useEffect(() => {
    saveSearchRequest(request);
  }, [request]);

  const range = useMemo(() => {
    const minPercent = ((request.budgetMin - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
    const maxPercent = ((request.budgetMax - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
    return { minPercent, maxPercent };
  }, [request.budgetMin, request.budgetMax]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...request,
          exclude: request.exclude?.filter(Boolean)
        })
      });
      if (!response.ok) throw new Error("Search failed");
      const data = (await response.json()) as SearchResponse;
      saveSearchSession(request, data);
      router.push("/results");
    } catch (err) {
      setError("検索結果がありませんでした。条件を変えて再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  const toggleSeason = (value: string) => {
    setRequest((prev) => {
      const next = prev.season ?? [];
      if (next.includes(value)) {
        return { ...prev, season: next.filter((item) => item !== value) };
      }
      return { ...prev, season: [...next, value] };
    });
  };

  const toggleMulti = (key: "color" | "material", value: string) => {
    setRequest((prev) => {
      const current = prev[key] ?? [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const toggleValue = (key: "mood", value: string) => {
    setRequest((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value
    }));
  };

  const updateBudgetMin = (value: number) => {
    const next = Math.min(value, request.budgetMax - BUDGET_STEP);
    setRequest({ ...request, budgetMin: next });
  };

  const updateBudgetMax = (value: number) => {
    const next = Math.max(value, request.budgetMin + BUDGET_STEP);
    setRequest({ ...request, budgetMax: next });
  };

  return (
    <section className="fade-in" style={{ display: "grid", gap: 22 }}>
      <div className="card" style={{ display: "grid", gap: 20 }}>
        <div className="field">
          <div className="label">自由記述</div>
          <textarea
            className="input"
            rows={3}
            value={request.freeText}
            placeholder="詳しい条件を書いてください。例：ダメージジーンズ、きらきら"
            onChange={(event) =>
              setRequest({ ...request, freeText: event.target.value })
            }
          />
        </div>
        <div className="field">
          <div className="label">アイテム種別</div>
          <div className="chip-group">
            {itemOptions.map((option) => (
              <button
                key={option.value}
                className="chip"
                data-selected={request.itemType === option.value}
                onClick={() =>
                  setRequest({ ...request, itemType: option.value as SearchRequest["itemType"] })
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="label">対象</div>
          <div className="chip-group">
            {genderOptions.map((option) => (
              <button
                key={option.value || "none"}
                className="chip"
                data-selected={(request.gender ?? "") === option.value}
                onClick={() =>
                  setRequest({
                    ...request,
                    gender: option.value ? (option.value as "mens" | "womens") : undefined
                  })
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="label">予算</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
            <span>¥{request.budgetMin.toLocaleString()}</span>
            <span>
              {request.budgetMax >= BUDGET_MAX
                ? "上限なし"
                : `¥${request.budgetMax.toLocaleString()}`}
            </span>
          </div>
          <div className="range">
            <div className="range-track" />
            <div
              className="range-active"
              style={{
                left: `${range.minPercent}%`,
                width: `${range.maxPercent - range.minPercent}%`
              }}
            />
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={request.budgetMin}
              onChange={(event) => updateBudgetMin(Number(event.target.value))}
            />
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={request.budgetMax}
              onChange={(event) => updateBudgetMax(Number(event.target.value))}
            />
          </div>
        </div>
        <div className="field">
          <div className="label">季節</div>
          <div className="chip-group">
            {seasonOptions.map((option) => (
              <button
                key={option}
                className="chip"
                data-selected={request.season?.includes(option)}
                onClick={() => toggleSeason(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="label">色</div>
          <div className="chip-group">
            {colorOptions.map((option) => (
              <button
                key={option}
                className="chip"
                data-selected={request.color?.includes(option)}
                onClick={() => toggleMulti("color", option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="label">素材</div>
          <div className="chip-group">
            {materialOptions.map((option) => (
              <button
                key={option}
                className="chip"
                data-selected={request.material?.includes(option)}
                onClick={() => toggleMulti("material", option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="label">雰囲気</div>
          <div className="chip-group">
            {moodOptions.map((option) => (
              <button
                key={option}
                className="chip"
                data-selected={request.mood === option}
                onClick={() => toggleValue("mood", option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <div className="label">NGワード</div>
          <input
            className="input"
            placeholder="例: セット, 福袋"
            value={(request.exclude ?? []).join(",")}
            onChange={(event) =>
              setRequest({
                ...request,
                exclude: event.target.value.split(",").map((value) => value.trim())
              })
            }
          />
        </div>
        <button className="btn" onClick={handleSearch} disabled={loading}>
          {loading ? (
            <span className="btn-loading">
              <span className="btn-spinner" aria-hidden="true" />
              検索中...
            </span>
          ) : (
            "探す"
          )}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            setRequest(defaultRequest);
            clearSearchRequest();
          }}
        >
          条件をリセット
        </button>
        {error && <p>{error}</p>}
      </div>
    </section>
  );
}
