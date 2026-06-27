"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchAutocompleteItem = {
  symbol: string;
  name: string;
  exchange: string;
  logoUrl?: string;
};

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSelect: (item: SearchAutocompleteItem) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fetchUrl?: string; // default: /api/search-autocomplete?q=...
  minChars?: number;
};

function exchangeBadgeClass(exchange: string) {
  const ex = exchange.toUpperCase();
  if (ex === "NSE" || ex === "BSE") return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  if (ex === "NASDAQ" || ex === "NYSE") return "border-sky-400/25 bg-sky-400/10 text-sky-200";
  if (ex === "ETFS") return "border-purple-400/25 bg-purple-400/10 text-purple-200";
  if (ex === "CRYPTO") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  return "border-zinc-700/80 bg-zinc-800/40 text-zinc-300";
}

export default function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search",
  className = "",
  disabled = false,
  fetchUrl = "/api/search-autocomplete",
  minChars = 1,
}: Props) {
  const [items, setItems] = useState<SearchAutocompleteItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const cacheRef = useRef<Map<string, SearchAutocompleteItem[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const query = value;

  const canSearch = useMemo(() => {
    return !disabled && query.trim().length >= minChars;
  }, [disabled, query, minChars]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!canSearch) {
      setOpen(false);
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query.trim();
    if (!q) {
      setOpen(false);
      setItems([]);
      setLoading(false);
      return;
    }

    // Cache
    const cached = cacheRef.current.get(q.toLowerCase());
    if (cached) {
      setItems(cached);
      setLoading(false);
      setOpen(true);
      setActiveIndex(0);
      return;
    }

    setLoading(true);
    setOpen(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${fetchUrl}?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        const next: SearchAutocompleteItem[] = Array.isArray(data?.results)
          ? data.results
          : [];

        cacheRef.current.set(q.toLowerCase(), next);
        setItems(next);
        setActiveIndex(0);
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [canSearch, fetchUrl, query]);

  const selectAt = (idx: number) => {
    const it = items[idx];
    if (!it) return;
    onSelect(it);
    setOpen(false);
    // keep input text until parent updates
  };

  return (
    <div ref={containerRef} className={"relative w-full " + className}>
      <input
        ref={inputRef}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (items.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(items.length - 1, i + 1));
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
            return;
          }

          if (e.key === "Enter") {
            e.preventDefault();
            if (!items.length) return;
            selectAt(activeIndex);
          }

          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#27272A] bg-[#18181B]/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FACC15]/60 focus:ring-2 focus:ring-[#FACC15]/15"
      />

      {/* Left icon slot */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {open && (canSearch || loading) && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-800 bg-[#0b0b0f] shadow-2xl overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 flex items-center gap-3 text-zinc-300">
              <span className="h-3 w-3 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin" />
              <span className="text-sm">Searching…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-4">
              <div className="text-sm text-zinc-300 font-semibold">No results</div>
              <div className="text-xs text-zinc-500 mt-1">
                Try company name, partial name, or a symbol (e.g., AAPL, Reliance, BTC-USD).
              </div>
            </div>
          ) : (
            <div role="listbox" aria-label="Search results">
              {items.map((it, idx) => {
                const active = idx === activeIndex;
                return (
                  <button
                    key={`${it.symbol}-${it.name}-${it.exchange}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      // Prevent input blur
                      e.preventDefault();
                    }}
                    onClick={() => selectAt(idx)}
                    className={
                      "w-full text-left px-4 py-3 flex items-center gap-3 transition " +
                      (active
                        ? "bg-[#FACC15]/10 border-t border-b border-[#FACC15]/20"
                        : "hover:bg-zinc-900/60")
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-white/5 border border-zinc-800 overflow-hidden flex items-center justify-center">
                        {it.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.logoUrl} alt="logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-200">
                            {it.symbol.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="font-semibold text-white truncate">{it.name}</div>
                          <div
                            className={
                              "ml-auto text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 " +
                              exchangeBadgeClass(it.exchange)
                            }
                          >
                            {it.exchange}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          <span className="text-zinc-200 font-semibold">{it.symbol}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

