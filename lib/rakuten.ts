import { CandidateItem } from "./types";

type RakutenItem = {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  shopName?: string;
  itemCaption?: string;
  mediumImageUrls?: { imageUrl: string }[];
  smallImageUrls?: { imageUrl: string }[];
};

type RakutenResponse = {
  Items?: { Item: RakutenItem }[];
};

const endpoint = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706";
const IMAGE_SIZE = "800x800";

const normalizeImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.includes("_ex=")) {
    return url.replace(/_ex=\d+x\d+/, `_ex=${IMAGE_SIZE}`);
  }
  if (url.includes("?")) {
    return `${url}&_ex=${IMAGE_SIZE}`;
  }
  return `${url}?_ex=${IMAGE_SIZE}`;
};

export async function fetchRakutenCandidates({
  keyword,
  minPrice,
  maxPrice,
  hits = 30
}: {
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  hits?: number;
}): Promise<CandidateItem[] | null> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  if (!applicationId) return null;

  const url = new URL(endpoint);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("format", "json");
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("hits", String(hits));
  url.searchParams.set("imageFlag", "1");

  if (minPrice && minPrice > 0) {
    url.searchParams.set("minPrice", String(Math.floor(minPrice)));
  }
  if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
    url.searchParams.set("maxPrice", String(Math.floor(maxPrice)));
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Rakuten error: ${response.status}`);
  }

  const data = (await response.json()) as RakutenResponse;
  const items = data.Items ?? [];
  return items.map(({ Item }) => ({
    id: Item.itemCode,
    site: "rakuten",
    name: Item.itemName,
    price: Item.itemPrice,
    imageUrl: normalizeImageUrl(
      Item.mediumImageUrls?.[0]?.imageUrl ?? Item.smallImageUrls?.[0]?.imageUrl
    ),
    url: Item.itemUrl,
    brand: Item.shopName,
    summary: Item.itemCaption
  }));
}
