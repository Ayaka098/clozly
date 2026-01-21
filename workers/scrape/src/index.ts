export interface Env {
  ALLOWED_ORIGINS?: string;
}

type ScrapeRequest = {
  queries: string[];
};

type CandidateItem = {
  id: string;
  site: "amazon" | "zozo";
  name: string;
  price: number;
  imageUrl?: string;
  url: string;
  brand?: string;
  summary?: string;
};

const AMAZON_BASE = "https://www.amazon.co.jp/s?k=";
const ZOZO_BASE = "https://zozo.jp/search/?p_keyv=";

function buildSearchUrls(queries: string[]) {
  return queries.flatMap((query) => [
    { site: "amazon" as const, url: `${AMAZON_BASE}${encodeURIComponent(query)}` },
    { site: "zozo" as const, url: `${ZOZO_BASE}${encodeURIComponent(query)}` }
  ]);
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ClozlyBot/1.0)"
    }
  });
  return response.text();
}

function parseAmazon(html: string): CandidateItem[] {
  const items: CandidateItem[] = [];
  const matches = html.match(/data-asin=\"([A-Z0-9]{10})\"[\s\S]*?<h2[^>]*>\s*<a[^>]*href=\"([^\"]+)\"[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?a-price-whole\">([^<]+)<\/span>[\s\S]*?s-image\" src=\"([^\"]+)\"/g);
  if (!matches) return items;

  for (const match of matches.slice(0, 20)) {
    const asin = /data-asin=\"([A-Z0-9]{10})\"/.exec(match)?.[1];
    const href = /href=\"([^\"]+)\"/.exec(match)?.[1];
    const name = /<span[^>]*>([^<]+)<\/span>/.exec(match)?.[1];
    const priceRaw = /a-price-whole\">([^<]+)<\/span>/.exec(match)?.[1];
    const image = /s-image\" src=\"([^\"]+)\"/.exec(match)?.[1];
    if (!asin || !href || !name || !priceRaw) continue;
    items.push({
      id: `amazon-${asin}`,
      site: "amazon",
      name: name.trim(),
      price: Number(priceRaw.replace(/,/g, "")) || 0,
      imageUrl: image,
      url: `https://www.amazon.co.jp${href}`
    });
  }
  return items;
}

function parseZozo(html: string): CandidateItem[] {
  const items: CandidateItem[] = [];
  const matches = html.match(/data-goods-id=\"(\d+)\"[\s\S]*?item\__name\">([^<]+)<\/a>[\s\S]*?item\__price\">[^0-9]*([0-9,]+)[\s\S]*?<img[^>]*data-src=\"([^\"]+)\"/g);
  if (!matches) return items;

  for (const match of matches.slice(0, 20)) {
    const id = /data-goods-id=\"(\d+)\"/.exec(match)?.[1];
    const name = /item\__name\">([^<]+)<\/a>/.exec(match)?.[1];
    const priceRaw = /item\__price\">[^0-9]*([0-9,]+)/.exec(match)?.[1];
    const image = /data-src=\"([^\"]+)\"/.exec(match)?.[1];
    if (!id || !name || !priceRaw) continue;
    items.push({
      id: `zozo-${id}`,
      site: "zozo",
      name: name.trim(),
      price: Number(priceRaw.replace(/,/g, "")) || 0,
      imageUrl: image,
      url: `https://zozo.jp/shop/goods/${id}/`
    });
  }
  return items;
}

async function scrapeAll(queries: string[]) {
  const urls = buildSearchUrls(queries);
  const results: CandidateItem[] = [];

  for (const target of urls) {
    const html = await fetchHtml(target.url);
    const parsed = target.site === "amazon" ? parseAmazon(html) : parseZozo(html);
    results.push(...parsed);
  }

  return results;
}

function withCors(request: Request, response: Response, env: Env) {
  const origin = request.headers.get("origin") ?? "";
  const allow = env.ALLOWED_ORIGINS?.split(",").map((value) => value.trim());
  const allowed = allow?.includes(origin) ? origin : "*";
  response.headers.set("Access-Control-Allow-Origin", allowed);
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }), env);
    }

    if (request.method !== "POST") {
      return withCors(request, new Response("Method Not Allowed", { status: 405 }), env);
    }

    const body = (await request.json()) as ScrapeRequest;
    const queries = Array.isArray(body.queries) ? body.queries.slice(0, 6) : [];
    if (queries.length === 0) {
      return withCors(request, new Response("Bad Request", { status: 400 }), env);
    }

    const items = await scrapeAll(queries);
    return withCors(
      request,
      new Response(JSON.stringify({ items }), {
        headers: { "Content-Type": "application/json" }
      }),
      env
    );
  }
};
