import type { SearchRequest, SearchResponse } from "@/lib/types";

type SearchSession = {
  request: SearchRequest;
  response: SearchResponse;
  savedAt: number;
};

const STORAGE_KEY = "clozly:lastSearch";

export const saveSearchSession = (request: SearchRequest, response: SearchResponse) => {
  if (typeof window === "undefined") return;
  const payload: SearchSession = { request, response, savedAt: Date.now() };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const loadSearchSession = (): SearchSession | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SearchSession;
  } catch {
    return null;
  }
};

export const clearSearchSession = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
};
