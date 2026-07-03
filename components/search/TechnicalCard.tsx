import React from "react";

type Stock = {
  recommendation: "BUY" | "SELL";
  confidence: number;
  changePercent?: string;
};

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "yellow" | "red";
}) {
  const colorClass =
    tone === "green"
      ? "text-green-400"
      : tone === "yellow"
        ? "text-yellow-300"
        : "text-red-400";

  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-4">
      <p className="text-zinc-300/90 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
    </div>
  );
}

export default function TechnicalCard({ stock }: { stock: Stock }) {
  const changeNum = Number(String(stock.changePercent ?? "0").replace("%", ""));
  const tone: "green" | "yellow" | "red" =
    stock.recommendation === "BUY" && changeNum >= 0
      ? "green"
      : stock.recommendation === "SELL" && changeNum < 0
        ? "red"
        : "yellow";

  const recommendationLabel = stock.recommendation === "BUY" ? "Bullish" : "Bearish";

  const badgeClass =
    tone === "green"
      ? "bg-green-500/20 text-green-300 border-green-400/30"
      : tone === "yellow"
        ? "bg-yellow-500/20 text-yellow-200 border-yellow-400/30"
        : "bg-red-500/20 text-red-300 border-red-400/30";

  return (
    <section className="mb-10">
      <h3 className="text-2xl font-bold text-[#FACC15] mb-4">Technical Analysis</h3>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Metric label="Trend" value={tone === "green" ? "Uptrend" : tone === "red" ? "Downtrend" : "Range"} tone={tone} />
          <Metric label="Momentum" value={tone === "green" ? "Strong" : tone === "red" ? "Weak" : "Mixed"} tone={tone} />
          <Metric label="Volatility" value={tone === "yellow" ? "Medium" : "High"} tone={tone === "yellow" ? "yellow" : tone} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className={`rounded-xl border p-4 ${badgeClass}`}>
            <p className="text-zinc-200/90 text-sm">Recommendation</p>
            <p className="text-3xl font-bold mt-1">{recommendationLabel}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
            <p className="text-zinc-300/90 text-sm">Confidence</p>
            <p className="text-3xl font-bold mt-1 text-yellow-300">{stock.confidence}%</p>
            <p
              className={`mt-2 font-semibold ${
                String(stock.changePercent ?? "").includes("-")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              Daily Change {stock.changePercent ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

