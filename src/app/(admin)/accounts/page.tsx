"use client";

import { FormEvent, useRef, useState } from "react";
import { Check, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import type { AccountType, ServiceAccount } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);
const emptyAccount: Omit<ServiceAccount, "id"> & { password_plain: string } = {
  app_id: "",
  label: "",
  login_email: "",
  account_type: "shared",
  password: "",
  password_encrypted: null,
  password_hint: null,
  password_plain: "",
  expiry_date: today,
  cost: 0,
  note: ""
};

export default function AccountsPage() {
  const { apps, serviceAccounts, setServiceAccounts } = useAdminData();
  const { t } = useLanguage();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAccount);
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyAccount, app_id: apps[0]?.id ?? "" });
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function startEdit(account: ServiceAccount) {
    setEditingId(account.id);
    setForm({ ...account, note: account.note ?? "", password_plain: account.password ?? account.password_hint ?? "" });
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordChanged = form.password_plain.trim().length > 0;
    const existing = serviceAccounts.find((account) => account.id === editingId);
    const payload: ServiceAccount = {
      id: editingId ?? createId("svc"),
      app_id: form.app_id || apps[0]?.id || "",
      label: form.label.trim() || "New account",
      login_email: form.login_email.trim() || "admin@example.test",
      account_type: form.account_type,
      password: passwordChanged ? form.password_plain : existing?.password ?? form.password ?? form.password_hint ?? "",
      password_encrypted: passwordChanged ? `mock_encrypted_${Date.now()}` : existing?.password_encrypted ?? form.password_encrypted,
      password_hint: passwordChanged ? form.password_plain.slice(0, 3) : existing?.password_hint ?? form.password_hint,
      expiry_date: form.expiry_date,
      cost: Number(form.cost) || 0,
      note: form.note?.trim() || null
    };
    setServiceAccounts((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [payload, ...current]);
    setEditingId(payload.id);
    setForm({ ...payload, note: payload.note ?? "", password_plain: payload.password ?? "" });
    setSaved(true);
  }

  async function copyPassword(account: ServiceAccount) {
    // Private admin prototype only: app account passwords are copyable here for operations.
    // Do not use this pattern for system secrets, service-role keys, or Telegram bot tokens in production.
    const value = account.password ?? account.password_hint ?? "";
    await navigator.clipboard.writeText(value);
    setCopiedId(account.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function deleteAccount(id: string) {
    if (!window.confirm("Delete this account?")) return;
    setServiceAccounts((current) => current.filter((item) => item.id !== id));
    if (editingId === id) startNew();
  }

  return (
    <div>
      <PageHeader title={t("serviceAccounts")} description="Manage app logins and subscription costs. Password-like fields are masked by default." action={<Button type="button" onClick={startNew}><Plus className="h-4 w-4" /> {t("newAccount")}</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Accounts</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {serviceAccounts.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
              <Table><TableHeader><TableRow><TableHead>Label</TableHead><TableHead>App</TableHead><TableHead>Type</TableHead><TableHead>Login email</TableHead><TableHead>Password</TableHead><TableHead>Expiry</TableHead><TableHead>Cost</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{serviceAccounts.map((account) => <TableRow key={account.id}><TableCell className="font-medium">{account.label}</TableCell><TableCell>{apps.find((app) => app.id === account.app_id)?.name}</TableCell><TableCell>{account.account_type === "private" ? t("private") : t("shared")}</TableCell><TableCell>{account.login_email}</TableCell><TableCell><div className="flex min-w-52 items-center gap-2"><code className="rounded-md border bg-slate-950 px-2 py-1 text-xs text-blue-100">{account.password ?? account.password_hint ?? ""}</code><Button type="button" size="sm" variant="outline" onClick={() => copyPassword(account)}>{copiedId === account.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copiedId === account.id ? "Copied" : "Copy"}</Button></div></TableCell><TableCell>{formatDate(account.expiry_date)}</TableCell><TableCell>{formatCurrency(account.cost)}</TableCell><TableCell><div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(account)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" size="sm" variant="destructive" onClick={() => deleteAccount(account.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></TableCell></TableRow>)}</TableBody></Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{editingId ? t("edit") : t("newAccount")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveAccount} className="space-y-4">
              <div><Label>App</Label><Select value={form.app_id || apps[0]?.id || ""} onChange={(event) => setForm({ ...form, app_id: event.target.value })}>{apps.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}</Select></div>
              <div><Label>Label</Label><Input ref={firstInputRef} value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="Main workspace" /></div>
              <div><Label>Account type</Label><Select value={form.account_type} onChange={(event) => setForm({ ...form, account_type: event.target.value as AccountType })}><option value="private">{t("private")}</option><option value="shared">{t("shared")}</option></Select></div>
              <div><Label>Login email</Label><Input type="email" value={form.login_email} onChange={(event) => setForm({ ...form, login_email: event.target.value })} placeholder="admin@example.test" /></div>
              <div><Label>Password</Label><Input type="password" value={form.password_plain} onChange={(event) => setForm({ ...form, password_plain: event.target.value })} placeholder="Stored encrypted later" /></div>
              <div><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(event) => setForm({ ...form, expiry_date: event.target.value })} /></div>
              <div><Label>Cost</Label><Input type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} /></div>
              <div><Label>Note</Label><Textarea value={form.note ?? ""} onChange={(event) => setForm({ ...form, note: event.target.value })} /></div>
              {saved ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t("saved")}</p> : null}
              <Button type="submit" className="w-full">{t("save")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
