"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { ThemeProvider } from "@/components/theme/ThemeContext";

const SIDEBAR_PATHS = [
  "/dashboard",
  "/ai",
  "/search",
  "/portfolio",
  "/news",
  "/watchlist",
  "/profile",
  "/settings",
];

function shouldShowSidebar(pathname: string) {
  return SIDEBAR_PATHS.some((p) => pathname === p);
}

export default function LayoutShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const show = shouldShowSidebar(pathname);

  if (!show) return <ThemeProvider>{children}</ThemeProvider>;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--mm-background)] transition-all duration-300 md:flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopNavbar />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}

