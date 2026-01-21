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
  season?: string[];
  color?: string[];
  material?: string[];
  mood?: string;
  exclude?: string[];
};

export type CandidateItem = {
  id: string;
  site: "amazon" | "zozo";
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
};

export type UserProfile = {
  height?: string;
  weight?: string;
  usualSize?: string;
  bodyType?: string;
};
