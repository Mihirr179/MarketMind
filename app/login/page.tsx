"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Save token
        localStorage.setItem("token", data.token);

        // Save user data
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white grid md:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-xl bg-zinc-950 p-10 rounded-3xl border border-zinc-800 shadow-2xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png.jpeg"
              alt="MarketMind Logo"
              width={220}
              height={220}
              priority
            />
          </div>

          <h2 className="text-5xl font-bold text-center mb-8">
            Log In Your Account
          </h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 mb-5 rounded-xl bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-yellow-400"
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-yellow-400"
          />

          <div className="flex justify-between items-center text-sm text-zinc-400 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember Me
            </label>

            <button className="hover:text-yellow-400">
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-4 rounded-xl mt-6 transition"
          >
            Log In
          </button>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-zinc-700"></div>

            <span className="px-4 text-zinc-500">
              or continue with
            </span>

            <div className="flex-1 border-t border-zinc-700"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 hover:border-yellow-400 transition">
              Google
            </button>

            <button className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 hover:border-yellow-400 transition">
              Apple
            </button>
          </div>

          <p className="text-center text-zinc-400 mt-8">
Don&apos;t have an account?
            <Link
              href="/signup"
              className="text-yellow-400 ml-2 font-semibold hover:text-yellow-300"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden md:flex border-l border-zinc-800 p-16 flex-col justify-center">
        <h2 className="text-6xl font-bold leading-tight">
          MarketMind turned my watchlist into a winning list.
        </h2>

        <p className="text-zinc-400 mt-8 text-xl">
          The alerts are spot-on, and I feel more confident making smarter
          investment decisions every day.
        </p>

        <div className="mt-8">
          <p className="font-semibold text-lg">Ethan R.</p>
          <p className="text-zinc-500">Retail Investor</p>
        </div>

        <div className="text-yellow-400 text-3xl mt-8">
          ★★★★★
        </div>

        <div className="mt-12 rounded-3xl overflow-hidden border border-zinc-800 shadow-xl">
          <Image
            src="/Dashboard.png"
            alt="Dashboard Preview"
            width={1400}
            height={900}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </main>
  );
}