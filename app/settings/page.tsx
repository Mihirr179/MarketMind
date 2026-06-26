"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { ApplyAppearance } from "@/components/settings/ApplyAppearance";
import { useMarketMindSettings } from "@/components/settings/useMarketMindSettings";
import { Modal, ConfirmDialog } from "@/components/settings/SettingsUI";
import type { MarketMindSettings } from "@/components/settings/SettingsStore";
import { SettingsPremiumLayout } from "@/components/settings/SettingsPremiumLayout";
import { SettingsPanelContent } from "@/components/settings/SettingsPanelContent";
import type { SettingsSectionKey } from "@/components/settings/SettingsSections";
import { useTheme, type AppThemeMode } from "@/components/theme/ThemeContext";
import GlassCard from "@/components/ui/GlassCard";

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { settings, loading, setSettings } = useMarketMindSettings();
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>("profile");

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState<
    | null
    | {
        kind: "deleteAccount" | "deleteWatchlist" | "resetPreferences";
      }
  >(null);

  // Auth gate
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedToken || !storedUser) router.push("/login");
  }, [router]);

  // Apply theme immediately when user changes Appearance.theme
  useEffect(() => {
    setTheme(settings.appearance.theme as AppThemeMode);
  }, [settings.appearance.theme, setTheme]);

  const headerSubtitle = useMemo(() => {
    return "Manage your profile, trading behavior, alerts, AI preferences, and platform appearance.";
  }, []);

  const handleUpdate = (patch: Partial<MarketMindSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 sm:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-3xl font-bold">Settings</div>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">Loading…</p>
          <div className="space-y-4 mt-6">
            <GlassCard className="h-32" />
            <GlassCard className="h-56" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <ApplyAppearance settings={settings} />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-16 left-10 w-96 h-96 bg-[#FACC15]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FACC15]/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                <ChevronLeft size={18} />
                Back
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h1>
                <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                Premium Trading Experience
              </span>
            </div>
          </div>

          <SettingsPremiumLayout
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            header={null}
            panel={
              <SettingsPanelContent
                activeSection={activeSection}
                settings={settings}
                changePasswordOpen={changePasswordOpen}
                setChangePasswordOpen={setChangePasswordOpen}
                dangerOpen={dangerOpen}
                setDangerOpen={setDangerOpen}
                handleUpdate={handleUpdate}
              />
            }
          />
        </div>
      </motion.div>

      <Modal
        open={changePasswordOpen}
        title="Change Password"
        onClose={() => setChangePasswordOpen(false)}
        footer={
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(false)}
              className="rounded-xl border border-[var(--mm-border)] bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setChangePasswordOpen(false)}
              className="rounded-xl bg-[var(--accent)] text-zinc-950 px-4 py-3 text-sm font-extrabold border border-[color:var(--accent)]/60 hover:brightness-110 transition"
            >
              Update Password
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm font-bold">Current Password</div>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              type="password"
              placeholder="••••••••"
              value={""}
              readOnly
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold">New Password</div>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                type="password"
                placeholder="••••••••"
                value={""}
                readOnly
              />
            </div>
            <div>
              <div className="text-sm font-bold">Confirm New Password</div>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                type="password"
                placeholder="••••••••"
                value={""}
                readOnly
              />
            </div>
          </div>
          <div className="text-xs text-zinc-400">
            This is a UI prototype. In production, connect to your secure API.
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!dangerOpen}
        title={
          dangerOpen?.kind === "deleteWatchlist"
            ? "Delete Watchlist"
            : dangerOpen?.kind === "resetPreferences"
              ? "Reset Preferences"
              : "Delete Account"
        }
        description={
          dangerOpen?.kind === "deleteWatchlist"
            ? "This will remove your watchlist items permanently on this device."
            : dangerOpen?.kind === "resetPreferences"
              ? "This will reset your local settings to defaults."
              : "This will permanently remove your account data (demo)."
        }
        confirmText={
          dangerOpen?.kind === "deleteWatchlist"
            ? "Delete Watchlist"
            : dangerOpen?.kind === "resetPreferences"
              ? "Reset"
              : "Delete Account"
        }
        tone="danger"
        onCancel={() => setDangerOpen(null)}
        onConfirm={() => {
          setDangerOpen(null);
          if (dangerOpen?.kind === "deleteWatchlist") {
            localStorage.setItem("watchlist", JSON.stringify([]));
            window.dispatchEvent(
              new CustomEvent("marketmind:watchlist-updated")
            );
          }
          if (dangerOpen?.kind === "resetPreferences") {
            localStorage.removeItem("marketmind_settings_v1");
            window.location.reload();
          }
          if (dangerOpen?.kind === "deleteAccount") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }
        }}
      />
    </main>
  );
}

