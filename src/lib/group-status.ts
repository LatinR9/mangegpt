import type { GroupMember, GroupStatus, ShareGroup } from "@/lib/types";
import { daysUntil } from "@/lib/utils";

export function calculateGroupStatus(group: ShareGroup, members: GroupMember[]): GroupStatus {
  const remaining = daysUntil(group.expiry_date);
  if (remaining < 0) return "expired";
  if (members.length < group.seats_total) return "incomplete";
  if (remaining <= 7) return "expiring_soon";
  if (members.every((member) => member.paid_status === "paid")) return "paid_all";
  if (members.every((member) => member.paid_status === "unpaid")) return "unpaid";
  return "partially_paid";
}

export function statusLabel(status: GroupStatus) {
  return status.replaceAll("_", " ");
}
