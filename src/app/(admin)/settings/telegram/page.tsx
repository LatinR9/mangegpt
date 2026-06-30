"use client";

import { FormEvent, useMemo, useState } from "react";
import { Send, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { useAdminData } from "@/hooks/use-admin-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { telegramSettings as seedTelegramSettings } from "@/lib/mock-data";
import type { TelegramSettings } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/utils";

const defaultSettings: TelegramSettings = {
  ...seedTelegramSettings[0],
  bot_token: seedTelegramSettings[0]?.bot_token ?? "",
  chat_id: seedTelegramSettings[0]?.chat_id ?? "",
  reminder_days_before: seedTelegramSettings[0]?.reminder_days_before ?? seedTelegramSettings[0]?.reminder_days_before_expiry ?? 3
};

export default function TelegramSettingsPage() {
  const { apps, groupMembers, shareGroups, customers } = useAdminData();
  const [settings, setSettings] = useLocalStorageState<TelegramSettings>("sgm.telegramSettings", defaultSettings);
  const [form, setForm] = useState<TelegramSettings>(settings);
  const [message, setMessage] = useState("SubGroup Manager test message ✅");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const reminderPreview = useMemo(() => {
    const daysBefore = Number(form.reminder_days_before ?? form.reminder_days_before_expiry ?? 3);
    const group = shareGroups.find((item) => {
      const days = daysUntil(item.expiry_date);
      return days >= 0 && days <= daysBefore;
    }) ?? shareGroups[0];
    if (!group) return "No groups available for preview.";
    const app = apps.find((item) => item.id === group.app_id);
    const members = groupMembers.filter((member) => member.group_id === group.id);
    const unpaidMembers = members.filter((member) => member.paid_status !== "paid");
    const unpaidNames = unpaidMembers.map((member) => customers.find((customer) => customer.id === member.customer_id)?.nickname).filter(Boolean).join(", ");

    return [
      `App: ${app?.name ?? "Subscription"}`,
      `Group: ${group.group_name}`,
      `Expiry date: ${formatDate(group.expiry_date)}`,
      `Paid count: ${members.filter((member) => member.paid_status === "paid").length}`,
      `Unpaid count: ${unpaidMembers.length}`,
      `Unpaid customers: ${unpaidNames || "None"}`
    ].join("\n");
  }, [apps, customers, form.reminder_days_before, form.reminder_days_before_expiry, groupMembers, shareGroups]);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettings({
      ...form,
      reminder_days_before: Number(form.reminder_days_before) || 0,
      reminder_days_before_expiry: Number(form.reminder_days_before) || Number(form.reminder_days_before_expiry) || 0
    });
    setFeedback("Telegram settings saved locally.");
  }

  async function sendTestMessage() {
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_token: form.bot_token,
          chat_id: form.chat_id,
          message
        })
      });
      const result = await response.json() as { ok: boolean; error?: string };
      setFeedback(result.ok ? "Test message sent." : `Telegram error: ${result.error ?? "Unknown error"}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not send test message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader title="Telegram reminders" description="Configure prototype reminder delivery and preview expiring group messages." />
      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <Card>
          <CardHeader><CardTitle>Reminder settings</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
                <ShieldAlert className="mr-2 inline h-4 w-4" />
                Private prototype only. In production, encrypt the Telegram token or keep it server-side/Supabase, never in public client storage.
              </div>
              <div><Label>Bot token</Label><Input type="password" value={form.bot_token ?? ""} onChange={(event) => setForm({ ...form, bot_token: event.target.value })} placeholder="123456:ABC..." /></div>
              <div><Label>Chat id</Label><Input value={form.chat_id ?? ""} onChange={(event) => setForm({ ...form, chat_id: event.target.value })} placeholder="-1001234567890" /></div>
              <div><Label>Reminder days before</Label><Input type="number" min={0} value={form.reminder_days_before} onChange={(event) => setForm({ ...form, reminder_days_before: Number(event.target.value), reminder_days_before_expiry: Number(event.target.value) })} /></div>
              <div><Label>Enabled</Label><Select value={String(form.enabled)} onChange={(event) => setForm({ ...form, enabled: event.target.value === "true" })}><option value="true">true</option><option value="false">false</option></Select></div>
              <div><Label>Test message</Label><Textarea value={message} onChange={(event) => setMessage(event.target.value)} /></div>
              {feedback ? <p className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">{feedback}</p> : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="submit">Save Telegram settings</Button>
                <Button type="button" variant="outline" onClick={sendTestMessage} disabled={sending}><Send className="h-4 w-4" /> {sending ? "Sending..." : "Send test message"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Reminder preview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <pre className="whitespace-pre-wrap rounded-lg border bg-slate-950/70 p-4 text-sm text-slate-200">{reminderPreview}</pre>
            <p className="text-sm text-muted-foreground">The test endpoint sends the custom test message. Daily reminders can later reuse this preview structure from a cron job.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

