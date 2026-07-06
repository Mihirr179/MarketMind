export type PortfolioHoldingRow = {
  symbol?: string;
  companyName?: string;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  value?: number; // legacy field from API rows
  changePercent?: number;
  changeAbs?: number;
};

export type PortfolioSummary = {
  totalValue: number | null;
  investedValue: number | null;
  dailyPnL: number | null;
  dailyPnLPct: number | null;
  overallReturnPct: number | null;
  holdingsCount: number;
};

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function calculatePortfolioValue(params: {
  portfolioValue?: number | null;
  holdingsRows?: Array<{ quantity?: number; latestPrice?: number }>;
}): number | null {
  if (isFiniteNumber(params.portfolioValue)) return params.portfolioValue;

  const rows = Array.isArray(params.holdingsRows) ? params.holdingsRows : [];
  if (!rows.length) return null;

  // SUM(quantity × latest price)
  const total = rows.reduce((acc, r) => {
    const q = isFiniteNumber(r.quantity) ? r.quantity : 0;
    const p = isFiniteNumber(r.latestPrice) ? r.latestPrice : 0;
    return acc + q * p;
  }, 0);

  return total || null;
}

export function calculateDailyPnL(params: {
  currentPrice: number;
  previousClose: number;
  quantity: number;
}): number {
  const { currentPrice, previousClose, quantity } = params;
  return (currentPrice - previousClose) * quantity;
}

export function calculateOverallReturn(params: {
  currentPortfolioValue: number | null;
  investedValue: number | null;
}): number | null {
  const { currentPortfolioValue, investedValue } = params;
  if (!isFiniteNumber(currentPortfolioValue) || !isFiniteNumber(investedValue)) return null;
  if (investedValue === 0) return null;
  return ((currentPortfolioValue - investedValue) / investedValue) * 100;
}

export function calculateAllocation(params: {
  holdingsCount: number;
  watchlistCount: number;
}): { holdingsPct: number; watchPct: number } {
  const h = isFiniteNumber(params.holdingsCount) ? params.holdingsCount : 0;
  const w = isFiniteNumber(params.watchlistCount) ? params.watchlistCount : 0;
  const total = Math.max(1, h + w);
  const holdingsPct = (h / total) * 100;
  const watchPct = 100 - holdingsPct;
  return { holdingsPct, watchPct };
}

export function calculateTopHolding(params: {
  rows: Array<{ symbol?: string; changePercent?: number }>;
}): { symbol: string; dailyPct: number } | null {
  const rows = Array.isArray(params.rows) ? params.rows : [];
  const best = rows
    .filter((r) => isFiniteNumber(r.changePercent))
    .sort((a, b) => (b.changePercent ?? -Infinity) - (a.changePercent ?? -Infinity))[0];
  if (!best?.symbol || !isFiniteNumber(best.changePercent)) return null;
  return { symbol: best.symbol, dailyPct: best.changePercent };
}

export function calculateWorstHolding(params: {
  rows: Array<{ symbol?: string; changePercent?: number }>;
}): { symbol: string; dailyPct: number } | null {
  const rows = Array.isArray(params.rows) ? params.rows : [];
  const worst = rows
    .filter((r) => isFiniteNumber(r.changePercent))
    .sort((a, b) => (a.changePercent ?? Infinity) - (b.changePercent ?? Infinity))[0];
  if (!worst?.symbol || !isFiniteNumber(worst.changePercent)) return null;
  return { symbol: worst.symbol, dailyPct: worst.changePercent };
}

export type PortfolioRisk = {
  riskLevel: "Low" | "Moderate" | "High";
  riskScore: number; // 0..100
  volatilityPct?: number | null;
  concentration?: number | null;
  beta?: number | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeStdDev(values: number[]): number | null {
  if (!values.length) return null;
  const finite = values.filter((v) => isFiniteNumber(v));
  if (!finite.length) return null;

  const mean = finite.reduce((a, b) => a + b, 0) / finite.length;
  const variance = finite.reduce((acc, v) => acc + (v - mean) ** 2, 0) / finite.length;
  const sd = Math.sqrt(variance);
  return Number.isFinite(sd) ? sd : null;
}

/**
 * Calculates portfolio risk using ONLY enriched portfolio data.
 * Returns null if required fields are missing.
 */
export function calculatePortfolioRisk(
  portfolio:
    | {
        holdings: Array<{
          symbol: string;
          currentValue?: number;
          dailyPnLPct?: number | null;
        }>;
        dailyPnLPct?: number | null;
        holdingsCount: number;
      }
    | null
): PortfolioRisk | null {
  if (!portfolio) return null;

  const holdings = Array.isArray(portfolio.holdings) ? portfolio.holdings : [];
  if (!holdings.length) return null;

  // Concentration: use currentValue weights if present
  const values = holdings.map((h) => (isFiniteNumber(h.currentValue) ? (h.currentValue as number) : null));
  const finiteValues = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const hasValues = finiteValues.length === holdings.length && finiteValues.length > 0;

  const totalValue = hasValues ? finiteValues.reduce((a, b) => a + b, 0) : null;
  if (hasValues && (!totalValue || !Number.isFinite(totalValue))) return null;

  const topWeight = hasValues
    ? Math.max(
        ...holdings.map((h) => {
          const v = isFiniteNumber(h.currentValue) ? (h.currentValue as number) : 0;
          return totalValue ? v / totalValue : 0;
        })
      )
    : null;

  // Volatility proxy: std dev of holdings' dailyPnLPct
  const pctSeries = holdings
    .map((h) => (h.dailyPnLPct == null ? null : h.dailyPnLPct))
    .filter((v): v is number => v != null && typeof v === "number" && Number.isFinite(v));

  const sd = computeStdDev(pctSeries);
  if (sd == null) return null;

  // Risk score: combine volatility and concentration. No fabricated market beta/sharpe.
  // Volatility contribution: sdPct (in %) mapped to 0..70
  const volatilityContribution = clamp((sd / 5) * 35, 0, 70);

  // Concentration contribution: topWeight mapped to 0..30
  const concentrationContribution =
    topWeight == null
      ? null
      : clamp(((topWeight - 0.1) / 0.4) * 30, 0, 30);

  if (concentrationContribution == null) {
    // If we can't compute concentration, we still allow risk based on volatility only.
    const riskScoreOnlyVol = Math.round(volatilityContribution);
    const riskLevelOnlyVol = riskScoreOnlyVol <= 33 ? "Low" : riskScoreOnlyVol <= 66 ? "Moderate" : "High";
    return {
      riskLevel: riskLevelOnlyVol,
      riskScore: riskScoreOnlyVol,
      volatilityPct: sd,
      concentration: null,
      beta: null,
    };
  }

  const riskScore = Math.round(volatilityContribution + concentrationContribution);
  const riskLevel = riskScore <= 33 ? "Low" : riskScore <= 66 ? "Moderate" : "High";

  return {
    riskLevel,
    riskScore,
    volatilityPct: sd,
    concentration: topWeight,
    beta: null,
  };
}

export function calculateHoldingsCount(params: {
  rows?: unknown;
}): number {
  if (!Array.isArray(params.rows)) return 0;
  return params.rows.length;
}


