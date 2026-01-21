import { CandidateItem, SearchRequest } from "./types";

const fixedNgWords = ["福袋", "まとめ売り", "訳あり", "セット", "在庫処分"];

export function shouldExclude(item: CandidateItem, request: SearchRequest) {
  const text = `${item.name} ${item.summary ?? ""}`;
  if (fixedNgWords.some((word) => text.includes(word))) return true;
  if (request.exclude?.some((word) => word && text.includes(word))) return true;
  if (item.price < request.budgetMin || item.price > request.budgetMax) return true;
  return false;
}

export function scoreCandidate(item: CandidateItem, request: SearchRequest) {
  let score = 0;
  const text = `${item.name} ${item.summary ?? ""}`;

  score += 30; // itemType is enforced by query
  score += 20; // budget match already filtered

  if (request.color && text.includes(request.color)) score += 10;
  if (request.season && text.includes(request.season)) score += 10;
  if (request.material && text.includes(request.material)) score += 10;
  if (request.mood && text.includes(request.mood)) score += 10;

  const keywords = request.freeText.split(/\s+/).filter(Boolean);
  const hitCount = keywords.filter((word) => text.includes(word)).length;
  score += Math.min(20, hitCount * 5);

  const mid = (request.budgetMin + request.budgetMax) / 2;
  const dist = Math.abs(item.price - mid);
  score += Math.max(0, 5 - dist / 2000);

  return Math.round(score);
}

function diversityPenalty(selected: CandidateItem[], candidate: CandidateItem) {
  let penalty = 0;
  for (const item of selected) {
    if (item.brand && candidate.brand && item.brand === candidate.brand) penalty += 10;
    if (item.name.split(" ")[0] === candidate.name.split(" ")[0]) penalty += 8;
    if (item.imageUrl && candidate.imageUrl && item.imageUrl === candidate.imageUrl) penalty += 20;
  }
  return penalty;
}

export function selectTopFour(
  candidates: CandidateItem[],
  request: SearchRequest
) {
  const scored = candidates
    .filter((item) => !shouldExclude(item, request))
    .map((item) => ({ ...item, score: scoreCandidate(item, request) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const selected: CandidateItem[] = [];
  for (const item of scored) {
    const penalty = diversityPenalty(selected, item);
    if ((item.score ?? 0) - penalty < 40) continue;
    selected.push({ ...item, score: (item.score ?? 0) - penalty });
    if (selected.length === 4) break;
  }

  return selected;
}
