// ──────────────────────────────────────────────────────────────────────────────
// Auth Layout — Shared layout structure for authentication pages
// ──────────────────────────────────────────────────────────────────────────────

import { BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo / Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-xl shadow-indigo-600/20 mb-3">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Team Reports
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Weekly Report Management System
          </p>
        </div>

        {/* Card wrapper */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  );
}
