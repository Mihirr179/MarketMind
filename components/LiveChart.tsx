"use client";

import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  HistogramSeries,
  LineSeries,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
} from "lightweight-charts";
import { BarChart3, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Timeframe = "1D" | "1W" | "1M" | "1Y";
type Indicator = "SMA" | "RSI" | "MACD";

type ApiCandle = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

type Candle = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Quote = {
  open: number;
  high: number;
  low: number;
  close: number;
};

type LiveChartProps = {
  defaultSymbol?: string;
  fetchChartUrl?: string;
};

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "1Y"];
const INDICATORS: Indicator[] = ["SMA", "RSI", "MACD"];
const FALLBACK_POINTS: Record<Timeframe, number> = {
  "1D": 40,
  "1W": 90,
  "1M": 180,
  "1Y": 260,
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function symbolSeed(symbol: string, timeframe: Timeframe) {
  return `${symbol}-${timeframe}`.split("").reduce((seed, character) => {
    return (seed * 31 + character.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function generateMockData(symbol: string, timeframe: Timeframe): Candle[] {
  const random = seededRandom(symbolSeed(symbol, timeframe));
  const points = FALLBACK_POINTS[timeframe];
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(12, 0, 0, 0);

  while (dates.length < points) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) dates.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  dates.reverse();
  let previousClose = 90 + (symbolSeed(symbol, timeframe) % 420);

  return dates.map((date, index) => {
    const volatility = timeframe === "1Y" ? 0.026 : 0.018;
    const trend = Math.sin(index / 13) * 0.003 + 0.0007;
    const gap = (random() - 0.5) * volatility;
    const open = previousClose * (1 + gap);
    const move = trend + (random() - 0.48) * volatility;
    const close = Math.max(1, open * (1 + move));
    const high = Math.max(open, close) * (1 + random() * 0.012);
    const low = Math.min(open, close) * (1 - random() * 0.012);
    const volume = Math.round(
      8_000_000 +
        random() * 45_000_000 +
        Math.abs(close - open) * 550_000
    );

    previousClose = close;
    return {
      time: date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    };
  });
}

function normalizeCandles(candles: ApiCandle[]): Candle[] {
  return candles
    .filter(
      (candle) =>
        typeof candle.date === "string" &&
        candle.open != null &&
        candle.high != null &&
        candle.low != null &&
        candle.close != null &&
        candle.volume != null &&
        [candle.open, candle.high, candle.low, candle.close, candle.volume].every(
          Number.isFinite
        )
    )
    .map((candle) => ({
      time: candle.date,
      open: candle.open as number,
      high: candle.high as number,
      low: candle.low as number,
      close: candle.close as number,
      volume: candle.volume as number,
    }))
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

function calculateSma(candles: Candle[], period: number): LineData<Time>[] {
  const result: LineData<Time>[] = [];
  let sum = 0;

  candles.forEach((candle, index) => {
    sum += candle.close;
    if (index >= period) sum -= candles[index - period].close;
    if (index >= period - 1) {
      result.push({ time: candle.time, value: sum / period });
    }
  });

  return result;
}

function calculateEma(values: number[], period: number) {
  const result: Array<number | null> = new Array(values.length).fill(null);
  if (values.length < period) return result;

  const multiplier = 2 / (period + 1);
  let previous =
    values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  result[period - 1] = previous;

  for (let index = period; index < values.length; index += 1) {
    previous = (values[index] - previous) * multiplier + previous;
    result[index] = previous;
  }

  return result;
}

function calculateRsi(candles: Candle[], period = 14): LineData<Time>[] {
  if (candles.length <= period) return [];

  let gains = 0;
  let losses = 0;
  const result: LineData<Time>[] = [];

  for (let index = 1; index <= period; index += 1) {
    const change = candles[index].close - candles[index - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let index = period; index < candles.length; index += 1) {
    if (index > period) {
      const change = candles[index].close - candles[index - 1].close;
      averageGain =
        (averageGain * (period - 1) + Math.max(change, 0)) / period;
      averageLoss =
        (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    }

    const relativeStrength =
      averageLoss === 0 ? Infinity : averageGain / averageLoss;
    const value = 100 - 100 / (1 + relativeStrength);
    result.push({ time: candles[index].time, value });
  }

  return result;
}

function calculateMacd(candles: Candle[]) {
  const closes = candles.map((candle) => candle.close);
  const ema12 = calculateEma(closes, 12);
  const ema26 = calculateEma(closes, 26);
  const macdValues = closes.map((_, index) => {
    if (ema12[index] == null || ema26[index] == null) return null;
    return (ema12[index] as number) - (ema26[index] as number);
  });
  const compactMacd = macdValues.filter(
    (value): value is number => value != null
  );
  const compactSignal = calculateEma(compactMacd, 9);
  let signalIndex = 0;

  const macd: LineData<Time>[] = [];
  const signal: LineData<Time>[] = [];
  const histogram: HistogramData<Time>[] = [];

  macdValues.forEach((value, index) => {
    if (value == null) return;

    const signalValue = compactSignal[signalIndex];
    macd.push({ time: candles[index].time, value });

    if (signalValue != null) {
      const difference = value - signalValue;
      signal.push({ time: candles[index].time, value: signalValue });
      histogram.push({
        time: candles[index].time,
        value: difference,
        color: difference >= 0 ? "#22c55e99" : "#ef444499",
      });
    }

    signalIndex += 1;
  });

  return { macd, signal, histogram };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function LiveChart({
  defaultSymbol = "SPY",
  fetchChartUrl = "/api/market-chart",
}: LiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [symbolInput, setSymbolInput] = useState(defaultSymbol);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [indicator, setIndicator] = useState<Indicator>("SMA");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCandles() {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      try {
        const response = await fetch(
          `${fetchChartUrl}?symbol=${encodeURIComponent(
            symbol
          )}&range=${timeframe}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        const normalized = normalizeCandles(
          Array.isArray(data?.candles) ? data.candles : []
        );

        if (!response.ok || normalized.length < 2) {
          throw new Error(data?.error || "Live market data is unavailable");
        }

        setCandles(normalized);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;

        setCandles(generateMockData(symbol, timeframe));
        setUsingFallback(true);
        setError(
          loadError instanceof Error
            ? `${loadError.message}. Showing realistic demo data.`
            : "Live market data is unavailable. Showing realistic demo data."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCandles();
    return () => controller.abort();
  }, [fetchChartUrl, reloadKey, symbol, timeframe]);

  const latestQuote = useMemo<Quote | null>(() => {
    const latest = candles.at(-1);
    if (!latest) return null;
    return {
      open: latest.open,
      high: latest.high,
      low: latest.low,
      close: latest.close,
    };
  }, [candles]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || candles.length === 0) return;

    const chart = createChart(container, {
      autoSize: true,
      height: 560,
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0a" },
        textColor: "#a1a1aa",
        panes: {
          separatorColor: "#27272a",
          separatorHoverColor: "#facc154d",
          enableResize: true,
        },
      },
      grid: {
        vertLines: { color: "#18181b" },
        horzLines: { color: "#18181b" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#facc1580",
          labelBackgroundColor: "#facc15",
          width: 1,
        },
        horzLine: {
          color: "#71717a80",
          labelBackgroundColor: "#27272a",
          width: 1,
        },
      },
      rightPriceScale: {
        borderColor: "#27272a",
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
        minBarSpacing: 3,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      localization: {
        priceFormatter: formatPrice,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      priceLineColor: "#facc15",
      lastValueVisible: true,
    });
    candlestickSeries.setData(
      candles.map<CandlestickData<Time>>((candle) => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
    );

    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        lastValueVisible: false,
        priceLineVisible: false,
      },
      1
    );
    volumeSeries.setData(
      candles.map<HistogramData<Time>>((candle) => ({
        time: candle.time,
        value: candle.volume,
        color:
          candle.close >= candle.open ? "#22c55e66" : "#ef444466",
      }))
    );
    chart.priceScale("volume", 1).applyOptions({
      scaleMargins: { top: 0.1, bottom: 0 },
      borderVisible: false,
    });

    if (indicator === "SMA") {
      const sma20 = chart.addSeries(LineSeries, {
        color: "#facc15",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 20",
      });
      const sma50 = chart.addSeries(LineSeries, {
        color: "#a78bfa",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 50",
      });
      sma20.setData(calculateSma(candles, 20));
      sma50.setData(calculateSma(candles, 50));
    }

    if (indicator === "RSI") {
      const rsiSeries = chart.addSeries(
        LineSeries,
        {
          color: "#60a5fa",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          title: "RSI 14",
        },
        2
      );
      rsiSeries.setData(calculateRsi(candles));
      chart.priceScale("right", 2).applyOptions({
        autoScale: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      });
      rsiSeries.createPriceLine({
        price: 70,
        color: "#ef444480",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "70",
      });
      rsiSeries.createPriceLine({
        price: 30,
        color: "#22c55e80",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "30",
      });
    }

    if (indicator === "MACD") {
      const macdData = calculateMacd(candles);
      const histogramSeries = chart.addSeries(
        HistogramSeries,
        {
          priceLineVisible: false,
          lastValueVisible: false,
          title: "MACD",
        },
        2
      );
      const macdSeries = chart.addSeries(
        LineSeries,
        {
          color: "#facc15",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          title: "MACD",
        },
        2
      );
      const signalSeries = chart.addSeries(
        LineSeries,
        {
          color: "#fb7185",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          title: "Signal",
        },
        2
      );
      histogramSeries.setData(macdData.histogram);
      macdSeries.setData(macdData.macd);
      signalSeries.setData(macdData.signal);
    }

    const panes = chart.panes();
    panes[0]?.setHeight(indicator === "SMA" ? 430 : 340);
    panes[1]?.setHeight(110);
    panes[2]?.setHeight(130);
    chart.timeScale().fitContent();

    const handleCrosshairMove = (parameter: {
      time?: Time;
      seriesData: Map<unknown, unknown>;
    }) => {
      if (!parameter.time) {
        setQuote(null);
        return;
      }

      const data = parameter.seriesData.get(candlestickSeries) as
        | CandlestickData<Time>
        | undefined;
      if (data && "open" in data) {
        setQuote({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        });
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, [candles, indicator, latestQuote]);

  const handleSymbolSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = symbolInput.trim().toUpperCase();
    if (!/^[A-Z0-9.-]{1,15}$/.test(normalized)) {
      setError("Enter a valid symbol such as SPY, AAPL, TSLA, or NVDA.");
      return;
    }
    setSymbol(normalized);
    setSymbolInput(normalized);
  };

  const displayedQuote = quote ?? latestQuote;
  const priceChange =
    displayedQuote && candles.length > 1
      ? displayedQuote.close - candles[candles.length - 2].close
      : 0;
  const priceChangePercent =
    candles.length > 1
      ? (priceChange / candles[candles.length - 2].close) * 100
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111111] shadow-2xl shadow-black/20 transition duration-300 hover:border-yellow-400/40">
      <div className="border-b border-zinc-800 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <BarChart3 size={21} />
            </span>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-xl font-bold text-white">Live Chart</h2>
                <span className="text-sm font-semibold text-yellow-400">
                  {symbol}
                </span>
                {usingFallback && (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Demo data
                  </span>
                )}
              </div>
              {displayedQuote && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                  <span>O {formatPrice(displayedQuote.open)}</span>
                  <span>H {formatPrice(displayedQuote.high)}</span>
                  <span>L {formatPrice(displayedQuote.low)}</span>
                  <span>C {formatPrice(displayedQuote.close)}</span>
                  <span
                    className={
                      priceChange >= 0 ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {priceChange >= 0 ? "+" : ""}
                    {formatPrice(priceChange)} ({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSymbolSubmit}
            className="flex w-full max-w-sm gap-2"
          >
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Stock symbol</span>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                size={17}
              />
              <input
                value={symbolInput}
                onChange={(event) =>
                  setSymbolInput(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9.-]/g, "")
                      .slice(0, 15)
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-black/60 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
                placeholder="SPY, AAPL, TSLA..."
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Load
            </button>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="grid size-10 place-items-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:border-yellow-400/50 hover:text-yellow-400"
              aria-label="Refresh chart data"
            >
              <RefreshCw size={17} />
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTimeframe(option)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  timeframe === option
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-zinc-700 bg-black/40 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Indicators
            </span>
            {INDICATORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIndicator(option)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  indicator === option
                    ? "border-yellow-400/70 bg-yellow-400/10 text-yellow-400"
                    : "border-zinc-700 bg-black/40 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="status"
          className={`mx-4 mt-4 rounded-xl border px-4 py-3 text-sm sm:mx-5 ${
            usingFallback
              ? "border-amber-400/20 bg-amber-400/5 text-amber-200"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {error}
        </div>
      )}

      <div className="relative bg-[#0a0a0a]">
        <div
          ref={chartContainerRef}
          className="h-[500px] w-full sm:h-[560px]"
          aria-label={`${symbol} candlestick chart with volume and ${indicator} indicator`}
        />

        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#0a0a0a]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#111111] px-5 py-3 text-sm text-zinc-300 shadow-xl">
              <LoaderCircle className="animate-spin text-yellow-400" size={20} />
              Loading {symbol} market data...
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500 sm:px-5">
        <span>Scroll to zoom · Drag to pan · Hover for OHLC</span>
        <span>Powered by TradingView Lightweight Charts™</span>
      </div>
    </section>
  );
}
