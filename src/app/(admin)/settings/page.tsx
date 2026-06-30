"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t("settings")} description="Configure integrations and operational defaults." />
      <Link href="/settings/telegram"><Card className="transition hover:border-primary"><CardHeader><CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5" /> Telegram reminders</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Bot token and chat id are masked, stored as encryption-ready fields, and only used server-side.</CardContent></Card></Link>
    </div>
  );
}
