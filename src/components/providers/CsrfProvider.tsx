"use client";

import { createContext, useContext, ReactNode } from "react";

interface CsrfContextType {
  token: string | null;
}

const CsrfContext = createContext<CsrfContextType>({ token: null });

export function CsrfProvider({
  children,
  token,
}: {
  children: ReactNode;
  token: string | null;
}) {
  return (
    <CsrfContext.Provider value={{ token }}>
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrfToken(): string | null {
  const context = useContext(CsrfContext);
  if (!context) {
    throw new Error("useCsrfToken must be used within CsrfProvider");
  }
  return context.token;
}
