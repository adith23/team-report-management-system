// ──────────────────────────────────────────────────────────────────────────────
// Global 404 — Not Found page
// ──────────────────────────────────────────────────────────────────────────────

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center animate-fade-in-up">
        {/* Large 404 number */}
        <h1 className="text-[8rem] font-bold leading-none tracking-tighter text-[hsl(var(--muted-foreground)/0.15)]">
          404
        </h1>

        {/* Message */}
        <h2 className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">
          Page not found
        </h2>
        <p className="mt-2 max-w-md text-[hsl(var(--muted-foreground))]">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back link */}
        <Link
          href="/reports"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
        >
          ← Back to Reports
        </Link>
      </div>
    </div>
  );
}
