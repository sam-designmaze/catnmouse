"use client";

import { createContext, useContext, useEffect } from "react";
import type { TenantConfig } from "@/lib/tenant";

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantProvider({
  config,
  children,
}: {
  config: TenantConfig | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (config?.primaryColor) {
      document.documentElement.style.setProperty(
        "--tenant-primary",
        config.primaryColor
      );
    }
  }, [config?.primaryColor]);

  return (
    <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
