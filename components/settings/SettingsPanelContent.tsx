"use client";

import React from "react";
import { Lock, Shield, Trash2 } from "lucide-react";

import type { MarketMindSettings } from "@/components/settings/SettingsStore";
import {
  ConfirmDialog,
  FieldHint,
  FieldLabel,
  Modal,
  SelectChips,
  SectionDivider,
  TextInput,
  Toggle,
} from "@/components/settings/SettingsUI";

import { SettingsPanelSection } from "@/components/settings/SettingsPanelSection";

export function SettingsPanelContent({
  activeSection,
  settings,
  changePasswordOpen,
  setChangePasswordOpen,
  dangerOpen,
  setDangerOpen,
  handleUpdate,
}: {
  activeSection:
    | "profile"
    | "appearance"
    | "trading"
    | "ai"
    | "notifications"
    | "security"
    | "data"
    | "about";
  settings: MarketMindSettings;
  changePasswordOpen: boolean;
  setChangePasswordOpen: (v: boolean) => void;
  dangerOpen:
    | null
    | {
        kind: "deleteAccount" | "deleteWatchlist" | "resetPreferences";
      };
  setDangerOpen: (
    v: null | { kind: "deleteAccount" | "deleteWatchlist" | "resetPreferences" }
  ) => void;
  handleUpdate: (patch: Partial<MarketMindSettings>) => void;
}) {
  return (
    <>
      {activeSection === "profile" ? (
        <SettingsPanelSection
          title="Profile"
          description="Manage identity, contact details, and access safeguards."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden">
                    <div className="text-xs text-zinc-500 font-bold">No photo</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">
                    {settings.account.fullName || "—"}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {settings.account.email || "—"}
                  </div>
                  <FieldHint>Member since: {new Date().getFullYear() - 1}</FieldHint>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <TextInput
                    value={settings.account.fullName}
                    onChange={(v) =>
                      handleUpdate({
                        account: { ...settings.account, fullName: v },
                      })
                    }
                    placeholder="e.g., Mihir Sharma"
                  />
                </div>
                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <TextInput
                    value={settings.account.email}
                    onChange={(v) =>
                      handleUpdate({
                        account: { ...settings.account, email: v },
                      })
                    }
                    placeholder="you@company.com"
                    type="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <TextInput
                    value={settings.account.mobile}
                    onChange={(v) =>
                      handleUpdate({
                        account: { ...settings.account, mobile: v },
                      })
                    }
                    placeholder="e.g., +91 99999 99999"
                    type="tel"
                  />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <TextInput
                    value={settings.account.country}
                    onChange={(v) =>
                      handleUpdate({
                        account: { ...settings.account, country: v },
                      })
                    }
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Time Zone</FieldLabel>
                  <TextInput
                    value={settings.account.timeZone}
                    onChange={(v) =>
                      handleUpdate({
                        account: { ...settings.account, timeZone: v },
                      })
                    }
                    placeholder="Asia/Kolkata"
                  />
                </div>

                <div>
                  <FieldLabel>Member Actions</FieldLabel>
                  <button
                    type="button"
                    onClick={() => {
                      // local persistence already saves
                    }}
                    className="w-full rounded-xl bg-[var(--accent)] text-zinc-950 font-extrabold px-4 py-3 border border-[color:var(--accent)]/60 hover:brightness-110 active:brightness-95 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <SectionDivider />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold">Email Verification Status</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Secure access for notifications.
                      </div>
                    </div>
                    <div className="text-xs font-bold rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                      Verified
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold">Phone Verification Status</div>
                      <div className="text-xs text-zinc-400 mt-1">OTP protected sign-in.</div>
                    </div>
                    <div className="text-xs font-bold rounded-full px-3 py-1 bg-yellow-500/10 border border-yellow-400/20 text-yellow-200">
                      Pending
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "appearance" ? (
        <SettingsPanelSection
          title="Appearance"
          description="Dial your platform look and density. All changes apply instantly."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <FieldLabel>Theme</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.appearance.theme}
                  onChange={(v) =>
                    handleUpdate({
                      appearance: { ...settings.appearance, theme: v },
                    })
                  }
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                    { value: "system", label: "System" },
                  ]}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <FieldLabel>Layout Density</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.appearance.density}
                  onChange={(v) =>
                    handleUpdate({
                      appearance: { ...settings.appearance, density: v },
                    })
                  }
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "comfortable", label: "Comfortable" },
                    { value: "spacious", label: "Spacious" },
                  ]}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <FieldLabel>Accent Color</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.appearance.accentColor}
                  onChange={(v) =>
                    handleUpdate({
                      appearance: { ...settings.appearance, accentColor: v },
                    })
                  }
                  options={[
                    { value: "gold", label: "Gold" },
                    { value: "blue", label: "Blue" },
                    { value: "green", label: "Green" },
                    { value: "purple", label: "Purple" },
                  ]}
                />
              </div>
            </div>
          </div>

          <SectionDivider />

          <div>
            <FieldLabel>Font Size</FieldLabel>
            <div className="mt-3">
              <SelectChips
                value={settings.appearance.fontSize}
                onChange={(v) =>
                  handleUpdate({
                    appearance: { ...settings.appearance, fontSize: v },
                  })
                }
                options={[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                ]}
              />
            </div>
            <FieldHint>This prototype uses CSS variable scaling for instant preview.</FieldHint>
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "trading" ? (
        <SettingsPanelSection
          title="Trading Preferences"
          description="Control your default markets, chart behavior, and data refresh cadence."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Default Market</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.trading.defaultMarket}
                  onChange={(v) =>
                    handleUpdate({
                      trading: { ...settings.trading, defaultMarket: v },
                    })
                  }
                  options={[
                    { value: "NSE", label: "NSE" },
                    { value: "BSE", label: "BSE" },
                    { value: "NASDAQ", label: "NASDAQ" },
                    { value: "NYSE", label: "NYSE" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel>Default Timeframe</FieldLabel>
                <div className="mt-3">
                  <SelectChips
                    value={settings.trading.defaultTimeframe}
                    onChange={(v) =>
                      handleUpdate({
                        trading: { ...settings.trading, defaultTimeframe: v },
                      })
                    }
                    options={[
                      { value: "1D", label: "1D" },
                      { value: "1W", label: "1W" },
                      { value: "1M", label: "1M" },
                      { value: "3M", label: "3M" },
                      { value: "1Y", label: "1Y" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Currency</FieldLabel>
                <div className="mt-3">
                  <SelectChips
                    value={settings.trading.currency}
                    onChange={(v) =>
                      handleUpdate({
                        trading: { ...settings.trading, currency: v },
                      })
                    }
                    options={[
                      { value: "INR", label: "INR" },
                      { value: "USD", label: "USD" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <SectionDivider />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Default Chart Type</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.trading.defaultChartType}
                  onChange={(v) =>
                    handleUpdate({
                      trading: { ...settings.trading, defaultChartType: v },
                    })
                  }
                  options={[
                    { value: "Candlestick", label: "Candlestick" },
                    { value: "Line", label: "Line" },
                    { value: "Area", label: "Area" },
                  ]}
                />
              </div>
            </div>

            <div>
              <Toggle
                checked={settings.trading.autoRefreshMarketData}
                onChange={(v) =>
                  handleUpdate({
                    trading: {
                      ...settings.trading,
                      autoRefreshMarketData: v,
                    },
                  })
                }
                label="Auto Refresh Market Data"
                hint="Keeps your terminal feed up to date."
              />
            </div>
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "ai" ? (
        <SettingsPanelSection
          title="MarketMind AI Settings"
          description="Control how AI analyzes risk, drafts insights, and supports your trading decisions."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Risk Profile</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.ai.riskProfile}
                  onChange={(v) =>
                    handleUpdate({
                      ai: { ...settings.ai, riskProfile: v },
                    })
                  }
                  options={[
                    { value: "Conservative", label: "Conservative" },
                    { value: "Moderate", label: "Moderate" },
                    { value: "Aggressive", label: "Aggressive" },
                  ]}
                />
              </div>
            </div>

            <div>
              <FieldLabel>AI Analysis Level</FieldLabel>
              <div className="mt-3">
                <SelectChips
                  value={settings.ai.aiAnalysisLevel}
                  onChange={(v) =>
                    handleUpdate({
                      ai: { ...settings.ai, aiAnalysisLevel: v },
                    })
                  }
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Professional", label: "Professional" },
                  ]}
                />
              </div>
            </div>
          </div>

          <SectionDivider />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">AI Confidence Slider</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Higher confidence reduces speculative recommendations.
                  </div>
                </div>
                <div className="text-sm font-extrabold text-[var(--accent)]">
                  {settings.ai.confidence}%
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={settings.ai.confidence}
                onChange={(e) =>
                  handleUpdate({
                    ai: { ...settings.ai, confidence: Number(e.target.value) },
                  })
                }
                className="mt-4 w-full accent-[var(--accent)]"
              />
            </div>

            <div className="space-y-3">
              <Toggle
                checked={settings.ai.enablePortfolioSuggestions}
                onChange={(v) =>
                  handleUpdate({
                    ai: { ...settings.ai, enablePortfolioSuggestions: v },
                  })
                }
                label="AI Portfolio Suggestions"
              />
              <Toggle
                checked={settings.ai.enableRiskAnalysis}
                onChange={(v) =>
                  handleUpdate({
                    ai: { ...settings.ai, enableRiskAnalysis: v },
                  })
                }
                label="AI Risk Analysis"
              />
              <Toggle
                checked={settings.ai.enableMarketInsights}
                onChange={(v) =>
                  handleUpdate({
                    ai: { ...settings.ai, enableMarketInsights: v },
                  })
                }
                label="AI Market Insights"
              />
              <Toggle
                checked={settings.ai.enableNewsSummaries}
                onChange={(v) =>
                  handleUpdate({
                    ai: { ...settings.ai, enableNewsSummaries: v },
                  })
                }
                label="AI News Summaries"
              />
            </div>
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "notifications" ? (
        <SettingsPanelSection
          title="Notifications"
          description="Choose which events you want to be notified about."
          right={<div className="text-xs text-zinc-400">Fine-grained controls</div>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Toggle
              checked={settings.alerts.priceAlerts}
              onChange={(v) =>
                handleUpdate({ alerts: { ...settings.alerts, priceAlerts: v } })
              }
              label="Price Alerts"
            />
            <Toggle
              checked={settings.alerts.volumeSpikeAlerts}
              onChange={(v) =>
                handleUpdate({
                  alerts: { ...settings.alerts, volumeSpikeAlerts: v },
                })
              }
              label="Volume Spike Alerts"
            />
            <Toggle
              checked={settings.alerts.newsAlerts}
              onChange={(v) =>
                handleUpdate({ alerts: { ...settings.alerts, newsAlerts: v } })
              }
              label="News Alerts"
            />
            <Toggle
              checked={settings.alerts.earningsAlerts}
              onChange={(v) =>
                handleUpdate({
                  alerts: { ...settings.alerts, earningsAlerts: v },
                })
              }
              label="Earnings Alerts"
            />
            <Toggle
              checked={settings.alerts.portfolioAlerts}
              onChange={(v) =>
                handleUpdate({
                  alerts: { ...settings.alerts, portfolioAlerts: v },
                })
              }
              label="Portfolio Alerts"
            />
            <Toggle
              checked={settings.alerts.pushNotifications}
              onChange={(v) =>
                handleUpdate({
                  alerts: { ...settings.alerts, pushNotifications: v },
                })
              }
              label="Push Notifications"
            />
            <Toggle
              checked={settings.alerts.emailNotifications}
              onChange={(v) =>
                handleUpdate({
                  alerts: { ...settings.alerts, emailNotifications: v },
                })
              }
              label="Email Notifications"
            />
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "security" ? (
        <SettingsPanelSection
          title="Security Center"
          description="Protect your account with strong authentication and session controls."
          right={<div className="text-xs text-zinc-400">Last login • demo</div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">Change Password</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Rotate credentials securely.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(true)}
                  className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/15 transition"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">Two-Factor Authentication</div>
                  <div className="text-xs text-zinc-400 mt-1">OTP with device trust.</div>
                </div>
                <div className="text-xs font-bold rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                  Enabled
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">Active Sessions</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Manage and revoke sessions.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // demo
                  }}
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/15 transition"
                >
                  Logout All
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">Login History</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Recent devices and locations.
                  </div>
                </div>
                <div className="text-xs text-zinc-500">12 events</div>
              </div>
            </div>
          </div>

          <SectionDivider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-zinc-400 font-bold">Last Login</div>
              <div className="mt-2 text-sm font-bold">Today • 09:14</div>
              <div className="mt-1 text-xs text-zinc-500">Successful</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-zinc-400 font-bold">Login Location</div>
              <div className="mt-2 text-sm font-bold">Bengaluru, IN</div>
              <div className="mt-1 text-xs text-zinc-500">Geo verified</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-zinc-400 font-bold">Browser Used</div>
              <div className="mt-2 text-sm font-bold">Chrome • Windows</div>
              <div className="mt-1 text-xs text-zinc-500">Device trusted</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-[var(--accent)]" />
              <div>
                <div className="text-sm font-bold">Device Management</div>
                <div className="text-xs text-zinc-400 mt-1">
                  Manage trusted devices and revoke access.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10 transition"
            >
              Manage Devices
            </button>
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "data" ? (
        <SettingsPanelSection
          title="Data & Privacy"
          description="Export your data or reset preferences. Destructive actions require confirmation."
          right={<div className="text-xs text-zinc-400">Control at every step</div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-bold">Exports</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10 transition">
                  Export Portfolio
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10 transition">
                  Export Watchlist
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10 transition">
                  Download Account Data
                </button>
                <button className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/15 transition">
                  Backup Settings
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-200">
                  <Trash2 size={18} />
                </span>
                <div>
                  <div className="text-sm font-bold text-red-200">Danger Zone</div>
                  <div className="text-xs text-red-300/80 mt-1">Proceed carefully.</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setDangerOpen({ kind: "deleteWatchlist" })}
                  className="w-full rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-500/15 transition"
                >
                  Delete Watchlist
                </button>
                <button
                  type="button"
                  onClick={() => setDangerOpen({ kind: "resetPreferences" })}
                  className="w-full rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-500/15 transition"
                >
                  Reset Preferences
                </button>
                <button
                  type="button"
                  onClick={() => setDangerOpen({ kind: "deleteAccount" })}
                  className="w-full rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-500/20 transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </SettingsPanelSection>
      ) : null}

      {activeSection === "about" ? (
        <SettingsPanelSection
          title="About MarketMind"
          description="Enterprise-grade insights and AI-powered market intelligence."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-bold">MarketMind</div>
              <FieldHint>Premium trading + AI research workspace.</FieldHint>
              <div className="mt-4 text-xs text-zinc-400">Version</div>
              <div className="mt-1 text-sm font-bold">1.0.0</div>
              <div className="mt-4 text-xs text-zinc-400">Build Number</div>
              <div className="mt-1 text-sm font-bold">001</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-bold">Developer</div>
              <FieldHint>Demo identity for UI prototype.</FieldHint>
              <div className="mt-4 text-xs text-zinc-400">GitHub Repository</div>
              <div className="mt-1 text-sm font-bold">github.com/marketmind</div>
            </div>
          </div>
        </SettingsPanelSection>
      ) : null}

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
            <FieldLabel>Current Password</FieldLabel>
            <TextInput value={""} onChange={() => {}} placeholder="••••••••" type="password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>New Password</FieldLabel>
              <TextInput value={""} onChange={() => {}} placeholder="••••••••" type="password" />
            </div>
            <div>
              <FieldLabel>Confirm New Password</FieldLabel>
              <TextInput value={""} onChange={() => {}} placeholder="••••••••" type="password" />
            </div>
          </div>
          <FieldHint>This is a UI prototype. In production, connect to your secure API.</FieldHint>
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
        }}
      />
    </>
  );
}

