import React from "react";

import type { ReactNode } from "react";

import { SettingsCard } from "@/components/settings/SettingsUI";

export function SettingsPanelSection({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SettingsCard title={title} description={description} right={right}>
      {children}
    </SettingsCard>
  );
}

