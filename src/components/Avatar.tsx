import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export function Avatar({
  user,
  size = "md",
}: {
  user: User;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${SIZES[size]}`}
      style={{ backgroundColor: user.avatarColor }}
      title={user.fullName}
    >
      {initials(user.fullName)}
    </span>
  );
}
