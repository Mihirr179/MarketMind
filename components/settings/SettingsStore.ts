export type DashboardWidgetKey =
  | "marketOverview"
  | "portfolioSummary"
  | "watchlist"
  | "newsFeed"
  | "aiAssistant"
  | "marketMovers"
  | "economicCalendar"
  | "tradingTerminal";

export type MarketMindSettings = {
  account: {
    fullName: string;
    email: string;
    mobile: string;
    country: string;
    timeZone: string;
  };
  trading: {
    defaultMarket: "NSE" | "BSE" | "NASDAQ" | "NYSE";
    defaultTimeframe: "1D" | "1W" | "1M" | "3M" | "1Y";
    currency: "INR" | "USD";
    defaultChartType: "Candlestick" | "Line" | "Area";
    autoRefreshMarketData: boolean;
  };
  dashboard: {
    widgets: Record<DashboardWidgetKey, boolean>;
  };
  alerts: {
    priceAlerts: boolean;
    volumeSpikeAlerts: boolean;
    newsAlerts: boolean;
    earningsAlerts: boolean;
    portfolioAlerts: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  ai: {
    riskProfile: "Conservative" | "Moderate" | "Aggressive";
    aiAnalysisLevel: "Beginner" | "Intermediate" | "Professional";
    enablePortfolioSuggestions: boolean;
    enableRiskAnalysis: boolean;
    enableMarketInsights: boolean;
    enableNewsSummaries: boolean;
    confidence: number; // 0..100
  };
  appearance: {
    theme: "dark" | "light" | "system";
    density: "compact" | "comfortable" | "spacious";
    accentColor: "gold" | "blue" | "green" | "purple";
    fontSize: "small" | "medium" | "large";
  };
};

export const SETTINGS_STORAGE_KEY = "marketmind_settings_v1";

export const DEFAULT_SETTINGS: MarketMindSettings = {
  account: {
    fullName: "",
    email: "",
    mobile: "",
    country: "India",
    timeZone: "Asia/Kolkata",
  },
  trading: {
    defaultMarket: "NSE",
    defaultTimeframe: "1D",
    currency: "INR",
    defaultChartType: "Candlestick",
    autoRefreshMarketData: true,
  },
  dashboard: {
    widgets: {
      marketOverview: true,
      portfolioSummary: true,
      watchlist: true,
      newsFeed: true,
      aiAssistant: true,
      marketMovers: true,
      economicCalendar: false,
      tradingTerminal: true,
    },
  },
  alerts: {
    priceAlerts: true,
    volumeSpikeAlerts: true,
    newsAlerts: true,
    earningsAlerts: false,
    portfolioAlerts: true,
    pushNotifications: false,
    emailNotifications: true,
  },
  ai: {
    riskProfile: "Moderate",
    aiAnalysisLevel: "Intermediate",
    enablePortfolioSuggestions: true,
    enableRiskAnalysis: true,
    enableMarketInsights: true,
    enableNewsSummaries: true,
    confidence: 72,
  },
  appearance: {
    theme: "system",
    density: "comfortable",
    accentColor: "gold",
    fontSize: "medium",
  },
};

export function loadSettings(): MarketMindSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<MarketMindSettings>;
    // Shallow + nested merge for predictable defaults
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      account: { ...DEFAULT_SETTINGS.account, ...(parsed.account || {}) },
      trading: { ...DEFAULT_SETTINGS.trading, ...(parsed.trading || {}) },
      dashboard: {
        ...DEFAULT_SETTINGS.dashboard,
        ...(parsed.dashboard || {}),
        widgets: {
          ...DEFAULT_SETTINGS.dashboard.widgets,
          ...(typeof (parsed as Partial<MarketMindSettings>).dashboard === "object" && (parsed as Partial<MarketMindSettings>).dashboard
            ? ((parsed as Partial<MarketMindSettings>).dashboard!.widgets as Partial<Record<DashboardWidgetKey, boolean>> | undefined)
            : undefined) ?? {},

        },
      },
      alerts: { ...DEFAULT_SETTINGS.alerts, ...(parsed.alerts || {}) },
      ai: { ...DEFAULT_SETTINGS.ai, ...(parsed.ai || {}) },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: MarketMindSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("marketmind:settings-updated", { detail: next }));
}

