"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SETTINGS,
  type MarketMindSettings,
  loadSettings,
  saveSettings,
} from "./SettingsStore";

export function useMarketMindSettings() {
  const [settings, setSettingsState] = useState<MarketMindSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      setSettingsState(loadSettings());
      setLoading(false);
    };

    // localStorage access safe in browser
    const t = window.setTimeout(init, 0);
    return () => window.clearTimeout(t);
  }, []);

  const setSettingsStateSafe = useCallback((updater: MarketMindSettings | ((prev: MarketMindSettings) => MarketMindSettings)) => {
    setSettingsState((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: MarketMindSettings) => MarketMindSettings)(prev)
          : updater;
      return next;

    });
  }, []);

  const setSettings = useCallback((updater: MarketMindSettings | ((prev: MarketMindSettings) => MarketMindSettings)) => {
    setSettingsStateSafe(updater);
    setSettingsState((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: MarketMindSettings) => MarketMindSettings)(prev)
          : updater;

      saveSettings(next);
      return next;
    });
  }, [setSettingsStateSafe]);

  const api = useMemo(() => {
    return {
      settings,
      loading,
      setSettings,
    };
  }, [settings, loading, setSettings]);

  return api;
}

