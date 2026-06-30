"use client";

import { FormEvent, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import type { AppRecord, AppStatus } from "@/lib/types";

const emptyForm: Omit<AppRecord, "id"> = {
  name: "",
  logo_url: "",
  color: "#0f766e",
  default_seats: 5,
  status: "active",
  note: ""
};

export default function AppsPage() {
  const { apps, setApps } = useAdminData();
  const { t } = useLanguage();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function startEdit(app: AppRecord) {
    setEditingId(app.id);
    setForm({ ...app, note: app.note ?? "" });
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function saveApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: AppRecord = {
      id: editingId ?? createId("app"),
      ...form,
      name: form.name.trim() || "Untitled app",
      logo_url: form.logo_url.trim() || `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(form.name || "App")}`,
      default_seats: Number(form.default_seats) || 1,
      note: form.note?.trim() || null
    };
    setApps((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [payload, ...current]);
    setEditingId(payload.id);
    setSaved(true);
  }

  function deleteApp(id: string) {
    if (!window.confirm("Delete this app?")) return;
    setApps((current) => current.filter((item) => item.id !== id));
    if (editingId === id) startNew();
  }

  return (
    <div>
      <PageHeader title={t("apps")} description="Create, edit, archive, and color-code supported subscription apps." action={<Button type="button" onClick={startNew}><Plus className="h-4 w-4" /> {t("newApp")}</Button>} />
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader><CardTitle>App catalog</CardTitle></CardHeader>
          <CardContent>
            {apps.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
              <>
                <div className="hidden overflow-x-auto lg:block"><Table><TableHeader><TableRow><TableHead>App</TableHead><TableHead>Default seats</TableHead><TableHead>Status</TableHead><TableHead>Note</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{apps.map((app) => <TableRow key={app.id}><TableCell><div className="flex items-center gap-3"><img src={app.logo_url} alt="" className="h-10 w-10 rounded-md border" /><span className="font-medium" style={{ color: app.color }}>{app.name}</span></div></TableCell><TableCell>{app.default_seats}</TableCell><TableCell><Badge variant={app.status === "active" ? "success" : "secondary"}>{app.status}</Badge></TableCell><TableCell>{app.note}</TableCell><TableCell><div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(app)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" size="sm" variant="destructive" onClick={() => deleteApp(app.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></TableCell></TableRow>)}</TableBody></Table></div>
                <div className="grid gap-3 lg:hidden">{apps.map((app) => <div key={app.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex items-start gap-3"><img src={app.logo_url} alt="" className="h-12 w-12 rounded-lg border" /><div className="min-w-0 flex-1"><p className="truncate text-base font-semibold" style={{ color: app.color }}>{app.name}</p><p className="mt-1 text-sm text-muted-foreground">{app.default_seats} seats</p></div><Badge variant={app.status === "active" ? "success" : "secondary"}>{app.status}</Badge></div>{app.note ? <p className="mt-3 text-sm text-slate-300">{app.note}</p> : null}<div className="mt-4 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => startEdit(app)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" variant="destructive" onClick={() => deleteApp(app.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></div>)}</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{editingId ? t("edit") : t("newApp")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveApp} className="space-y-4">
              <div><Label>Name</Label><Input ref={firstInputRef} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="StreamBox" /></div>
              <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={(event) => setForm({ ...form, logo_url: event.target.value })} placeholder="https://..." /></div>
              <div><Label>Color</Label><Input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></div>
              <div><Label>Default seats</Label><Input type="number" min={1} value={form.default_seats} onChange={(event) => setForm({ ...form, default_seats: Number(event.target.value) })} /></div>
              <div><Label>Status</Label><Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AppStatus })}><option value="active">active</option><option value="paused">paused</option><option value="archived">archived</option></Select></div>
              <div><Label>Note</Label><Textarea value={form.note ?? ""} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Internal note" /></div>
              {saved ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t("saved")}</p> : null}
              <Button type="submit" className="w-full">{t("save")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
