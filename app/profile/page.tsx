"use client";

import Link from "next/link";
import {
  Bell,
  Camera,
  Check,
  KeyRound,
  LoaderCircle,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
};

const emptyProfile: UserProfile = {
  name: "",
  email: "",
  phone: "",
  bio: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-700 bg-black/50 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-zinc-600 hover:border-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load your profile");
        }

        setProfile({ ...emptyProfile, ...data.user });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessage({
            type: "error",
            text: error instanceof Error ? error.message : "Unable to load your profile",
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, [router]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save changes");
      }

      setProfile({ ...emptyProfile, ...data.user });
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data.user }));
      window.dispatchEvent(new Event("marketmind:user-updated"));
      setMessage({ type: "success", text: "Profile changes saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save changes",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update password");
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({ type: "success", text: data.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const initials =
    profile.name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MM";

  if (loading) {
    return (
      <main className="grid min-h-[calc(100vh-5rem)] place-items-center bg-black">
        <LoaderCircle className="animate-spin text-yellow-400" size={34} />
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-yellow-400/10 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
            Your account
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profile</h1>
          <p className="mt-2 text-zinc-400">
            Manage your personal details, security, and account preferences.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message.type === "success" && <Check size={18} />}
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <div className="space-y-6">
            <form
              onSubmit={handleProfileSubmit}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-black/20 sm:p-7"
            >
              <div className="mb-8 flex flex-col items-center gap-5 border-b border-zinc-800 pb-8 sm:flex-row">
                <div className="relative">
                  <div className="grid size-24 place-items-center rounded-full border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-400/25 to-zinc-900 text-2xl font-bold text-yellow-400 shadow-lg shadow-yellow-400/10">
                    {initials}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-zinc-950 bg-yellow-400 text-black"
                    aria-hidden="true"
                  >
                    <Camera size={15} />
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-semibold">Profile picture</h2>
                  <p className="mt-1 max-w-md text-sm text-zinc-400">
                    Your initials are used as a secure avatar across MarketMind.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-zinc-300">
                  Full Name
                  <span className="relative block">
                    <UserRound className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      required
                      autoComplete="name"
                      value={profile.name}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, name: event.target.value }))
                      }
                      className={`${inputClass} pl-11`}
                    />
                  </span>
                </label>

                <label className="text-sm font-medium text-zinc-300">
                  Email
                  <span className="relative block">
                    <Mail className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={profile.email}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, email: event.target.value }))
                      }
                      className={`${inputClass} pl-11`}
                    />
                  </span>
                </label>

                <label className="text-sm font-medium text-zinc-300 sm:col-span-2">
                  Phone Number
                  <span className="relative block">
                    <Phone className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, phone: event.target.value }))
                      }
                      className={`${inputClass} pl-11`}
                    />
                  </span>
                </label>

                <label className="text-sm font-medium text-zinc-300 sm:col-span-2">
                  Bio / About Me
                  <textarea
                    rows={5}
                    maxLength={500}
                    placeholder="Tell us a little about your investing journey..."
                    value={profile.bio}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, bio: event.target.value }))
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <span className="mt-2 block text-right text-xs text-zinc-500">
                    {profile.bio.length}/500
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition-all duration-200 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <LoaderCircle className="animate-spin" size={18} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            <form
              onSubmit={handlePasswordSubmit}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-7"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <KeyRound size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <p className="text-sm text-zinc-400">Use at least 8 characters.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  ["currentPassword", "Current Password"],
                  ["newPassword", "New Password"],
                  ["confirmPassword", "Confirm Password"],
                ].map(([key, label]) => (
                  <label key={key} className="text-sm font-medium text-zinc-300">
                    {label}
                    <input
                      required
                      type="password"
                      minLength={key === "currentPassword" ? undefined : 8}
                      autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                      value={passwords[key as keyof typeof passwords]}
                      onChange={(event) =>
                        setPasswords((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400/40 px-5 py-3 font-semibold text-yellow-400 transition-all duration-200 hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword && <LoaderCircle className="animate-spin" size={18} />}
                Update Password
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Settings className="text-yellow-400" size={21} />
                <h2 className="text-lg font-semibold">Account Settings</h2>
              </div>
              <div className="space-y-3">
                <Link
                  href="/settings"
                  className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/40 p-4 transition-all duration-200 hover:border-yellow-400/40 hover:bg-yellow-400/5"
                >
                  <Bell className="text-zinc-500 transition-colors group-hover:text-yellow-400" size={20} />
                  <span>
                    <span className="block text-sm font-semibold">Preferences</span>
                    <span className="text-xs text-zinc-500">Theme and notifications</span>
                  </span>
                </Link>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
                  <ShieldCheck className="text-emerald-400" size={20} />
                  <span>
                    <span className="block text-sm font-semibold">Account protected</span>
                    <span className="text-xs text-zinc-500">Password authentication enabled</span>
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 sm:p-6">
              <h2 className="font-semibold text-yellow-400">MarketMind Member</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Your profile keeps your dashboard experience personal and your account details up to date.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
