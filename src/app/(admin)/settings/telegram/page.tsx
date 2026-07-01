"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, Send, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { useAdminData } from "@/hooks/use-admin-data";
import { useTelegramSettings } from "@/hooks/use-telegram-settings";
import { seedTelegramSettingsValue } from "@/lib/admin-data";
import type { TelegramSettings } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/utils";

const defaultSettings: TelegramSettings = {
  ...seedTelegramSettingsValue,
  bot_token: seedTelegramSettingsValue?.bot_token ?? "",
  chat_id: seedTelegramSettingsValue?.chat_id ?? "",
  reminder_days_before: seedTelegramSettingsValue?.reminder_days_before ?? seedTelegramSettingsValue?.reminder_days_before_expiry ?? 3,
  default_message_template: seedTelegramSettingsValue?.default_message_template ?? "SubGroup Manager reminder: {app_name} / {group_name}"
};

export default function TelegramSettingsPage() {
  const { apps, groupMembers, shareGroups, customers } = useAdminData();
  const [settings, setSettings, settingsReady, settingsError] = useTelegramSettings();
  const [form, setForm] = useState<TelegramSettings>(defaultSettings);
  const [message, setMessage] = useState("SubGroup Manager test message ✅");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedChat, setCopiedChat] = useState(false);

  useEffect(() => {
    setForm({ ...defaultSettings, ...settings, reminder_days_before: settings.reminder_days_before ?? settings.reminder_days_before_expiry ?? 3 });
  }, [settings]);

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
    const template = form.default_message_template || defaultSettings.default_message_template || "";

    return template
      .replaceAll("{app_name}", app?.name ?? "Subscription")
      .replaceAll("{group_name}", group.group_name)
      .replaceAll("{expiry_date}", formatDate(group.expiry_date))
      .replaceAll("{paid_count}", String(members.filter((member) => member.paid_status === "paid").length))
      .replaceAll("{unpaid_count}", String(unpaidMembers.length))
      .replaceAll("{unpaid_customer_names}", unpaidNames || "None");
  }, [apps, customers, form.default_message_template, form.reminder_days_before, form.reminder_days_before_expiry, groupMembers, shareGroups]);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettings({
      ...form,
      reminder_days_before: Number(form.reminder_days_before) || 0,
      reminder_days_before_expiry: Number(form.reminder_days_before) || Number(form.reminder_days_before_expiry) || 0
    });
    setFeedback("Telegram settings saved.");
  }

  function clearSettings() {
    if (!window.confirm("Clear Telegram settings?")) return;
    setSettings(defaultSettings);
    setForm(defaultSettings);
    setFeedback("Telegram settings cleared.");
  }

  async function copyChatId() {
    await navigator.clipboard.writeText(form.chat_id ?? "");
    setCopiedChat(true);
    window.setTimeout(() => setCopiedChat(false), 1300);
  }

  async function sendTestMessage() {
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_token: form.bot_token, chat_id: form.chat_id, message })
      });
      const result = await response.json() as { ok: boolean; error?: string };
      setFeedback(result.ok ? "Telegram test message sent successfully." : `Telegram API failed: ${result.error ?? "Unknown error"}`);
    } catch (error) {
      setFeedback(error instanceof Error ? `Telegram API failed: ${error.message}` : "Telegram API failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader title="Telegram reminders" description="Configure persistent prototype reminder delivery and preview expiring group messages." />
      {!settingsReady ? <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">Loading Telegram settings...</div> : null}
      {settingsError ? <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{settingsError}</div> : null}
      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <Card>
          <CardHeader><CardTitle>Reminder settings</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
                <ShieldAlert className="mr-2 inline h-4 w-4" />
                Private admin area only. Bot token and chat id are saved through the server API; keep Supabase service keys server-side only.
              </div>
              <div>
                <Label>Bot token</Label>
                <div className="flex gap-2"><Input type={showToken ? "text" : "password"} value={form.bot_token ?? ""} onChange={(event) => setForm({ ...form, bot_token: event.target.value })} placeholder="123456:ABC..." /><Button type="button" variant="outline" onClick={() => setShowToken((value) => !value)}>{showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
              </div>
              <div><Label>Chat id</Label><div className="flex gap-2"><Input value={form.chat_id ?? ""} onChange={(event) => setForm({ ...form, chat_id: event.target.value })} placeholder="-1001234567890" /><Button type="button" variant="outline" onClick={copyChatId}>{copiedChat ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></div>
              <div><Label>Reminder days before</Label><Input type="number" min={0} value={form.reminder_days_before} onChange={(event) => setForm({ ...form, reminder_days_before: Number(event.target.value), reminder_days_before_expiry: Number(event.target.value) })} /></div>
              <div><Label>Enabled</Label><Select value={String(form.enabled)} onChange={(event) => setForm({ ...form, enabled: event.target.value === "true" })}><option value="true">true</option><option value="false">false</option></Select></div>
              <div><Label>Default message template</Label><Textarea value={form.default_message_template ?? ""} onChange={(event) => setForm({ ...form, default_message_template: event.target.value })} /></div>
              <div><Label>Test message</Label><Textarea value={message} onChange={(event) => setMessage(event.target.value)} /></div>
              {feedback ? <p className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">{feedback}</p> : null}
              <div className="grid gap-2 sm:grid-cols-3">
                <Button type="submit">Save settings</Button>
                <Button type="button" variant="outline" onClick={sendTestMessage} disabled={sending}><Send className="h-4 w-4" /> {sending ? "Sending..." : "Send test"}</Button>
                <Button type="button" variant="destructive" onClick={clearSettings}><Trash2 className="h-4 w-4" /> Clear</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Reminder preview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <pre className="whitespace-pre-wrap rounded-lg border bg-slate-950/70 p-4 text-sm text-slate-200">{reminderPreview}</pre>
            <p className="text-sm text-muted-foreground">Supported placeholders: {"{app_name}"}, {"{group_name}"}, {"{expiry_date}"}, {"{paid_count}"}, {"{unpaid_count}"}, {"{unpaid_customer_names}"}.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
