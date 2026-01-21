import { CandidateItem, SearchRequest } from "./types";

const placeholderSvg =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='520'>
      <rect width='100%' height='100%' fill='#efe7dd'/>
      <rect x='48' y='60' width='304' height='360' rx='24' fill='#ffffff'/>
      <text x='200' y='460' font-size='20' text-anchor='middle' fill='#b96f3b'>Clozly</text>
    </svg>`
  );

export function mockItems(request: SearchRequest): CandidateItem[] {
  const base = request.itemType.toUpperCase();
  return Array.from({ length: 8 }).map((_, index) => ({
    id: `mock-${index}`,
    site: index % 2 === 0 ? "amazon" : "zozo",
    name: `${base} curated ${index + 1}`,
    price: request.budgetMin + index * 1200,
    imageUrl: placeholderSvg,
    url: "https://example.com",
    brand: "Clozly Studio",
    summary: "サンプル候補（スクレイピング未接続）"
  }));
}
