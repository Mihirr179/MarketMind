"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SettingsSectionKey } from "@/components/settings/SettingsSections";
import { SETTINGS_SECTIONS } from "@/components/settings/SettingsSections";

export function SettingsPremiumLayout({
  activeSection,
  setActiveSection,
  header,
  panel,
}: {
  activeSection: SettingsSectionKey;
  setActiveSection: (s: SettingsSectionKey) => void;
  header: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {header}

      <div className="flex gap-6">
        <aside className="w-[300px] shrink-0">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
              <div className="px-2 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                  Settings
                </div>
                <div className="mt-1 text-sm font-semibold text-white/90">
                  Manage your account, trading preferences, AI configuration and platform preferences.
                </div>
              </div>

              <div className="space-y-2">
                {SETTINGS_SECTIONS.map(({ key, label, Icon }) => {
                  const active = activeSection === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSection(key)}
                      className={
                        "group w-full rounded-2xl border px-3 py-3 text-left transition-all duration-200 " +
                        (active
                          ? "border-[var(--accent)] bg-white/10 shadow-[0_0_0_1px_rgba(250,204,21,0.12)]"
                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--accent)]/60")
                      }
                      aria-current={active ? "page" : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            "grid size-9 place-items-center rounded-xl border transition " +
                            (active
                              ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                              : "border-white/10 bg-black/20 text-white/80 group-hover:text-white")
                          }
                        >
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white/95">{label}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {key === "profile"
                              ? "Account details"
                              : key === "appearance"
                                ? "Theme & UI"
                                : key === "trading"
                                  ? "Chart defaults"
                                  : key === "ai"
                                    ? "Assistant behavior"
                                    : key === "notifications"
                                      ? "Alerts & channels"
                                      : key === "security"
                                        ? "2FA & devices"
                                        : key === "data"
                                          ? "Exports & privacy"
                                          : "App information"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-4"
            >
              {panel}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

