import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMainQuery, buildRescueQuery } from "@/lib/query";
import { readCache, writeCache, buildCacheKey } from "@/lib/cache";
import { fetchRakutenCandidates } from "@/lib/rakuten";
import { selectTopFour, shouldExclude } from "@/lib/scoring";
import type { SearchRequest } from "@/lib/types";

const itemTypes = [
  "tops",
  "outer",
  "bottoms",
  "onepiece",
  "shoes",
  "bags",
  "others"
] as const;

const requestSchema = z.object({
  freeText: z.string().min(1),
  itemType: z.enum(itemTypes),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  gender: z.enum(["mens", "womens"]).optional(),
  season: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  material: z.array(z.string()).optional(),
  mood: z.string().optional(),
  exclude: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input: SearchRequest = parsed.data;
  const effectiveInput = {
    ...input,
    budgetMax: input.budgetMax >= 20000 ? Number.MAX_SAFE_INTEGER : input.budgetMax
  };
  const cacheKey = buildCacheKey(effectiveInput);
  const cached = await readCache(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, usedCache: true });
  }

  const queryPlan: string[] = [];
  const mainQuery = buildMainQuery(effectiveInput);
  queryPlan.push(mainQuery);

  let candidates = await fetchRakutenCandidates({
    keyword: mainQuery,
    minPrice: effectiveInput.budgetMin,
    maxPrice: effectiveInput.budgetMax,
    hits: 30
  }).catch(() => null);

  if (!candidates) {
    return NextResponse.json({
      queryPlan,
      items: [],
      usedCache: false,
      note: "候補を取得できませんでした"
    });
  }

  const filtered = candidates.filter((item) => !shouldExclude(item, effectiveInput));
  let items = selectTopFour(candidates, effectiveInput);

  const needsRescue = filtered.length < 10 || items.length < 4;
  if (needsRescue) {
    const rescueQuery = buildRescueQuery(effectiveInput);
    if (rescueQuery && rescueQuery !== mainQuery) {
      queryPlan.push(rescueQuery);
      const expandedMin = Math.max(0, Math.floor(effectiveInput.budgetMin * 0.8));
      const expandedMax =
        effectiveInput.budgetMax >= Number.MAX_SAFE_INTEGER
          ? Number.MAX_SAFE_INTEGER
          : Math.floor(effectiveInput.budgetMax * 1.2);
      const rescueCandidates = await fetchRakutenCandidates({
        keyword: rescueQuery,
        minPrice: expandedMin,
        maxPrice: expandedMax,
        hits: 30
      }).catch(() => null);

      if (rescueCandidates?.length) {
        const deduped = new Map<string, typeof candidates[number]>();
        for (const item of [...candidates, ...rescueCandidates]) {
          deduped.set(item.url, item);
        }
        candidates = Array.from(deduped.values());
        items = selectTopFour(candidates, effectiveInput);
      }
    }
  }

  const payload = {
    queryPlan,
    items: items.map((item, index) => ({
      ...item,
      sizePrediction: index % 2 === 0 ? "M" : "L"
    })),
    usedCache: false,
    note: items.length < 4 ? "候補が不足しています" : undefined
  };

  await writeCache(cacheKey, payload);

  return NextResponse.json(payload);
}
