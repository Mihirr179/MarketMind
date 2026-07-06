"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  calculateAllocation,
  calculateDailyPnL,
  calculateOverallReturn,
  calculatePortfolioValue,
  calculateTopHolding,
  calculateWorstHolding,
} from "@/utils/portfolioMetrics";

export type PortfolioEnrichedHolding = {
  symbol: string;
  quantity: number;
  averageCost?: number;
  costBasis?: number;
  latestPrice: number;
  previousClose: number;
  currentValue: number;
  dailyPnL: number;
  dailyPnLPct: number;
};

export type PortfolioEnriched = {
  holdings: PortfolioEnrichedHolding[];
  portfolioValue: number | null;
  investedValue: number | null;
  dailyPnL: number | null;
  dailyPnLPct: number | null;
  overallReturnPct: number | null;
  allocation: { holdingsPct: number; watchPct: number };
  holdingsCount: number;
  topHolding: { symbol: string; dailyPct: number } | null;
  worstHolding: { symbol: string; dailyPct: number } | null;
};

type PortfolioDataContextValue = {
  data: PortfolioEnriched | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const PortfolioDataContext = createContext<
  PortfolioDataContextValue | null
>(null);

export function usePortfolioData() {
  const ctx = useContext(PortfolioDataContext);
  if (!ctx) {
    throw new Error(
      "usePortfolioData must be used within PortfolioDataProvider"
    );
  }
  return ctx;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

type PortfolioApiResponse = {
  success?: boolean;
  holdings?: Array<{
    symbol?: string;
    quantity?: number;
    averageCost?: number;
    costBasis?: number;
  }>;
  summary?: {
    holdingsCount?: number;
    totalCostBasis?: number;
  };
};

async function fetchPortfolioOnce(
  signal?: AbortSignal
): Promise<PortfolioApiResponse> {
  const res = await fetch("/api/portfolio", { signal });
  const json = (await res.json()) as PortfolioApiResponse;
  if (!res.ok) {
    const maybeMessage = (json as { message?: unknown } | null)?.message;
    const maybeError = (json as { error?: unknown } | null)?.error;
    throw new Error(
      (typeof maybeMessage === "string" && maybeMessage) ||
        (typeof maybeError === "string" && maybeError) ||
        "Failed to load portfolio"
    );

  }
  return json;
}


type MarketRow = {
  symbol: string;
  price: number | null;
  changePercent: number | null;
  changeAbs: number | null;
};

type MarketChartCandle = { date: string; close: number | null };

async function fetchCurrentPrices(
  symbols: string[],
  signal?: AbortSignal
): Promise<Record<string, number | null>> {
  if (!symbols.length) return {};

  const symbolsParam = symbols.join(",");
  const res = await fetch(
    `/api/market?symbols=${encodeURIComponent(symbolsParam)}`,
    { signal }
  );
  const json = await res.json();
  if (!Array.isArray(json)) return {};

  const out: Record<string, number | null> = {};
  for (const r of json as MarketRow[]) {
    out[r.symbol] = r.price;
  }
  return out;
}

async function fetchPreviousClose(
  symbol: string,
  signal?: AbortSignal
): Promise<number | null> {
  // candles are oldest -> newest (we rely on /api/market-chart behavior)
  const res = await fetch(
    `/api/market-chart?symbol=${encodeURIComponent(
      symbol
    )}&range=1D`,
    { signal }
  );
  const json = await res.json();
  const candles = (json?.candles ?? []) as MarketChartCandle[];

  if (!Array.isArray(candles) || candles.length < 2) return null;

  const prev = candles[candles.length - 2]?.close;
  return typeof prev === "number" && Number.isFinite(prev) ? prev : null;
}

async function fetchLatestAndPrevClose(
  symbols: string[],
  signal?: AbortSignal
): Promise<
  Record<string, { latestPrice: number | null; previousClose: number | null }>
> {
  if (!symbols.length) return {};

  const currentMap = await fetchCurrentPrices(symbols, signal);
  const results: Record<
    string,
    { latestPrice: number | null; previousClose: number | null }
  > = {};

  // Concurrency kept low to reduce rate-limit risk.
  for (const sym of symbols) {
    if (signal?.aborted) break;
    const latestPrice = currentMap[sym] ?? null;
    const previousClose = await fetchPreviousClose(sym, signal);
    results[sym] = { latestPrice, previousClose };
  }

  return results;
}

export function PortfolioDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<PortfolioEnriched | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const reload = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const portfolio = await fetchPortfolioOnce(controller.signal);
      const holdingsRows = Array.isArray(portfolio?.holdings)
        ? (portfolio.holdings as PortfolioApiResponse["holdings"]) ?? []
        : [];


      const holdingsCount =
        typeof portfolio?.summary?.holdingsCount === "number"
          ? portfolio.summary.holdingsCount
          : holdingsRows.length;

      const symbols = uniq(
        holdingsRows
          .map((h) =>
            typeof h?.symbol === "string" ? h.symbol.toUpperCase() : null
          )
          .filter(Boolean)
      ) as string[];

      const priceMap = await fetchLatestAndPrevClose(
        symbols,
        controller.signal
      );

      const enrichedHoldings: PortfolioEnrichedHolding[] = [];

      for (const h of holdingsRows) {
        const symbol = String(h?.symbol || "").toUpperCase();
        const quantity = typeof h?.quantity === "number" ? h.quantity : 0;
        if (!symbol || !Number.isFinite(quantity) || quantity === 0) {
          continue;
        }

        const p = priceMap[symbol];
        const latestPrice = p?.latestPrice ?? null;
        const previousClose = p?.previousClose ?? null;

        if (latestPrice == null || previousClose == null) continue;

        const currentValue = quantity * latestPrice;
        const dailyPnL = calculateDailyPnL({
          currentPrice: latestPrice,
          previousClose,
          quantity,
        });

        const dailyPnLPct =
          previousClose === 0 ? 0 : ((latestPrice - previousClose) / previousClose) * 100;

        enrichedHoldings.push({
          symbol,
          quantity,
          averageCost: typeof h?.averageCost === "number" ? h.averageCost : undefined,
          costBasis: typeof h?.costBasis === "number" ? h.costBasis : undefined,
          latestPrice,
          previousClose,
          currentValue,
          dailyPnL,
          dailyPnLPct,
        });
      }

      const portfolioValue = calculatePortfolioValue({
        holdingsRows: enrichedHoldings.map((x) => ({
          quantity: x.quantity,
          latestPrice: x.latestPrice,
        })),
      });

      const investedValue =
        typeof portfolio?.summary?.totalCostBasis === "number"
          ? portfolio.summary.totalCostBasis
          : null;

      const dailyPnL =
        enrichedHoldings.length > 0
          ? enrichedHoldings.reduce((acc, r) => acc + r.dailyPnL, 0)
          : null;

      const dailyPnLPct =
        dailyPnL != null &&
        investedValue != null &&
        investedValue !== 0
          ? (dailyPnL / investedValue) * 100
          : null;

      const overallReturnPct = calculateOverallReturn({
        currentPortfolioValue: portfolioValue,
        investedValue,
      });

      // For now, watchlistCount isn't available from /api/portfolio.
      // Keep allocation stable; dashboard can pass real watchlist later.
      const allocation = calculateAllocation({
        holdingsCount,
        watchlistCount: 0,
      });

      const topHolding = calculateTopHolding({
        rows: enrichedHoldings.map((h) => ({
          symbol: h.symbol,
          changePercent: h.dailyPnLPct,
        })),
      });

      const worstHolding = calculateWorstHolding({
        rows: enrichedHoldings.map((h) => ({
          symbol: h.symbol,
          changePercent: h.dailyPnLPct,
        })),
      });

      setData({
        holdings: enrichedHoldings,
        portfolioValue,
        investedValue,
        dailyPnL,
        dailyPnLPct,
        overallReturnPct,
        allocation,
        holdingsCount,
        topHolding,
        worstHolding,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load portfolio analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!mounted) return;
      await reload();
    };
    void start();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, []);

  const value = useMemo<PortfolioDataContextValue>(
    () => ({ data, loading, error, reload }),
    [data, loading, error]
  );

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

