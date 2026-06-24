"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    investmentGoal: "",
    riskLevel: "",
    sector: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("Account created successfully!");
        window.location.href = "/";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-zinc-950 p-10 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png.jpeg"
            alt="MarketMind Logo"
            width={180}
            height={180}
          />
        </div>

        <h1 className="text-4xl font-bold text-center mb-8">
          Sign Up & Personalize
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          />

          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          >
            <option value="">Select Country</option>
            <option>India</option>
            <option>USA</option>
            <option>Australia</option>
            <option>UK</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          />

          <select
            name="investmentGoal"
            value={formData.investmentGoal}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          >
            <option value="">Investment Goal</option>
            <option>Growth</option>
            <option>Income</option>
            <option>Balanced</option>
          </select>

          <select
            name="riskLevel"
            value={formData.riskLevel}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          >
            <option value="">Risk Level</option>
            <option>Low Risk</option>
            <option>Medium Risk</option>
            <option>High Risk</option>
          </select>

          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
          >
            <option value="">Preferred Sector</option>
            <option>Technology</option>
            <option>Healthcare</option>
            <option>Finance</option>
            <option>Energy</option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-full bg-yellow-400 text-black font-bold p-4 rounded-xl hover:bg-yellow-500"
          >
            Start Your Investing Journey
          </button>

          <p className="text-center text-zinc-400">
            Already have an account?
            <Link href="/" className="text-yellow-400 ml-2 font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}