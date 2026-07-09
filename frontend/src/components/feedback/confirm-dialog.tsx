// ──────────────────────────────────────────────────────────────────────────────
// Confirm Dialog — Confirmation modal for destructive actions
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the dialog should close */
  onClose: () => void;
  /** Called when the user confirms */
  onConfirm: () => void;
  /** Dialog title */
  title?: string;
  /** Description/explanation text */
  description?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the confirm action is destructive (red button) */
  destructive?: boolean;
  /** Whether the confirm action is in progress */
  loading?: boolean;
}

/**
 * Confirmation dialog for irreversible or destructive actions.
 *
 * @example
 * <ConfirmDialog
 *   open={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Project"
 *   description="Are you sure you want to delete this project? This action cannot be undone."
 *   confirmText="Delete"
 *   destructive
 *   loading={isDeleting}
 * />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideCloseButton>
      <div className="flex flex-col items-center text-center px-2 py-4">
        {/* Warning icon */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            destructive
              ? "bg-[hsl(var(--destructive)/0.1)]"
              : "bg-[hsl(var(--warning)/0.1)]",
          )}
        >
          <AlertTriangle
            className={cn(
              "h-6 w-6",
              destructive
                ? "text-[hsl(var(--destructive))]"
                : "text-[hsl(var(--warning))]",
            )}
          />
        </div>

        {/* Title + Description */}
        <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--foreground))]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
          {description}
        </p>
      </div>

      <ModalFooter className="justify-center gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={destructive ? "destructive" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
