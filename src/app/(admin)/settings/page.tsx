"use client";

import Link from "next/link";
import { BellRing, CreditCard, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useLanguage } from "@/hooks/use-language";
import type { AppSettings } from "@/lib/types";

export default function SettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useAppSettings();
  const [form, setForm] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettings({
      ...form,
      site_name: form.site_name.trim() || "SubGroup Manager",
      site_logo_url: form.site_logo_url.trim(),
      site_description: form.site_description?.trim() || null,
      primary_color: form.primary_color?.trim() || null,
      accent_color: form.accent_color?.trim() || null
    });
    setSaved(true);
  }

  return (
    <div>
      <PageHeader title={t("settings")} description="Configure website branding, integrations, and operational defaults." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader><CardTitle>{t("websiteSettings")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div><Label>Site name</Label><Input value={form.site_name} onChange={(event) => setForm({ ...form, site_name: event.target.value })} /></div>
              <div><Label>Logo URL</Label><Input value={form.site_logo_url} onChange={(event) => setForm({ ...form, site_logo_url: event.target.value })} placeholder="https://..." /></div>
              <div><Label>Description</Label><Textarea value={form.site_description ?? ""} onChange={(event) => setForm({ ...form, site_description: event.target.value })} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Primary color</Label><Input type="color" value={form.primary_color ?? "#3b82f6"} onChange={(event) => setForm({ ...form, primary_color: event.target.value })} /></div>
                <div><Label>Accent color</Label><Input type="color" value={form.accent_color ?? "#2563eb"} onChange={(event) => setForm({ ...form, accent_color: event.target.value })} /></div>
              </div>
              {saved ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{t("saved")}</p> : null}
              <Button type="submit"><Save className="h-4 w-4" /> {t("saveSettings")}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl border border-blue-500/30 bg-slate-950/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-blue-400/40 bg-blue-500/15 text-blue-200">
                    {form.site_logo_url ? <img src={form.site_logo_url} alt="" className="h-full w-full object-cover" /> : <CreditCard className="h-6 w-6" />}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white">{form.site_name || "SubGroup Manager"}</p>
                    <p className="text-sm text-muted-foreground">{form.site_description || "Private admin dashboard"}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: form.primary_color ?? "#3b82f6" }} />
                  <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: form.accent_color ?? "#2563eb" }} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Link href="/settings/telegram"><Card className="transition hover:border-primary"><CardHeader><CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5" /> Telegram reminders</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Persistent local settings now; Supabase-ready encrypted storage later.</CardContent></Card></Link>
        </div>
      </div>
    </div>
  );
}
