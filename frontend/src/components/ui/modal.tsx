// Modal — Dialog overlay with keyboard support and animations

"use client";

import { useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
} as const;

interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Size variant */
  size?: keyof typeof sizeClasses;
  /** Modal content */
  children: React.ReactNode;
  /** Hide the close button */
  hideCloseButton?: boolean;
  /** Additional className for the content container */
  className?: string;
}

/**
 * Modal dialog with overlay backdrop, close button, Escape key support,
 * and click-outside-to-close.
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Create Project">
 *   <ProjectForm />
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  hideCloseButton = false,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll while modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  // Focus trap: focus the content on open
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-50 w-full mx-4",
          "rounded-xl border border-[hsl(var(--border))]",
          "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
          "shadow-xl animate-scale-in",
          "max-h-[calc(100vh-4rem)] overflow-y-auto",
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between border-b border-[hsl(var(--border))] px-6 py-4">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-[hsl(var(--foreground))]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-[hsl(var(--muted-foreground))]"
                >
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "rounded-lg p-1.5 text-[hsl(var(--muted-foreground))]",
                  "transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                  "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
                )}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// Modal sub-components

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-[hsl(var(--border))] px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
