import { Badge } from "@/components/ui/badge";
import type { GroupStatus, PaidStatus } from "@/lib/types";
import { statusLabel } from "@/lib/group-status";

type Props = { status: GroupStatus | PaidStatus | string };
type BadgeVariant = "success" | "danger" | "warning" | "secondary";

export function StatusBadge({ status }: Props) {
  const variant: BadgeVariant = status.includes("paid_all") || status === "paid"
    ? "success"
    : status.includes("unpaid") || status === "expired"
      ? "danger"
      : status.includes("partial") || status === "expiring_soon"
        ? "warning"
        : "secondary";
  const label = status.includes("_") ? statusLabel(status as GroupStatus) : status;
  return <Badge variant={variant}>{label}</Badge>;
}
