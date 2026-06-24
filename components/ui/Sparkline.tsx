"use client";

import { useMemo } from "react";

export default function Sparkline({
  values,
  tone = "yellow",
}: {
  values: number[];
  tone?: "yellow" | "green" | "red" | "blue";
}) {
  const { path, min, max } = useMemo(() => {
    const pts = values.length ? values : [0];
    const minV = Math.min(...pts);
    const maxV = Math.max(...pts);

    const w = 120;
    const h = 32;
    const pad = 2;

    const toX = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, pts.length - 1);
    const toY = (v: number) => {
      const t = maxV === minV ? 0.5 : (v - minV) / (maxV - minV);
      return h - pad - t * (h - pad * 2);
    };

    const d = pts
      .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`)
      .join(" ");

    return { path: d, min: minV, max: maxV };
  }, [values]);

  const stroke =
    tone === "green"
      ? "#22C55E"
      : tone === "red"
        ? "#EF4444"
        : tone === "blue"
          ? "#3B82F6"
          : "#FACC15";

  return (
    <svg viewBox="0 0 120 32" className="h-8 w-28" aria-hidden="true">
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

