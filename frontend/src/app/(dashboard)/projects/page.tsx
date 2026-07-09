// ──────────────────────────────────────────────────────────────────────────────
// Projects Route Page — Secure project category management for managers
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import { AuthGuard } from "@/features/auth/auth-guard";
import { UserRole } from "@/types/common";
import { ProjectsPage } from "@/features/projects/projects-page";

export const metadata: Metadata = {
  title: "Projects | Team Reports",
  description: "Configure project categories and color themes.",
};

export default function ProjectsRoute() {
  return (
    <AuthGuard requiredRole={UserRole.MANAGER}>
      <ProjectsPage />
    </AuthGuard>
  );
}
