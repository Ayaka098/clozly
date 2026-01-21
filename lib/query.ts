import { SearchRequest } from "./types";

const itemSynonyms: Record<string, string[]> = {
  tops: ["トップス", "ブラウス", "カットソー", "ニット"],
  outer: ["アウター", "コート", "ジャケット"],
  bottoms: ["ボトムス", "パンツ", "スカート"],
  onepiece: ["ワンピース", "ドレス"],
  shoes: ["シューズ", "スニーカー", "パンプス"],
  bags: ["バッグ", "トート", "ショルダー"],
  others: ["服", "アイテム"]
};

export function normalizeText(input: string) {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\n\r]/g, " ");
}

const stopWords = [
  "欲しい",
  "ほしい",
  "探し",
  "探して",
  "探す",
  "感じ",
  "みたい",
  "っぽい",
  "系",
  "風"
];

function extractKeywords(text: string) {
  const normalized = normalizeText(text);
  const tokens = normalized.split(/[,\s、/]+/).filter(Boolean);
  const filtered = tokens.filter(
    (token) => !stopWords.some((word) => token.includes(word))
  );
  if (filtered.length === 0 && normalized) return [normalized];
  return filtered;
}

const itemLabels: Record<string, string[]> = {
  tops: ["トップス", "ブラウス", "カットソー", "ニット"],
  outer: ["アウター", "コート", "ジャケット"],
  bottoms: ["ボトムス", "パンツ", "スカート"],
  onepiece: ["ワンピース", "ドレス"],
  shoes: ["シューズ", "スニーカー", "パンプス"],
  bags: ["バッグ", "トート", "ショルダー"],
  others: ["服", "アイテム"]
};

export function buildMainQuery(request: SearchRequest) {
  const keywords = extractKeywords(request.freeText).slice(0, 2);
  const label = itemLabels[request.itemType]?.[0] ?? "服";
  const tokens = [label, ...keywords];
  if (request.gender === "mens") tokens.push("メンズ");
  if (request.gender === "womens") tokens.push("レディース");
  if (request.color?.length) tokens.push(request.color[0]);
  return tokens.filter(Boolean).join(" ");
}

export function buildRescueQuery(request: SearchRequest) {
  const keywords = extractKeywords(request.freeText).slice(0, 1);
  const label = itemLabels[request.itemType]?.[1] ?? itemLabels[request.itemType]?.[0] ?? "服";
  const tokens = [label, ...keywords];
  if (request.gender === "mens") tokens.push("メンズ");
  if (request.gender === "womens") tokens.push("レディース");
  return tokens.filter(Boolean).join(" ");
}

export function buildQueries(request: SearchRequest) {
  const base: string[] = [];
  const itemWords = itemSynonyms[request.itemType] ?? ["服"];
  base.push(...itemWords.slice(0, 2));

  if (request.color?.length) base.push(request.color[0]);
  if (request.season?.length) base.push(request.season[0]);
  if (request.mood) base.push(request.mood);
  if (request.material?.length) base.push(request.material[0]);

  const normalized = normalizeText(request.freeText);
  const tokens = normalized.split(" ").filter(Boolean);

  const queries = new Set<string>();
  queries.add([base[0], ...tokens.slice(0, 2)].join(" "));
  queries.add([base[1] ?? base[0], ...tokens.slice(0, 2)].join(" "));
  queries.add([base[0], request.mood, request.color?.[0]].filter(Boolean).join(" "));
  queries.add([base[0], request.season?.[0], request.material?.[0]].filter(Boolean).join(" "));
  queries.add(tokens.join(" "));

  return Array.from(queries).filter((query) => query.length > 1).slice(0, 6);
}
