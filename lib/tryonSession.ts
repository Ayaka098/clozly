import type { CandidateItem } from "@/lib/types";

type TryonSelection = {
  description: string;
  selectedItem?: Pick<
    CandidateItem,
    "id" | "name" | "brand" | "price" | "url" | "imageUrl" | "summary"
  > & {
    imageOriginalUrl?: string;
  };
  savedAt: number;
};

const STORAGE_KEY = "clozly:tryonSelection";

export const saveTryonSelection = (
  description: string,
  selectedItem?: TryonSelection["selectedItem"]
) => {
  if (typeof window === "undefined") return;
  const payload: TryonSelection = { description, selectedItem, savedAt: Date.now() };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const loadTryonSelection = (): TryonSelection | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TryonSelection;
  } catch {
    return null;
  }
};
