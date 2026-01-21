"use client";

import { useEffect, useMemo, useState } from "react";
import { CandidateItem, SearchResponse, SearchRequest, UserProfile } from "@/lib/types";
import { imageStore } from "@/lib/localImage";
import { loadProfile } from "@/lib/profile";
import ProductCard from "@/components/ProductCard";

const defaultRequest: SearchRequest = {
  freeText: "",
  itemType: "tops",
  budgetMin: 3000,
  budgetMax: 12000,
  gender: undefined,
  season: ["春"],
  color: ["白"],
  material: [],
  mood: "きれいめ",
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

export default function AppClient() {
  const [request, setRequest] = useState<SearchRequest>(defaultRequest);
  const [items, setItems] = useState<CandidateItem[]>([]);
  const [queryPlan, setQueryPlan] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [usedCache, setUsedCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
    imageStore.load().then((file) => {
      if (!file) return;
      setImageUrl(URL.createObjectURL(file));
    });
  }, []);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownLeft(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownLeft(remaining);
      if (remaining === 0) setCooldownUntil(null);
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const prompt = useMemo(() => {
    const size = profile.usualSize ? `サイズ感は${profile.usualSize}。` : "";
    const colors = request.color?.join(" ") ?? "";
    const materials = request.material?.join(" ") ?? "";
    return `全身写真の人物が、以下の服を試着しているイメージを生成してください。\n` +
      `服の説明: ${request.freeText}。${colors} ${request.mood ?? ""} ${materials}\n` +
      `${size}\n` +
      `背景はシンプルに。`;
  }, [profile.usualSize, request]);

  const handleSearch = async () => {
    if (loading || cooldownLeft > 0) return;
    setLoading(true);
    setHasSearched(true);
    setNote(null);
    setError(null);
    setCooldownUntil(Date.now() + 10_000);
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
      setItems(data.items);
      setQueryPlan(data.queryPlan);
      setUsedCache(data.usedCache);
      setNote(data.note ?? null);
    } catch (err) {
      setError("検索に失敗しました。条件を変えて再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    await imageStore.save(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleImageClear = async () => {
    await imageStore.clear();
    setImageUrl(null);
  };

  return (
    <section className="card fade-in">
      <div id="search" className="grid-2">
        <div className="card">
          <h2>欲しい服を入力</h2>
          <p>自由記述＋条件で、Clozlyが4件に編集します。</p>
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <div>
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
            <div>
              <div className="label">アイテム種別</div>
              <select
                className="input"
                value={request.itemType}
                onChange={(event) =>
                  setRequest({ ...request, itemType: event.target.value as SearchRequest["itemType"] })
                }
              >
                {itemOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">対象</div>
              <select
                className="input"
                value={request.gender ?? ""}
                onChange={(event) =>
                  setRequest({
                    ...request,
                    gender: event.target.value
                      ? (event.target.value as "mens" | "womens")
                      : undefined
                  })
                }
              >
                <option value="">指定なし</option>
                <option value="womens">レディース</option>
                <option value="mens">メンズ</option>
              </select>
            </div>
            <div className="grid-2">
              <div>
                <div className="label">予算下限</div>
                <input
                  className="input"
                  type="number"
                  value={request.budgetMin}
                  onChange={(event) =>
                    setRequest({ ...request, budgetMin: Number(event.target.value) })
                  }
                />
              </div>
              <div>
                <div className="label">予算上限</div>
                <input
                  className="input"
                  type="number"
                  value={request.budgetMax}
                  onChange={(event) =>
                    setRequest({ ...request, budgetMax: Number(event.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <div className="label">季節</div>
                <input
                  className="input"
                  value={(request.season ?? []).join(",")}
                  onChange={(event) =>
                    setRequest({
                      ...request,
                      season: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </div>
              <div>
                <div className="label">色</div>
                <input
                  className="input"
                  value={(request.color ?? []).join(",")}
                  onChange={(event) =>
                    setRequest({
                      ...request,
                      color: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <div className="label">素材</div>
                <input
                  className="input"
                  value={(request.material ?? []).join(",")}
                  onChange={(event) =>
                    setRequest({
                      ...request,
                      material: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </div>
              <div>
                <div className="label">雰囲気</div>
                <input
                  className="input"
                  value={request.mood ?? ""}
                  onChange={(event) =>
                    setRequest({ ...request, mood: event.target.value })
                  }
                />
              </div>
            </div>
            <div>
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
            <button
              className="btn"
              onClick={handleSearch}
              disabled={loading || cooldownLeft > 0}
            >
              {loading ? "検索中..." : "4件を提案"}
            </button>
            {cooldownLeft > 0 && (
              <p style={{ fontSize: "0.85rem", color: "var(--mute)" }}>
                あと{cooldownLeft}秒
              </p>
            )}
            {error && <p>{error}</p>}
            {usedCache && <p>キャッシュ結果を表示中</p>}
            {note && <p>{note}</p>}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <h2>4件の候補</h2>
        <p>似すぎを避けて、納得できる4件を編集。</p>
        {queryPlan.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {queryPlan.map((query) => (
              <span key={query} className="tag">{query}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16 }} className="grid-4">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
        {hasSearched && items.length > 0 && items.length < 4 && (
          <p style={{ marginTop: 12 }}>候補が一部不足しています。</p>
        )}
        {hasSearched && items.length === 0 && !error && (
          <p style={{ marginTop: 12 }}>候補が見つかりませんでした。</p>
        )}
      </div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div id="account" className="card">
          <h2>アカウント</h2>
          <p>ログイン情報と全身画像を管理します。</p>
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            <p>ログイン状態の確認は右上のアイコンから。</p>
          </div>
        </div>
        <div className="card">
          <h2>全身画像の保存</h2>
          <p>試着イメージ生成のために、全身画像をローカル保存します。</p>
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="全身画像"
                style={{ width: "100%", borderRadius: 16, border: "1px solid var(--line)" }}
              />
            )}
            <button className="btn btn-secondary" onClick={handleImageClear}>
              画像を削除
            </button>
          </div>
        </div>
        <div className="card">
          <h2>Gemini用プロンプト</h2>
          <p>全身画像を添えて、Gemini/Nano Bananaで生成してください。</p>
          <textarea className="input" rows={8} value={prompt} readOnly />
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button
              className="btn"
              onClick={() => navigator.clipboard.writeText(prompt)}
            >
              プロンプトをコピー
            </button>
            {imageUrl && (
              <a className="btn btn-secondary" href={imageUrl} download="clozly-fullbody">
                画像をダウンロード
              </a>
            )}
          </div>
          <p style={{ marginTop: 12 }}>
            生成画像はClozly側で保存しません。サイズは必ず公式サイズ表で確認してください。
          </p>
        </div>
      </div>
    </section>
  );
}
