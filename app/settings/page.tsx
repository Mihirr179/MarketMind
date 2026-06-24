"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  theme: "dark" | "light";
  notifications: {
    watchlistUpdates: boolean;
    newsDigest: boolean;
  };
};

const STORAGE_KEY = "settings";

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<Settings>({
    theme: "dark",
    notifications: {
      watchlistUpdates: true,
      newsDigest: true,
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedToken || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const next: Settings = {
          ...settings,
          ...parsed,
          notifications: {
            ...settings.notifications,
            ...(parsed?.notifications || {}),
          },
        };
        queueMicrotask(() => setSettings(next));
      }

    } catch {

      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  const save = (next: Settings) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };


  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-yellow-400 mb-8">Settings</h1>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-yellow-400 mb-8">Settings</h1>

        <div className="bg-zinc-900/60 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800">
          <div className="space-y-6">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Theme</p>
              <div className="flex gap-3">
                <button
                  onClick={() => save({ ...settings, theme: "dark" })}
                  className={`flex-1 border border-zinc-700 p-3 rounded-xl transition font-bold ${
                    settings.theme === "dark" ? "bg-yellow-400 text-black border-yellow-300" : "bg-black/40 hover:border-zinc-500"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => save({ ...settings, theme: "light" })}
                  className={`flex-1 border border-zinc-700 p-3 rounded-xl transition font-bold ${
                    settings.theme === "light" ? "bg-yellow-400 text-black border-yellow-300" : "bg-black/40 hover:border-zinc-500"
                  }`}
                >
                  Light
                </button>
              </div>
              <p className="text-zinc-500 text-xs mt-2">Only stored locally for now.</p>
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-4">Notifications</p>

              <label className="flex items-center justify-between gap-4 bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 mb-3">
                <span className="font-bold">Watchlist updates</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.watchlistUpdates}
                  onChange={(e) =>
                    save({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        watchlistUpdates: e.target.checked,
                      },
                    })
                  }
                />
              </label>

              <label className="flex items-center justify-between gap-4 bg-black/40 border border-zinc-700 rounded-xl px-4 py-3">
                <span className="font-bold">News digest</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.newsDigest}
                  onChange={(e) =>
                    save({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        newsDigest: e.target.checked,
                      },
                    })
                  }
                />
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-4 rounded-xl border border-zinc-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

