import { CandidateItem } from "@/lib/types";

export default function ProductCard({ item }: { item: CandidateItem }) {
  return (
    <div className="card" style={{ display: "grid", gap: 10 }}>
      <div style={{ aspectRatio: "3 / 4", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#efe7dd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            画像なし
          </div>
        )}
      </div>
      <div>
        <p style={{ fontWeight: 600, color: "var(--ink)" }}>{item.name}</p>
        <p>¥{item.price.toLocaleString()}</p>
        <p>{item.brand ?? item.site}</p>
        <p>サイズ予測: {item.sizePrediction ?? "M"}</p>
        <p style={{ fontSize: "0.8rem" }}>
          購入前に公式サイズ表で確認してください。
        </p>
      </div>
      <a className="btn" href={item.url} target="_blank" rel="noreferrer">
        購入ページへ
      </a>
    </div>
  );
}
