"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Timeframe = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export type IndicatorKey =
  | "SMA"
  | "EMA"
  | "RSI"
  | "MACD"
  | "Bollinger Bands"
  | "VWAP"
  | "Volume";

type ChartStateValue = {
  symbol: string;
  company?: string;
  timeframe: Timeframe;
  enabledIndicators: Set<IndicatorKey>;
  setSymbol: (next: string) => void;
  setTimeframe: (next: Timeframe) => void;
  toggleIndicator: (key: IndicatorKey) => void;
  setIndicators: (keys: IndicatorKey[]) => void;
};

const ChartStateContext = createContext<ChartStateValue | null>(null);

export function ChartStateProvider({
  children,
  initialSymbol = "SPY",
}: {
  children: React.ReactNode;
  initialSymbol?: string;
}) {
  const [symbol, setSymbolState] = useState(initialSymbol);
  const [timeframe, setTimeframeState] = useState<Timeframe>("1D");
  const [enabledIndicators, setEnabledIndicators] = useState<Set<IndicatorKey>>(
    () => new Set<IndicatorKey>(["SMA", "Volume"])
  );

  const setSymbol = useCallback((next: string) => {
    setSymbolState(next.toUpperCase());
  }, []);

  const setTimeframe = useCallback((next: Timeframe) => {
    setTimeframeState(next);
  }, []);

  const toggleIndicator = useCallback((key: IndicatorKey) => {
    setEnabledIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const setIndicators = useCallback((keys: IndicatorKey[]) => {
    setEnabledIndicators(new Set(keys));
  }, []);

  const value = useMemo<ChartStateValue>(
    () => ({
      symbol,
      timeframe,
      enabledIndicators,
      setSymbol,
      setTimeframe,
      toggleIndicator,
      setIndicators,
    }),
    [symbol, timeframe, enabledIndicators, setSymbol, setTimeframe, toggleIndicator, setIndicators]
  );

  return <ChartStateContext.Provider value={value}>{children}</ChartStateContext.Provider>;
}

export function useChartState() {
  const ctx = useContext(ChartStateContext);
  if (!ctx) throw new Error("useChartState must be used within ChartStateProvider");
  return ctx;
}

