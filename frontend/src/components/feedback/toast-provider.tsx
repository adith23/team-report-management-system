// Toast Provider — Mounts the toast notification container in the app

"use client";

import { ToastContainer } from "@/components/ui/toast";

/**
 * Toast provider component. Mount once in the root layout or providers
 * to enable toast notifications throughout the app.
 *
 * Usage:
 * 1. Add `<ToastProvider />` in your providers/layout
 * 2. Call `toast.success("Message")` from anywhere
 *
 * @example
 * // In providers.tsx:
 * <ToastProvider />
 *
 * // In any component:
 * import { toast } from "@/components/ui/toast";
 * toast.success("Report submitted successfully!");
 * toast.error("Failed to save draft.");
 */
export function ToastProvider() {
  return <ToastContainer />;
}
