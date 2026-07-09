"use client";

import React from "react";

import TerminalMetricCards from "@/components/dashboard/TerminalMetricCards";

export default function DashboardMetrics() {
  return (
    <section className="min-w-0">
      <div
        className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
      >
        <TerminalMetricCards />
      </div>
    </section>
  );

}



