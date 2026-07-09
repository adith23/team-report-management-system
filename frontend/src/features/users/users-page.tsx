// ──────────────────────────────────────────────────────────────────────────────
// UsersPage — Manager dashboard to audit users list and assign roles
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { Edit2, ShieldAlert } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/stores/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-display/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RoleEditModal } from "./role-edit-modal";
import { Pagination } from "@/components/data-display/pagination";
import { formatDate } from "@/lib/date-utils";
import { formatRole } from "@/lib/utils";
import { UserRole } from "@/types/common";
import type { User } from "@/types";

export function UsersPage() {
  const [page, setPage] = useState(1);
  const { data: usersData, isLoading, isError } = useUsers(page, 10);
  const { user: currentUser } = useAuthStore();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditRoleClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Define columns for User table
  const columns = [
    {
      key: "full_name",
      header: "Member Name",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name} size="sm" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {user.full_name}
            </p>
            {currentUser?.id === user.id && (
              <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1 py-0.5 rounded">
                You
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email Address",
      cellClassName: "text-slate-500 dark:text-slate-400 font-mono text-xs",
    },
    {
      key: "role",
      header: "Permission Role",
      render: (user: User) => (
        <Badge
          variant={user.role === UserRole.MANAGER ? "success" : "default"}
          size="sm"
        >
          {formatRole(user.role)}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Account Status",
      render: (user: User) => (
        <span className="inline-flex items-center gap-1">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              user.is_active ? "bg-green-500" : "bg-slate-400"
            }`}
          />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Joined Date",
      render: (user: User) => <span>{formatDate(user.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      headerClassName: "text-right",
      render: (user: User) => {
        const isSelf = currentUser?.id === user.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditRoleClick(user)}
              disabled={isSelf}
              className="text-slate-500 hover:text-indigo-600 h-8 px-2.5"
              title={isSelf ? "Cannot change your own role" : "Edit user role"}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Change Role
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="User Management"
        subtitle="View registered members, check active statuses, and assign authorization roles."
      />

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={(usersData?.items as any) || []}
        keyExtractor={(u) => u.id}
        loading={isLoading}
        emptyTitle="No registered users found"
        emptyDescription="There are no users registered in the workspace system yet."
      />

      {/* Pagination controls */}
      {!isLoading && !isError && usersData && usersData.total_pages > 1 && (
        <div className="flex justify-center border-t border-[hsl(var(--border))] pt-6 mt-6">
          <Pagination
            page={page}
            totalPages={usersData.total_pages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Role Edit Modal */}
      <RoleEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
