"use client";

import {
  BarChart3,
  Bell,
  Bot,
  Database,
  Shield,
  SlidersHorizontal,
  User,
  CreditCard,
  Info,
} from "lucide-react";

export type SettingsSectionKey =
  | "profile"
  | "appearance"
  | "trading"
  | "ai"
  | "notifications"
  | "security"
  | "data"
  | "about";

export const SETTINGS_SECTIONS: Array<{
  key: SettingsSectionKey;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}> = [
  { key: "profile", label: "Profile", Icon: User },
  { key: "appearance", label: "Appearance", Icon: SlidersHorizontal },
  { key: "trading", label: "Trading Preferences", Icon: BarChart3 },
  { key: "ai", label: "AI Settings", Icon: Bot },
  { key: "notifications", label: "Notifications", Icon: Bell },
  { key: "security", label: "Security", Icon: Shield },
  { key: "data", label: "Data & Privacy", Icon: Database },
  { key: "about", label: "About MarketMind", Icon: Info },
];

export const SETTINGS_SECTION_COPY: Record<SettingsSectionKey, {
  title: string;
  subtitle: string;
}> = {
  profile: {
    title: "Profile",
    subtitle: "Manage identity, contact details, and access safeguards.",
  },
  appearance: {
    title: "Appearance",
    subtitle: "Customize theme, density, accent color, and typography.",
  },
  trading: {
    title: "Trading Preferences",
    subtitle: "Set defaults for markets, timeframes, chart style, and refresh.",
  },
  ai: {
    title: "MarketMind AI Settings",
    subtitle: "Tune analysis mode and control confidence for recommendations.",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Choose what you want to be alerted about, across channels.",
  },
  security: {
    title: "Security Center",
    subtitle: "Strengthen your account with 2FA, sessions, and device controls.",
  },
  data: {
    title: "Data & Privacy",
    subtitle: "Export data, manage backups, and handle sensitive actions safely.",
  },
  about: {
    title: "About MarketMind",
    subtitle: "Enterprise-grade insights and AI-powered market intelligence.",
  },
};

export function AccountTypePill({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/90">
      <CreditCard size={13} className="mr-2 text-[var(--accent)]" />
      {value}
    </span>
  );
}

