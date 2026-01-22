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

  if (request.color?.some((color) => text.includes(color))) score += 10;
  if (request.season?.some((season) => text.includes(season))) score += 10;
  if (request.material?.some((material) => text.includes(material))) score += 10;
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
  const candidateImage = normalizeImageUrl(candidate.imageUrl);
  for (const item of selected) {
    if (item.brand && candidate.brand && item.brand === candidate.brand) penalty += 10;
    if (item.name.split(" ")[0] === candidate.name.split(" ")[0]) penalty += 8;
    const itemImage = normalizeImageUrl(item.imageUrl);
    if (itemImage && candidateImage && itemImage === candidateImage) penalty += 200;
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
  const usedImages = new Set<string>();
  const usedUrls = new Set<string>();
  const usedNameKeys = new Set<string>();
  for (const item of scored) {
    if (item.url && usedUrls.has(item.url)) continue;
    const imageKey = normalizeImageUrl(item.imageUrl);
    if (imageKey && usedImages.has(imageKey)) continue;
    const nameKey = normalizeNameKey(item.name, item.brand);
    if (nameKey && usedNameKeys.has(nameKey)) continue;
    const penalty = diversityPenalty(selected, item);
    if ((item.score ?? 0) - penalty < 40) continue;
    selected.push({ ...item, score: (item.score ?? 0) - penalty });
    if (item.url) usedUrls.add(item.url);
    if (imageKey) usedImages.add(imageKey);
    if (nameKey) usedNameKeys.add(nameKey);
    if (selected.length === 4) break;
  }

  return selected;
}

function normalizeImageUrl(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const tail = segments.slice(-2).join("/");
    return tail.toLowerCase();
  } catch {
    const stripped = url.split("?")[0];
    return stripped.replace(/_ex=\d+x\d+/, "").toLowerCase();
  }
}

function normalizeNameKey(name?: string, brand?: string) {
  if (!name) return "";
  const base = `${brand ?? ""} ${name}`
    .toLowerCase()
    .replace(/[\\s\\-_,.()【】［］・]/g, "");
  return base.slice(0, 80);
}
