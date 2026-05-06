"use client";

import { useEffect, useState } from "react";
import { TenantProvider } from "@/components/branding/TenantProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CsrfProvider } from "@/components/providers/CsrfProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { TenantConfig } from "@/lib/tenant";

export function RootProviders({
  config,
  children,
}: {
  config: TenantConfig | null;
  children: React.ReactNode;
}) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSRF token from API route
    fetch("/api/csrf-token")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch((err) => console.error("Failed to fetch CSRF token:", err));
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TenantProvider config={config}>
          <CsrfProvider token={csrfToken}>
            <ToastProvider>
              {children}
              <ThemeToggle />
            </ToastProvider>
          </CsrfProvider>
        </TenantProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
