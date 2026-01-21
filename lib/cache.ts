import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SearchRequest, SearchResponse } from "./types";
import { normalizeText } from "./query";

const memoryCache = new Map<string, { value: SearchResponse; expiresAt: number }>();

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function buildCacheKey(request: SearchRequest) {
  const maxKey = request.budgetMax >= 20000 ? "unlimited" : Math.floor(request.budgetMax / 1000) * 1000;
  const normalizeList = (values?: string[]) =>
    (values ?? [])
      .map((value) => normalizeText(value))
      .filter(Boolean)
      .sort()
      .join(",");
  return [
    "v1",
    request.itemType,
    Math.floor(request.budgetMin / 1000) * 1000,
    maxKey,
    request.gender ?? "",
    normalizeList(request.season),
    normalizeList(request.color),
    normalizeList(request.material),
    normalizeText(request.mood ?? ""),
    normalizeText(request.freeText)
  ].join(":");
}

export async function readCache(key: string): Promise<SearchResponse | null> {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > now) return mem.value;

  const client = supabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from("cache")
    .select("payload, expires_at")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < now) return null;

  return data.payload as SearchResponse;
}

export async function writeCache(key: string, value: SearchResponse, ttlHours = 12) {
  const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;
  memoryCache.set(key, { value, expiresAt });

  const client = supabaseClient();
  if (!client) return;

  await client.from("cache").upsert({
    key,
    payload: value,
    expires_at: new Date(expiresAt).toISOString()
  });
}
