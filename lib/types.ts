export type ItemType =
  | "tops"
  | "outer"
  | "bottoms"
  | "onepiece"
  | "shoes"
  | "bags"
  | "others";

export type SearchRequest = {
  freeText: string;
  itemType: ItemType;
  budgetMin: number;
  budgetMax: number;
  gender?: "mens" | "womens";
  season?: string[];
  color?: string[];
  material?: string[];
  mood?: string;
  exclude?: string[];
};

export type CandidateItem = {
  id: string;
  site: "amazon" | "zozo" | "rakuten";
  name: string;
  price: number;
  imageUrl?: string;
  url: string;
  brand?: string;
  summary?: string;
  score?: number;
  sizePrediction?: string;
};

export type SearchResponse = {
  queryPlan: string[];
  items: CandidateItem[];
  usedCache: boolean;
  note?: string;
};

export type UserProfile = {
  height?: string;
  weight?: string;
  usualSize?: string;
  fitPreference?: "ゆるめ" | "ジャスト" | "タイト";
  stylePreferences?: string[];
  bodyType?: string;
};
