import YahooFinance from "yahoo-finance2";

type MarketDetails = {
  symbol: string;
  currency?: string;
  name?: string;

  price: number;
  dailyChange: number;
  dailyChangePercent: number;
  volume: number;

  week52High: number;
  week52Low: number;

  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  beta: number | null;

  sector: string | null;
  industry: string | null;
};

function toFiniteNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (n == null) return null;
  if (!Number.isFinite(n)) return null;
  return n;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const yahooFinance = new YahooFinance();

export async function getMarketDetails(rawSymbol: string): Promise<MarketDetails> {
  const symbol = rawSymbol.trim().toUpperCase();
  if (!symbol) throw new Error("Invalid ticker");

  // Quote
  const quote: Record<string, unknown> = (await yahooFinance.quote(symbol)) as Record<string, unknown>;

  const price = toFiniteNumber(quote?.regularMarketPrice);
  const volume = toFiniteNumber(quote?.regularMarketVolume);
  const dailyChange = toFiniteNumber(quote?.regularMarketChange);
  const dailyChangePercent = toFiniteNumber(quote?.regularMarketChangePercent);

  // 52W
  const week52High = toFiniteNumber(quote?.fiftyTwoWeekHigh);
  const week52Low = toFiniteNumber(quote?.fiftyTwoWeekLow);

  // Profile / fundamentals. yahoo-finance2 may return these from quoteSummary parts.
  // Some fields may be missing depending on upstream; we return null if absent.
  const marketCap = toFiniteNumber(quote?.marketCap);
  const peRatio = toFiniteNumber(quote?.trailingPE);
  const eps = toFiniteNumber(quote?.trailingEps);
  const beta = toFiniteNumber(quote?.beta);
  const sector = typeof quote?.sector === "string" ? quote.sector : null;
  const industry = typeof quote?.industry === "string" ? quote.industry : null;

  if (price == null || dailyChange == null || dailyChangePercent == null || volume == null) {
    throw new Error("Market data unavailable for this ticker");
  }

  return {
    symbol: String(quote?.symbol || symbol),
    currency: typeof quote?.currency === "string" ? quote.currency : undefined,
    name: typeof quote?.longName === "string" ? quote.longName : undefined,

    price,
    dailyChange: round2(dailyChange),
    dailyChangePercent: round2(dailyChangePercent),
    volume,

    week52High: week52High ?? NaN,
    week52Low: week52Low ?? NaN,

    marketCap: marketCap ?? NaN,
    peRatio: peRatio ?? null,
    eps: eps ?? null,
    beta: beta ?? null,

    sector,
    industry,
  };
}

