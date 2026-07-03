"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type StockLite = {
  symbol: string;
};

const data1D = [
  { day: "09:30", price: 180 },
  { day: "10:30", price: 185 },
  { day: "11:30", price: 182 },
  { day: "12:30", price: 190 },
  { day: "13:30", price: 195 },
  { day: "14:30", price: 193 },
  { day: "15:30", price: 200 },
];

const data1W = [
  { day: "Mon", price: 180 },
  { day: "Tue", price: 176 },
  { day: "Wed", price: 184 },
  { day: "Thu", price: 190 },
  { day: "Fri", price: 193 },
  { day: "Sat", price: 191 },
  { day: "Sun", price: 200 },
];

const data1M = [
  { day: "W1", price: 170 },
  { day: "W2", price: 176 },
  { day: "W3", price: 183 },
  { day: "W4", price: 195 },
  { day: "W5", price: 191 },
  { day: "W6", price: 198 },
  { day: "W7", price: 205 },
];

export default function ChartCard({ stock }: { stock: StockLite }) {
  const [range, setRange] = useState<"1D" | "1W" | "1M">("1W");

  const chartData = useMemo(() => {
    if (range === "1D") return data1D;
    if (range === "1M") return data1M;
    return data1W;
  }, [range]);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-2xl font-bold text-[#FACC15]">Price Chart</h3>
        <div className="flex gap-2">
          {(["1D", "1W", "1M"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-2 rounded-lg text-sm font-bold border transition ${
                range === r
                  ? "bg-[#FACC15] text-black border-[#FACC15]"
                  : "bg-white/5 border-white/10 text-white hover:border-[#FACC15]/40"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.65)" }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.65)" }} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#FACC15"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

