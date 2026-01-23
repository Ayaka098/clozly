"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchRequest, SearchResponse } from "@/lib/types";
import { loadSearchSession, saveSearchSession } from "@/lib/searchSession";
import ProductCard from "@/components/ProductCard";
import { saveTryonSelection } from "@/lib/tryonSession";

type StoredSession = {
  request: SearchRequest;
  response: SearchResponse;
};

export default function ResultsClient() {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadSearchSession();
    if (stored) {
      setSession({ request: stored.request, response: stored.response });
    }
  }, []);

  const handleResearch = async () => {
    if (!session || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session.request,
          exclude: session.request.exclude?.filter(Boolean)
        })
      });
      if (!response.ok) throw new Error("Search failed");
      const data = (await response.json()) as SearchResponse;
      saveSearchSession(session.request, data);
      setSession({ request: session.request, response: data });
    } catch (err) {
      setError("検索結果がありませんでした。条件を変えて再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  const buildTryonDescription = (item: SearchResponse["items"][number]) => {
    const parts = [`商品名: ${item.name}`];
    if (item.brand) parts.push(`ブランド: ${item.brand}`);
    if (item.price) parts.push(`価格: ${item.price.toLocaleString()}円`);
    return parts.join(" / ");
  };

  const handleTryon = (item: SearchResponse["items"][number]) => {
    const description = buildTryonDescription(item);
    saveTryonSelection(description, {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      url: item.url,
      imageUrl: item.imageUrl
        ? `/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`
        : undefined,
      imageOriginalUrl: item.imageUrl,
      summary: item.summary
    });
    router.push("/tryon");
  };

  if (!session) {
    return (
      <section className="fade-in">
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <h2>見つかりませんでした...</h2>
          <p>候補が見つかりませんでした。検索条件を変えて再度探してみてください。</p>
          <button className="btn" onClick={() => router.push("/search")}>
            探すページへ
          </button>
        </div>
      </section>
    );
  }

  const { response } = session;
  const items = response.items;

  return (
    <section className="fade-in" style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ display: "grid", gap: 16 }}>
        <h2>{items.length === 0 ? "見つかりませんでした..." : "あなたにぴったりのアイテムが見つかりました！"}</h2>
        <div className="results-grid">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} onTryon={handleTryon} />
          ))}
        </div>
        {response.note && <p style={{ marginTop: 8 }}>{response.note}</p>}
        {items.length === 0 && !response.note && (
          <p style={{ marginTop: 8 }}>
            候補が見つかりませんでした。検索条件を変えて再度探してみてください。
          </p>
        )}
      </div>
      <div className="results-actions">
        <button className="btn" onClick={handleResearch} disabled={loading}>
          {loading ? (
            <span className="btn-loading">
              <span className="btn-spinner" aria-hidden="true" />
              再検索中...
            </span>
          ) : (
            "再検索"
          )}
        </button>
        <button className="btn btn-secondary" onClick={() => router.push("/search")}>
          戻る
        </button>
      </div>
      {error && (
        <div className="card">
          <p>{error}</p>
        </div>
      )}
    </section>
  );
}
