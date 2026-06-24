"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  LayoutDashboard,
  Newspaper,
  Search,
  Settings,
  Star,
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai", label: "AI Research", icon: Bot },
  { href: "/search", label: "Stock Analysis", icon: Search },
  { href: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r md:px-5 md:py-7">
      <Link
        href="/dashboard"
        className="mb-4 flex items-center gap-3 px-2 md:mb-9"
        aria-label="MarketMind dashboard"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/15">
          <ChartNoAxesCombined size={22} strokeWidth={2.4} />
        </span>
        <span className="text-2xl font-bold tracking-tight text-white">
          Market<span className="text-yellow-400">Mind</span>
        </span>
      </Link>

      <nav
        aria-label="Primary navigation"
        className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0"
      >
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 md:w-full ${
                active
                  ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-yellow-400"
              }`}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
