"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Globe, LogOut, Settings, Sun, Moon, UserRound } from "lucide-react";
import { useTheme, type AppThemeMode } from "@/components/theme/ThemeContext";

function initialsFromName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

type Props = {
  userName?: string;
};

export default function ProfileDropdown({ userName = "User" }: Props) {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);

  const initials = useMemo(() => initialsFromName(userName || "User"), [userName]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("marketmind:user-updated"));
    router.replace("/login");
  };

  const options: Array<{ key: AppThemeMode; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> =
    [
      { key: "dark", label: "Dark", Icon: Moon },
      { key: "light", label: "Light", Icon: Sun },
      { key: "system", label: "System", Icon: Globe },
    ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-xl border border-[color:var(--mm-border)]/70 bg-[color:rgba(17,24,39,0.2)] px-3 py-2 transition-all duration-300 hover:border-[#FACC15]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mm-primary)]/40"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <span className="grid size-8 place-items-center rounded-full bg-[color:rgba(250,204,21,0.10)] border border-[color:var(--mm-primary)]/30 text-xs font-bold text-[color:var(--mm-primary)]">
          {initials || <UserRound size={16} />}
        </span>
        <span className="hidden text-sm font-semibold text-[var(--mm-text)]/90 sm:inline">{userName}</span>
      </button>

      <div
        className={`absolute right-0 mt-2 w-60 origin-top-right rounded-2xl border border-[color:var(--mm-primary)]/25 bg-[rgba(9,9,11,0.72)] p-2 backdrop-blur-xl shadow-[0_0_0_1px_rgba(250,204,21,0.06)] transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
        role="menu"
        aria-hidden={!open}
      >
        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--mm-text)]/90 hover:bg-black/30 transition-all"
          role="menuitem"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[color:rgba(250,204,21,0.10)] border border-[color:var(--mm-primary)]/25 text-[color:var(--mm-primary)]">
            <UserRound size={18} />
          </span>
          <span>Profile</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            router.push("/settings");
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--mm-text)]/90 hover:bg-black/30 transition-all"
          role="menuitem"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[color:rgba(250,204,21,0.10)] border border-[color:var(--mm-primary)]/25 text-[color:var(--mm-primary)]">
            <Settings size={18} />
          </span>
          <span>Settings</span>
        </button>

        <div className="mt-2 px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--mm-secondary)]">
          Theme
        </div>

        {options.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              theme === key
                ? "bg-black/30 text-[var(--mm-text)] border border-[color:var(--mm-primary)]/25"
                : "text-[var(--mm-text)]/90 hover:bg-black/30"
            }`}
            role="menuitem"
          >
            <Icon size={18} className={theme === key ? "text-[var(--mm-primary)]" : "text-[var(--mm-secondary)]"} />
            <span>{label}</span>
            {key === resolvedTheme && theme === "system" ? (
              <span className="ml-auto text-[11px] font-bold text-[var(--mm-primary)]">Active</span>
            ) : null}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            handleLogout();
          }}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--mm-danger)] hover:bg-red-500/10 transition-all border border-red-500/20"
          role="menuitem"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <LogOut size={18} />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

