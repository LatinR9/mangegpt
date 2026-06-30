import { Send } from "lucide-react";
import { CredentialField } from "@/components/credential-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { prepareTelegramReminders, sendTestTelegramReminder } from "@/lib/telegram";
import { telegramSettings } from "@/lib/mock-data";

async function sendTestAction() {
  "use server";
  await sendTestTelegramReminder();
}

export default function TelegramSettingsPage() {
  const settings = telegramSettings[0];
  const reminders = prepareTelegramReminders();

  return (
    <div>
      <PageHeader title="Telegram reminders" description="Prepare expiry reminders for a bot without exposing tokens in the interface." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card><CardHeader><CardTitle>Reminder settings</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>Bot token</Label><CredentialField hint={settings.bot_token_hint} /></div><div><Label>Chat id</Label><CredentialField hint={settings.chat_id_hint} /></div><div><Label>Reminder days before expiry</Label><Input type="number" defaultValue={settings.reminder_days_before_expiry} /></div><div><Label>Enabled</Label><Select defaultValue={String(settings.enabled)}><option value="true">true</option><option value="false">false</option></Select></div><Button type="button" className="w-full">Save settings</Button></form><form action={sendTestAction} className="mt-3"><Button type="submit" variant="outline" className="w-full"><Send className="h-4 w-4" /> Send test reminder</Button></form></CardContent></Card>
        <Card><CardHeader><CardTitle>Prepared messages</CardTitle></CardHeader><CardContent className="space-y-3">{reminders.map((reminder) => <pre key={reminder.groupId} className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">{reminder.message}</pre>)}{reminders.length === 0 ? <p className="text-sm text-muted-foreground">No groups match the current reminder window.</p> : null}</CardContent></Card>
      </div>
    </div>
  );
}
