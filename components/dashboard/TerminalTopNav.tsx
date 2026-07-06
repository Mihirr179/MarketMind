"use client";

import { Bell, Settings, UserRound, Globe, AlertTriangle } from "lucide-react";
import Link from "next/link";
import SearchAutocomplete from "@/components/ui/SearchAutocomplete";

import { useEffect, useMemo, useState } from "react";
import type { MarketSession } from "@/utils/marketStatus";
import { getMarketStatus } from "@/utils/marketStatus";

export default function TerminalTopNav() {
  const [userName, setUserName] = useState<string>("User");
  const [search, setSearch] = useState("");
  const [marketStatus, setMarketStatus] = useState<MarketSession>(() => getMarketStatus(new Date()));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (typeof u?.name === "string" && u.name.trim()) window.setTimeout(() => setUserName(u.name), 0);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMarketStatus(getMarketStatus(new Date()));
    }, 30_000);

    return () => window.clearInterval(id);
  }, []);


  const initials = useMemo(() => {
    const parts = userName.split(/\s+/).filter(Boolean);
    return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [userName]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#27272A]/70 bg-[#09090B]/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="group flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-[#FACC15]/35 bg-[#FACC15]/10 shadow-[0_0_0_1px_rgba(250,204,21,0.05)] group-hover:border-[#FACC15]/60 transition">
            <span className="text-[11px] font-black text-[#FACC15]">MM</span>
          </span>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-wide text-white/90">
              Market<span className="text-[#FACC15]">Mind</span>
            </div>
            <div className="text-xs text-zinc-400">Trading Terminal</div>
          </div>
        </Link>

        {/* Global Search (TradingView-like) */}
        <div className="relative hidden md:flex flex-1 items-center">
          <SearchAutocomplete
            value={search}
            onChange={setSearch}
            placeholder="Search (AAPL, Reliance, BTC...)"
            onSelect={(item) => {
              const nextSymbol = item.symbol.toUpperCase();
              window.location.href = `/dashboard?symbol=${encodeURIComponent(nextSymbol)}`;
            }}
          />
        </div>

        {/* Market Status */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#27272A] bg-[#18181B]/40 px-3 py-2">
            <Globe size={16} className="text-zinc-400" />
            <div className="min-w-[90px]">
              <div className="text-[11px] font-bold tracking-wider text-zinc-500">Market</div>
              <div className={`text-sm font-bold ${marketStatus.isOpen ? "text-emerald-400" : "text-red-400"}`}>
                {marketStatus.isOpen ? "Open" : "Closed"}
              </div>
            </div>
            {!marketStatus.isOpen && <AlertTriangle size={16} className="text-red-400" />}
          </div>
        </div>

        {/* Notifications / Profile / Settings */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-[#27272A] bg-[#18181B]/40 text-zinc-300 hover:border-[#FACC15]/40 hover:text-white transition"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <div className="hidden sm:block">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-xl border border-[#27272A] bg-[#18181B]/40 px-3 py-2 hover:border-[#FACC15]/40 transition"
            >
              <span className="grid size-8 place-items-center rounded-full bg-[#FACC15]/10 border border-[#FACC15]/30 text-xs font-bold text-[#FACC15]">
                {initials || <UserRound size={16} />}
              </span>
              <span className="text-sm font-semibold text-white/90">{userName}</span>
            </Link>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-[#27272A] bg-[#18181B]/40 text-zinc-300 hover:border-[#FACC15]/40 hover:text-white transition"
            aria-label="Settings"
            onClick={() => (window.location.href = "/settings")}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Mobile status */}
      <div className="md:hidden border-t border-[#27272A]/60 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Globe size={14} />
            <span>Market status</span>
          </div>
          <div className={`font-bold ${marketStatus.isOpen ? "text-emerald-400" : "text-red-400"}`}>
            {marketStatus.isOpen ? "Open" : "Closed"}
          </div>
        </div>
      </div>
    </header>
  );
}

