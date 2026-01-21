import { NextResponse } from "next/server";
import { z } from "zod";
import { buildQueries } from "@/lib/query";
import { readCache, writeCache, buildCacheKey } from "@/lib/cache";
import { fetchCandidates } from "@/lib/worker";
import { mockItems } from "@/lib/mock";
import { selectTopFour } from "@/lib/scoring";

const requestSchema = z.object({
  freeText: z.string().min(1),
  itemType: z.string(),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  season: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  mood: z.string().optional(),
  exclude: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input = parsed.data;
  const cacheKey = buildCacheKey(input);
  const cached = await readCache(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, usedCache: true });
  }

  const queries = buildQueries(input);
  let candidates = await fetchCandidates(queries).catch(() => null);
  if (!candidates || candidates.length === 0) {
    candidates = mockItems(input);
  }

  const items = selectTopFour(candidates, input).map((item, index) => ({
    ...item,
    sizePrediction: index % 2 === 0 ? "M" : "L"
  }));

  const payload = { queryPlan: queries, items, usedCache: false };
  await writeCache(cacheKey, payload);

  return NextResponse.json(payload);
}
