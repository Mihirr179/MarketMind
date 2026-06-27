import { SEARCH_UNIVERSE_ITEMS } from "@/lib/search/universes";

function normalize(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function scoreItem(query, item) {
  const q = normalize(query);
  const symbol = normalize(item.symbol);
  const name = normalize(item.name);
  if (!q) return 0;

  // Exact symbol match wins.
  if (symbol === q) return 1000;

  // Prefix matches.
  if (symbol.startsWith(q)) return 700;
  if (name.startsWith(q)) return 600;

  // Token matches.
  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length) {
    let tokenHits = 0;
    for (const t of qTokens) {
      if (symbol.includes(t) || name.includes(t)) tokenHits += 1;
    }
    if (tokenHits > 0) return 400 + tokenHits * 20;
  }

  // Includes matches.
  if (name.includes(q)) return 250;
  if (symbol.includes(q)) return 200;

  return 0;
}

export async function GET(request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";

  const query = q.trim();
  if (!query) {
    return Response.json({ results: [] });
  }

  // Simple in-process search (universe is small enough).
  const scored = [];
  for (const item of SEARCH_UNIVERSE_ITEMS) {
    const s = scoreItem(query, item);
    if (s > 0) scored.push({ item, score: s });
  }

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, 10).map(({ item }) => ({
    symbol: item.symbol,
    name: item.name,
    exchange: item.exchange,
    logoUrl: item.logoUrl,
  }));

  return Response.json({ results });
}

