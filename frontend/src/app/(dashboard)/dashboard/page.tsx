// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Route Page — Secure view for manager analytics hub
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import { AuthGuard } from "@/features/auth/auth-guard";
import { UserRole } from "@/types/common";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Team Dashboard | Team Reports",
  description: "Gain visual insights into team report submissions and metrics.",
};

export default function Dashboard() {
  return (
    <AuthGuard requiredRole={UserRole.MANAGER}>
      <DashboardPage />
    </AuthGuard>
  );
}
