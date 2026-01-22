import { CandidateItem } from "@/lib/types";

type ProductCardProps = {
  item: CandidateItem;
  onTryon?: (item: CandidateItem) => void;
};

export default function ProductCard({ item, onTryon }: ProductCardProps) {
  return (
    <div className="card product-card">
      <div className="product-image">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
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
      <div className="product-actions">
        <a className="btn" href={item.url} target="_blank" rel="noreferrer">
          購入ページへ
        </a>
        {onTryon && (
          <button className="btn btn-secondary" onClick={() => onTryon(item)} type="button">
            この服を試着
          </button>
        )}
      </div>
    </div>
  );
}
