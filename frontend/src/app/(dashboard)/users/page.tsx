// Users Route Page — Secure user management and admin panel for managers

import { Metadata } from "next";
import { AuthGuard } from "@/features/auth/auth-guard";
import { UserRole } from "@/types/common";
import { UsersPage } from "@/features/users/users-page";

export const metadata: Metadata = {
  title: "User Management | Team Reports",
  description: "Audit team members and assign system permissions.",
};

export default function UsersRoute() {
  return (
    <AuthGuard requiredRole={UserRole.MANAGER}>
      <UsersPage />
    </AuthGuard>
  );
}
