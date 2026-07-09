"use client";

import React from "react";

import { ChartStateProvider } from "@/components/dashboard/ChartStateContext";
import { PortfolioDataProvider } from "@/components/dashboard/PortfolioDataContext";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  return (
    <PortfolioDataProvider>
      <ChartStateProvider>
        <DashboardLayout />
      </ChartStateProvider>
    </PortfolioDataProvider>
  );
}


