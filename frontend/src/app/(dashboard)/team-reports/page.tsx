// ──────────────────────────────────────────────────────────────────────────────
// TeamReports Route Page — Secure team reports dashboard for managers
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import { AuthGuard } from "@/features/auth/auth-guard";
import { UserRole } from "@/types/common";
import { TeamReportsPage } from "@/features/team-reports/team-reports-page";

export const metadata: Metadata = {
  title: "Team Reports | Team Reports",
  description: "Monitor and audit reports submitted across the entire team.",
};

export default function TeamReportsRoute() {
  return (
    <AuthGuard requiredRole={UserRole.MANAGER}>
      <TeamReportsPage />
    </AuthGuard>
  );
}
