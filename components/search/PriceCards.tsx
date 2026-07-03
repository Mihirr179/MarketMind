import React from "react";

type Stock = {
  open?: string;
  high?: string;
  low?: string;
  previousClose?: string;
  price: string;
  changePercent?: string;
};

function Card({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
      <p className="text-zinc-300/90 text-sm">{label}</p>
      <p className="text-2xl font-semibold mt-2 text-white/90">{value ?? "—"}</p>
    </div>
  );
}

export default function PriceCards({ stock }: { stock: Stock }) {
  const changeNum = Number(String(stock.changePercent ?? "0").replace("%", ""));
  const isGreen = !Number.isNaN(changeNum) && changeNum >= 0;

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card label="Open" value={stock.open} />
        <Card label="High" value={stock.high} />
        <Card label="Low" value={stock.low} />
        <Card label="Previous Close" value={stock.previousClose} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card label="Current Price" value={`$${stock.price}`} />
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
          <p className="text-zinc-300/90 text-sm">Today’s Change</p>
          <p
            className={`text-2xl font-semibold mt-2 ${
              isGreen ? "text-green-400" : "text-red-400"
            }`}
          >
            {stock.changePercent ?? "—"}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
          <p className="text-zinc-300/90 text-sm">Add</p>
          <p className="text-2xl font-semibold mt-2 text-white/90">—</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
          <p className="text-zinc-300/90 text-sm">Add</p>
          <p className="text-2xl font-semibold mt-2 text-white/90">—</p>
        </div>
      </div>
    </section>
  );
}

