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
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\n\r]/g, " ");
}

export function buildQueries(request: SearchRequest) {
  const base: string[] = [];
  const itemWords = itemSynonyms[request.itemType] ?? ["服"];
  base.push(...itemWords.slice(0, 2));

  if (request.color) base.push(request.color);
  if (request.season) base.push(request.season);
  if (request.mood) base.push(request.mood);
  if (request.material) base.push(request.material);

  const normalized = normalizeText(request.freeText);
  const tokens = normalized.split(" ").filter(Boolean);

  const queries = new Set<string>();
  queries.add([base[0], ...tokens.slice(0, 2)].join(" "));
  queries.add([base[1] ?? base[0], ...tokens.slice(0, 2)].join(" "));
  queries.add([base[0], request.mood, request.color].filter(Boolean).join(" "));
  queries.add([base[0], request.season, request.material].filter(Boolean).join(" "));
  queries.add(tokens.join(" "));

  return Array.from(queries).filter((query) => query.length > 1).slice(0, 6);
}
