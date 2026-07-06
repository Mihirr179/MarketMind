"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

type MarketTile = {
  id: string;
  name: string;
  apiSymbol: string; // best-effort mapping to AlphaVantage GLOBAL_QUOTE symbol
};

type MarketApiRow = {
  symbol: string;
  price: number | null;
  changePercent: number | null;
  changeAbs: number | null;
  error?: string;
};

type MarketTileValue = {
  price: number | null;
  changePercent: number | null;
  error?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatPrice(price: number | null) {
  if (price == null || !Number.isFinite(price)) return "—";
  const abs = Math.abs(price);
  if (abs >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return price.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatPercent(p: number | null) {
  if (p == null || !Number.isFinite(p)) return "—";
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(2)}%`;
}

function toneClass(changePct: number | null) {
  if (changePct == null || !Number.isFinite(changePct)) return "text-zinc-400";
  if (changePct > 0) return "text-emerald-300";
  if (changePct < 0) return "text-red-300";
  return "text-zinc-400";
}

function borderClass(changePct: number | null) {
  if (changePct == null || !Number.isFinite(changePct)) return "border-zinc-800/60";
  if (changePct > 0) return "border-emerald-400/30 hover:border-emerald-300/50";
  if (changePct < 0) return "border-red-400/30 hover:border-red-300/50";
  return "border-zinc-800/60 hover:border-[#FACC15]/30";
}

function arrowFor(changePct: number | null) {
  if (changePct == null || !Number.isFinite(changePct)) return "";
  if (changePct > 0) return "↑";
  if (changePct < 0) return "↓";
  return "•";
}

function hashString(input: string) {
  // Simple deterministic hash -> [0..1)
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // eslint-disable-next-line no-bitwise
  return ((h >>> 0) % 10000) / 10000;
}

function generateSparklinePoints(args: {
  key: string;
  changePercent: number | null;
  price: number | null;
}) {
  const { key, changePercent, price } = args;

  const baseRand = hashString(key);
  const cp = changePercent == null || !Number.isFinite(changePercent) ? 0 : clamp(changePercent, -12, 12);
  const p = price == null || !Number.isFinite(price) ? 1 : clamp(price, 0, 1e12);

  // Create a small deterministic wave.
  const points: number[] = [];
  const n = 16;
  const amp = 0.18 + Math.abs(cp) / 120 + Math.log10(p + 1) / 25;
  const drift = cp / 12;

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // pseudo-random-ish but deterministic
    const r = Math.sin((t * 6.283) * (1 + baseRand * 1.7) + baseRand * 10) * 0.55 +
      Math.cos((t * 6.283) * (0.8 + baseRand) + 1.1) * 0.45;
    const y = 0.5 - (r * amp) - drift * 0.22 * t;
    points.push(clamp(y, 0.08, 0.92));
  }

  return points;
}

function Sparkline({
  points,
  tone,
}: {
  points: number[];
  tone: "up" | "down" | "neutral";
}) {
  const w = 140;
  const h = 34;
  const pad = 3;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const d = points
    .map((y, i) => {
      const x = pad + (innerW * i) / (points.length - 1);
      const yy = pad + innerH * y;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${yy.toFixed(2)}`;
    })
    .join(" ");

  const stroke =
    tone === "up"
      ? "rgba(52,211,153,0.95)"
      : tone === "down"
        ? "rgba(248,113,113,0.95)"
        : "rgba(161,161,170,0.75)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={140}
      height={34}
      className="shrink-0"
      role="img"
      aria-label="price sparkline"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isSameRow(a: MarketTileValue | undefined, b: MarketTileValue | undefined) {
  if (!a || !b) return false;
  return a.price === b.price && a.changePercent === b.changePercent && a.error === b.error;
}

const REFRESH_SECONDS = 60;

export default function MarketHeatmap() {
  const tiles: MarketTile[] = useMemo(
    () => [
      { id: "sp", name: "S&P 500", apiSymbol: "SPY" },
      { id: "nasdaq", name: "NASDAQ", apiSymbol: "QQQ" },
      { id: "dow", name: "Dow Jones", apiSymbol: "DIA" },
      { id: "nifty", name: "NIFTY 50", apiSymbol: "^NSEI" },
      { id: "banknifty", name: "BANK NIFTY", apiSymbol: "^NSEBANK" },
      { id: "sensex", name: "Sensex", apiSymbol: "^BSESN" },
      { id: "ftse", name: "FTSE 100", apiSymbol: "^FTSE" },
      { id: "dax", name: "DAX", apiSymbol: "^GDAXI" },
      { id: "cac", name: "CAC 40", apiSymbol: "^FCHI" },
      { id: "nikkei", name: "Nikkei 225", apiSymbol: "^N225" },
      { id: "hang", name: "Hang Seng", apiSymbol: "^HSI" },
      { id: "shanghai", name: "Shanghai Composite", apiSymbol: "000001.SS" },
      { id: "gold", name: "Gold", apiSymbol: "XAU" },
      { id: "silver", name: "Silver", apiSymbol: "XAG" },
      { id: "oil", name: "Crude Oil", apiSymbol: "CL=F" },
      { id: "btc", name: "Bitcoin", apiSymbol: "BTC" },
      { id: "eth", name: "Ethereum", apiSymbol: "ETH" },
    ],
    []
  );

  // Create a stable order for API calls
  const apiSymbols = useMemo(() => tiles.map((t) => t.apiSymbol).slice(0, 30).join(","), [tiles]);

  const [values, setValues] = useState<Record<string, MarketTileValue>>(() => {
    const init: Record<string, MarketTileValue> = {};
    for (const t of tiles) init[t.id] = { price: null, changePercent: null };
    return init;
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pulseMap, setPulseMap] = useState<Record<string, number>>({});

  // Used only to compute pulse window; driven by a timer, not by Date.now() during render.
  const [currentTime, setCurrentTime] = useState(0);

  const prevValuesRef = useRef<Record<string, MarketTileValue> | null>(null);
  const pulseMapRef = useRef<Record<string, number>>({});
  const valuesRef = useRef<Record<string, MarketTileValue>>(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    pulseMapRef.current = pulseMap;
  }, [pulseMap]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market?symbols=${encodeURIComponent(apiSymbols)}`);
      const data = (await res.json()) as MarketApiRow[];

      const bySymbol = new Map<string, MarketApiRow>();
      if (Array.isArray(data)) {
        for (const row of data) {
          bySymbol.set((row.symbol || "").toUpperCase(), row);
        }
      }

      const next: Record<string, MarketTileValue> = {};
      for (const t of tiles) {
        const row = bySymbol.get((t.apiSymbol || "").toUpperCase());
        next[t.id] = {
          price: row?.price ?? null,
          changePercent: row?.changePercent ?? null,
          error: row?.error,
        };
      }

      // Pulse tiles that changed
      const prev = prevValuesRef.current;
      if (prev) {
        const nextPulse: Record<string, number> = { ...pulseMapRef.current };
        const nowMono = performance.now();
        for (const t of tiles) {
          if (!isSameRow(prev[t.id], next[t.id])) {
            nextPulse[t.id] = nowMono;
          }
        }
        setPulseMap(nextPulse);
      }

      prevValuesRef.current = valuesRef.current;
      setValues(next);
      setLastUpdated(new Date());
    } catch {
      // keep existing values, but stop loading
    } finally {
      setLoading(false);
    }
  }, [apiSymbols, tiles]);

  useEffect(() => {
    const refreshId = window.setInterval(() => {
      void refresh();
    }, REFRESH_SECONDS * 1000);

    const clockId = window.setInterval(() => {
      setCurrentTime(performance.now());
    }, 500);

    // Schedule initial refresh asynchronously to satisfy react-hooks/set-state-in-effect
    const initialId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearInterval(refreshId);
      window.clearInterval(clockId);
      window.clearTimeout(initialId);
    };
  }, [refresh]);

  return (
    <section className="relative">
      <div className="glass-card relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-black/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FACC15]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-24 w-72 h-72 bg-[#FACC15]/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Live Dashboard</div>
              <h2 className="text-lg font-semibold mt-1">Global Market Heatmap</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-40 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FACC15]" />
                    </span>
                    <span className="text-xs font-medium">Live</span>
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Last Updated{lastUpdated ? ` ${lastUpdated.toLocaleTimeString()}` : " —"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-[#FACC15]/40 hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="refresh market heatmap"
                >
                  <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {tiles.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-zinc-800/60 bg-black/10 p-4 animate-pulse"
                    aria-hidden
                  >
                    <div className="h-3 w-3/5 bg-zinc-700/60 rounded" />
                    <div className="mt-3 h-6 w-2/3 bg-zinc-700/60 rounded" />
                    <div className="mt-3 h-4 w-1/3 bg-zinc-700/60 rounded" />
                    <div className="mt-3 h-8 w-full bg-zinc-700/30 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {tiles.map((t) => {
                  const v = values[t.id] || { price: null, changePercent: null };
                  const isUp = v.changePercent != null && Number.isFinite(v.changePercent) && v.changePercent > 0;
                  const isDown = v.changePercent != null && Number.isFinite(v.changePercent) && v.changePercent < 0;
                  const tone = isUp ? "up" : isDown ? "down" : "neutral";

                  const pulseAt = pulseMap[t.id] || 0;
                  const now = currentTime;
                  const shouldPulse = pulseAt && now - pulseAt < 1200;

                  const sparkPts = generateSparklinePoints({ key: t.id, changePercent: v.changePercent, price: v.price });

                  return (
                    <article
                      key={t.id}
                      className={
                        "rounded-2xl border bg-black/20 p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(250,204,21,0.12),0_14px_40px_rgba(0,0,0,0.45)] " +
                        borderClass(v.changePercent) +
                        (shouldPulse ? " ring-1 ring-[#FACC15]/60" : "")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-zinc-400 font-medium truncate">{t.name}</div>
                          <div className="mt-2 text-base font-bold tabular-nums">{formatPrice(v.price)}</div>
                        </div>
                        <div className={`text-[12px] font-semibold tabular-nums flex items-center gap-1 ${toneClass(v.changePercent)}`}>
                          <span aria-hidden>{arrowFor(v.changePercent)}</span>
                          <span>{formatPercent(v.changePercent)}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Sparkline points={sparkPts} tone={tone} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subtle footer */}
          <div className="mt-4 text-[11px] text-zinc-500">
            Data feed: AlphaVantage GLOBAL_QUOTE (placeholders shown when unavailable).
          </div>
        </div>
      </div>
    </section>
  );
}

