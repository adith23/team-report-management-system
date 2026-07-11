// Toast — Notification system (store + component)

"use client";

import { create } from "zustand";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

// Toast Types

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// Toast Store

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Convenience functions

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", message, duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", message, duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", message, duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", message, duration }),
};

// Toast Icon Map

const toastConfig: Record<
  ToastType,
  { icon: React.ElementType; colorClass: string }
> = {
  success: {
    icon: CheckCircle2,
    colorClass: "text-green-500 dark:text-green-400",
  },
  error: {
    icon: AlertCircle,
    colorClass: "text-red-500 dark:text-red-400",
  },
  warning: {
    icon: AlertCircle,
    colorClass: "text-yellow-500 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    colorClass: "text-blue-500 dark:text-blue-400",
  },
};

// Single Toast Item

function ToastItem({ id, type, message }: Toast) {
  const { removeToast } = useToastStore();
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3",
        "rounded-lg border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))] p-4 shadow-lg",
        "animate-slide-in-right",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.colorClass)} />
      <p className="flex-1 text-sm text-[hsl(var(--foreground))]">{message}</p>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="shrink-0 rounded p-0.5 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast Container

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}
