"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, variant: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant, duration: number = 4000) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const variants = {
    success: {
      icon: CheckCircle2,
      borderColor: "border-green-400",
      textColor: "text-green-300",
      iconColor: "text-green-400",
    },
    error: {
      icon: XCircle,
      borderColor: "border-red-400",
      textColor: "text-red-300",
      iconColor: "text-red-400",
    },
    info: {
      icon: Info,
      borderColor: "border-cyan-400",
      textColor: "text-cyan-300",
      iconColor: "text-cyan-400",
    },
  };

  const variant = variants[toast.variant];
  const Icon = variant.icon;

  return (
    <div
      className={`glass-strong rounded-xl px-4 py-3 flex items-center gap-3 text-sm pointer-events-auto border-l-2 ${variant.borderColor} animate-in fade-in slide-in-from-right-4 duration-300`}
    >
      <Icon size={18} className={variant.iconColor} />
      <span className={variant.textColor}>{toast.message}</span>
    </div>
  );
}
