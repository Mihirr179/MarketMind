"use client";

import { useEffect } from "react";

import { type MarketMindSettings } from "./SettingsStore";

const accentToVar = {
  gold: "#FACC15",
  blue: "#60A5FA",
  green: "#34D399",
  purple: "#A78BFA",
} as const;

export function ApplyAppearance({ settings }: { settings: MarketMindSettings }) {
  useEffect(() => {
    const root = document.documentElement;

    // Accent color: update CSS variable used by existing components.
    root.style.setProperty("--mm-accent", accentToVar[settings.appearance.accentColor]);
    root.style.setProperty("--accent", accentToVar[settings.appearance.accentColor]);

    // Density: used only for spacing adjustments via CSS vars.
    const densityToVars = {
      compact: { cardPad: "20px", rowGap: "10px" },
      comfortable: { cardPad: "24px", rowGap: "12px" },
      spacious: { cardPad: "28px", rowGap: "14px" },
    } as const;

    const vars = densityToVars[settings.appearance.density];
    root.style.setProperty("--mm-card-pad", vars.cardPad);
    root.style.setProperty("--mm-row-gap", vars.rowGap);

    // Font size scale
    const fontToPx = {
      small: 0.94,
      medium: 1,
      large: 1.08,
    } as const;

    root.style.setProperty("--mm-font-scale", String(fontToPx[settings.appearance.fontSize]));

    // Note: Theme itself is driven by ThemeContext (dark class + dataset.theme)
  }, [settings.appearance]);

  return null;
}

