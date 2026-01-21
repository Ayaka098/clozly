import { CandidateItem } from "./types";

export async function fetchCandidates(queries: string[]) {
  const endpoint = process.env.WORKER_SCRAPE_URL;
  if (!endpoint) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queries })
  });

  if (!response.ok) {
    throw new Error(`Worker error: ${response.status}`);
  }

  const data = (await response.json()) as { items: CandidateItem[] };
  return data.items;
}
