// ──────────────────────────────────────────────────────────────────────────────
// Avatar — User avatar with initials fallback
// ──────────────────────────────────────────────────────────────────────────────

import { cn, getInitials } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

/**
 * Generate a consistent background color from a name string.
 * Uses a simple hash to map names to a curated palette.
 */
function getAvatarColor(name: string): string {
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-sky-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface AvatarProps {
  /** Full name used to generate initials and background color */
  name: string;
  /** Optional image URL */
  src?: string;
  /** Size variant */
  size?: keyof typeof sizeClasses;
  className?: string;
}

/**
 * Avatar with initials fallback and consistent color based on name.
 *
 * @example
 * <Avatar name="Alice Smith" size="md" />
 * <Avatar name="Bob" src="/avatars/bob.jpg" size="lg" />
 */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-2 ring-[hsl(var(--background))]",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white",
        "ring-2 ring-[hsl(var(--background))]",
        bgColor,
        sizeClasses[size],
        className,
      )}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}
