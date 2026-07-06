import React from "react";

export default function CompanyProfile({
  stock,
}: {
  stock: {
    symbol: string;
  };
}) {
  void stock;

  // Data not available from current /api/search. Placeholder UI only.

  const fields = [
    { label: "Company Name", value: "Information unavailable" },
    { label: "Exchange", value: "Information unavailable" },
    { label: "Sector", value: "Information unavailable" },
    { label: "Industry", value: "Information unavailable" },
    { label: "Country", value: "Information unavailable" },
    { label: "Website", value: "Information unavailable" },
  ];

  return (
    <section className="mb-10">
      <h3 className="text-2xl font-bold text-[#FACC15] mb-4">Company Information</h3>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/5 bg-black/10 p-4">
              <p className="text-zinc-300/90 text-sm">{f.label}</p>
              <p className="text-white/90 font-semibold mt-1">{f.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-white/5 bg-black/10 p-4">
          <p className="text-zinc-300/90 text-sm">Description</p>
          <p className="text-white/90 font-semibold mt-1">
            Information unavailable
          </p>
        </div>
      </div>
    </section>
  );
}

