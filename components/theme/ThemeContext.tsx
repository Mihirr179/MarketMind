"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppThemeMode = "dark" | "light" | "system";

type ThemeContextValue = {
  theme: AppThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (next: AppThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "marketmind_theme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeMode>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Initialize from localStorage (async-safe) to avoid react-hooks/set-state-in-effect rule violations.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "dark" || raw === "light" || raw === "system") {
        queueMicrotask(() => setThemeState(raw));
      }
    } catch {
      // ignore
    }
  }, []);



  useEffect(() => {
    const root = document.documentElement;

    const applyResolved = () => {
      const nextResolved = theme === "system" ? getSystemTheme() : theme;
      setResolvedTheme(nextResolved);
      root.dataset.theme = nextResolved;

      if (nextResolved === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    };


    applyResolved();

    if (theme === "system" && typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyResolved();
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else mql.addListener(onChange);
      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", onChange);
        else mql.removeListener(onChange);
      };
    }
  }, [theme]);


  const setTheme = (next: AppThemeMode) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    // Toggle between dark/light while respecting "system" by switching to opposite of resolved.
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme]
  );


  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

