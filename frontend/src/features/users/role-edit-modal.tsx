// RoleEditModal — Modal to change user role (Team Member or Manager)

"use client";

import { useEffect, useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpdateUserRole } from "@/hooks/use-users";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/common";
import { toast } from "@/components/ui/toast";
import type { User } from "@/types";

interface RoleEditModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function RoleEditModal({ open, onClose, user }: RoleEditModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.TEAM_MEMBER,
  );
  const updateRoleMutation = useUpdateUserRole();
  const { user: currentUser } = useAuthStore();

  const isSelf = currentUser?.id === user?.id;

  useEffect(() => {
    if (open && user) {
      setSelectedRole(user.role);
    }
  }, [open, user]);

  const handleSave = () => {
    if (!user) return;

    if (isSelf) {
      toast.error("You cannot change your own role.");
      return;
    }

    updateRoleMutation.mutate(
      { userId: user.id, role: selectedRole },
      {
        onSuccess: () => {
          toast.success(`Role for ${user.full_name} updated successfully!`);
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update role.");
        },
      },
    );
  };

  const roleOptions = [
    { value: UserRole.TEAM_MEMBER, label: "Team Member" },
    { value: UserRole.MANAGER, label: "Manager" },
  ];

  const isSubmitting = updateRoleMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User Role"
      description={
        user
          ? `Update authorization permissions for ${user.full_name}`
          : undefined
      }
      size="sm"
    >
      <div className="space-y-4 pt-2">
        {/* Role Select Dropdown */}
        <Select
          label="Authorization Role"
          options={roleOptions}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          disabled={isSubmitting || isSelf}
        />

        {isSelf && (
          <p className="text-xs text-[hsl(var(--destructive))] font-medium">
            You cannot change your own authorization role.
          </p>
        )}

        {/* Modal Actions */}
        <ModalFooter className="px-0 pb-0 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSubmitting}
            disabled={isSelf}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Save Changes
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
