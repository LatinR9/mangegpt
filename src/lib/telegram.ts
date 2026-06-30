import { apps, customers, groupMembers, shareGroups, telegramSettings } from "@/lib/mock-data";
import { daysUntil, formatDate } from "@/lib/utils";

export type PreparedReminder = {
  groupId: string;
  message: string;
};

export function prepareTelegramReminders(): PreparedReminder[] {
  const settings = telegramSettings[0];
  if (!settings.enabled) return [];

  return shareGroups
    .filter((group) => {
      const days = daysUntil(group.expiry_date);
      return days === 1 || (days >= 0 && days <= settings.reminder_days_before_expiry);
    })
    .map((group) => {
      const app = apps.find((item) => item.id === group.app_id);
      const members = groupMembers.filter((member) => member.group_id === group.id);
      const paid = members.filter((member) => member.paid_status === "paid");
      const unpaid = members.filter((member) => member.paid_status !== "paid");
      const unpaidNames = unpaid
        .map((member) => customers.find((customer) => customer.id === member.customer_id)?.nickname ?? "Unknown")
        .join(", ");

      return {
        groupId: group.id,
        message: [
          `Reminder: ${app?.name ?? "Subscription"} / ${group.group_name}`,
          `Expiry date: ${formatDate(group.expiry_date)}`,
          `Total seats: ${group.seats_total}`,
          `Paid: ${paid.length}`,
          `Unpaid: ${unpaid.length}`,
          `Unpaid customers: ${unpaidNames || "None"}`
        ].join("\n")
      };
    });
}

export async function sendTestTelegramReminder() {
  const reminders = prepareTelegramReminders();
  // TODO: Call this function from a daily cron job or Supabase scheduled Edge Function.
  // TODO: Decrypt bot token and chat id server-side only before sending in production.
  return { prepared: reminders.length, reminders };
}
