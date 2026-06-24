"use client";

import { Bell, Settings, Search, UserRound, Globe, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function TerminalTopNav() {
  const [userName, setUserName] = useState<string>("User");
  const [search, setSearch] = useState("");
  const [marketOpen, setMarketOpen] = useState<boolean>(true);

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
    // Demo market status indicator that doesn\'t break integrations.
    // If you later have a real market status API, replace this logic.
    const tick = () => {
      const now = new Date();
      const day = now.getDay(); // 0 Sun - 6 Sat
      const hour = now.getHours();
      const minute = now.getMinutes();
      const minutes = hour * 60 + minute;

      // Approx US market hours (9:30 - 16:00) in local time.
      const isWeekend = day === 0 || day === 6;
      const isOpen = !isWeekend && minutes >= 9 * 60 + 30 && minutes <= 16 * 60;
      setMarketOpen(isOpen);
    };

    tick();
    const id = window.setInterval(tick, 30_000);
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

        {/* Global Search */}
        <form
          className="relative hidden md:flex flex-1 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const q = search.trim().toUpperCase();
            if (!q) return;
            // Keep it non-breaking: navigate via existing search route.
            window.location.href = `/search?symbol=${encodeURIComponent(q)}`;
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol (AAPL, TSLA, BTC...)"
            className="w-full rounded-xl border border-[#27272A] bg-[#18181B]/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FACC15]/60 focus:ring-2 focus:ring-[#FACC15]/15"
          />
        </form>

        {/* Market Status */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#27272A] bg-[#18181B]/40 px-3 py-2">
            <Globe size={16} className="text-zinc-400" />
            <div className="min-w-[90px]">
              <div className="text-[11px] font-bold tracking-wider text-zinc-500">Market</div>
              <div className={`text-sm font-bold ${marketOpen ? "text-emerald-400" : "text-red-400"}`}>
                {marketOpen ? "Open" : "Closed"}
              </div>
            </div>
            {!marketOpen && <AlertTriangle size={16} className="text-red-400" />}
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
          <div className={`font-bold ${marketOpen ? "text-emerald-400" : "text-red-400"}`}>
            {marketOpen ? "Open" : "Closed"}
          </div>
        </div>
      </div>
    </header>
  );
}

