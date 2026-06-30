"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Copy, DollarSign, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import type { AccountType, AppAccountStock, StockStatus } from "@/lib/types";
import { daysUntil, formatCurrency, formatDate } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);
const emptyStock: Omit<AppAccountStock, "id"> = {
  app_id: "",
  label: "",
  login_email: "",
  password: "",
  password_encrypted: null,
  account_type: "shared",
  cost: 0,
  selling_price: 0,
  status: "available",
  purchase_date: today,
  expiry_date: "",
  supplier: "",
  note: "",
  image_url: "",
  folder_file_id: null
};

const statuses: StockStatus[] = ["available", "reserved", "sold", "expired", "problem"];

export default function StockPage() {
  const { apps, stockAccounts, setStockAccounts, uploadedFiles } = useAdminData();
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyStock);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterApp, setFilterApp] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | StockStatus>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => stockAccounts.filter((account) => {
    const app = apps.find((item) => item.id === account.app_id);
    const search = query.trim().toLowerCase();
    const searchOk = !search || [app?.name, account.login_email, account.label, account.status, account.supplier].some((value) => (value ?? "").toLowerCase().includes(search));
    const appOk = filterApp === "all" || account.app_id === filterApp;
    const statusOk = filterStatus === "all" || account.status === filterStatus;
    return searchOk && appOk && statusOk;
  }), [apps, filterApp, filterStatus, query, stockAccounts]);

  const available = stockAccounts.filter((item) => item.status === "available").length;
  const reserved = stockAccounts.filter((item) => item.status === "reserved").length;
  const sold = stockAccounts.filter((item) => item.status === "sold").length;
  const expiringSoon = stockAccounts.filter((item) => item.expiry_date && daysUntil(item.expiry_date) >= 0 && daysUntil(item.expiry_date) <= 7).length;
  const totalCost = stockAccounts.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const expectedRevenue = stockAccounts.reduce((sum, item) => sum + Number(item.selling_price || 0), 0);

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyStock, app_id: apps[0]?.id ?? "" });
    setSaved(false);
  }

  function startEdit(account: AppAccountStock) {
    setEditingId(account.id);
    setForm({ ...account, note: account.note ?? "", supplier: account.supplier ?? "", image_url: account.image_url ?? "", expiry_date: account.expiry_date ?? "", purchase_date: account.purchase_date ?? today });
    setSaved(false);
  }

  function saveStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: AppAccountStock = {
      id: editingId ?? createId("stock"),
      ...form,
      app_id: form.app_id || apps[0]?.id || "",
      label: form.label.trim() || "Stock account",
      login_email: form.login_email.trim() || "stock@example.test",
      password: form.password?.trim() || "",
      password_encrypted: form.password ? `mock_stock_${Date.now()}` : form.password_encrypted,
      cost: Number(form.cost) || 0,
      selling_price: Number(form.selling_price) || 0,
      purchase_date: form.purchase_date || null,
      expiry_date: form.expiry_date || null,
      supplier: form.supplier?.trim() || null,
      note: form.note?.trim() || null,
      image_url: form.image_url?.trim() || null,
      folder_file_id: form.folder_file_id || null
    };
    setStockAccounts((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [payload, ...current]);
    setEditingId(payload.id);
    setForm({ ...payload, note: payload.note ?? "", supplier: payload.supplier ?? "", image_url: payload.image_url ?? "", expiry_date: payload.expiry_date ?? "", purchase_date: payload.purchase_date ?? today });
    setSaved(true);
  }

  function deleteStock(id: string) {
    if (!window.confirm("Delete this stock account?")) return;
    setStockAccounts((current) => current.filter((item) => item.id !== id));
    if (editingId === id) startNew();
  }

  function updateStatus(id: string, status: StockStatus) {
    // TODO: Later, sold or assigned stock can be converted into a service account or linked to a share group.
    setStockAccounts((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  async function copyText(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1300);
  }

  const maskedPassword = "********";

  return (
    <div>
      <PageHeader title={t("stock")} description="Manage app accounts that are not sold or assigned to a group yet." action={<Button onClick={startNew}><Plus className="h-4 w-4" /> New stock account</Button>} />
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
        {[
          ["Total stock", stockAccounts.length],
          [t("available"), available],
          [t("reserved"), reserved],
          [t("sold"), sold],
          ["Expiring soon", expiringSoon],
          ["Total cost", formatCurrency(totalCost)],
          ["Expected revenue", formatCurrency(expectedRevenue)],
          ["Estimated profit", formatCurrency(expectedRevenue - totalCost)]
        ].map(([label, value]) => <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{value}</CardContent></Card>)}
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>{t("stock")}</CardTitle>
              <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto xl:grid-cols-3">
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search app, email, label, supplier" />
                <Select value={filterApp} onChange={(event) => setFilterApp(event.target.value)}><option value="all">All apps</option>{apps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}</Select>
                <Select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as "all" | StockStatus)}><option value="all">All status</option>{statuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</Select>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
                <>
                <div className="hidden overflow-x-auto lg:block"><Table><TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Email</TableHead><TableHead>Password</TableHead><TableHead>Status</TableHead><TableHead>Cost</TableHead><TableHead>Price</TableHead><TableHead>Expiry</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((account) => { const app = apps.find((item) => item.id === account.app_id); return <TableRow key={account.id}><TableCell><div className="flex items-center gap-3">{account.image_url ? <img src={account.image_url} alt="" className="h-10 w-10 rounded-lg border border-blue-500/30 object-cover" /> : <DollarSign className="h-8 w-8 rounded-lg border border-blue-500/30 p-1 text-blue-300" />}<div><p className="font-medium">{account.label}</p><p className="text-xs text-muted-foreground">{app?.name} / {account.supplier}</p></div></div></TableCell><TableCell><div className="flex items-center gap-2"><span>{account.login_email}</span><Button size="sm" variant="outline" onClick={() => copyText(`${account.id}-email`, account.login_email)}>{copied === `${account.id}-email` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></TableCell><TableCell><div className="flex items-center gap-2"><code className="rounded-md border bg-slate-950 px-2 py-1 text-xs text-blue-100">{maskedPassword}</code><Button size="sm" variant="outline" onClick={() => copyText(`${account.id}-password`, account.password ?? "")}>{copied === `${account.id}-password` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></TableCell><TableCell><StatusBadge status={t(account.status)} /></TableCell><TableCell>{formatCurrency(account.cost)}</TableCell><TableCell>{formatCurrency(account.selling_price)}</TableCell><TableCell>{account.expiry_date ? formatDate(account.expiry_date) : "-"}</TableCell><TableCell><div className="flex flex-wrap justify-end gap-2"><Button size="sm" variant="outline" onClick={() => updateStatus(account.id, "sold")}>{t("sold")}</Button><Button size="sm" variant="outline" onClick={() => updateStatus(account.id, "reserved")}>{t("reserved")}</Button><Button size="sm" variant="outline" onClick={() => updateStatus(account.id, "available")}>{t("available")}</Button><Button size="sm" variant="outline" onClick={() => startEdit(account)}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => deleteStock(account.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>; })}</TableBody></Table></div>
                <div className="grid gap-3 lg:hidden">{filtered.map((account) => { const app = apps.find((item) => item.id === account.app_id); return <div key={account.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-base font-semibold">{account.label}</p><p className="mt-1 text-sm text-muted-foreground">{app?.name ?? "-"}</p></div><StatusBadge status={t(account.status)} /></div><div className="mt-4 space-y-3 text-sm"><div><p className="text-muted-foreground">Email</p><div className="mt-1 flex gap-2"><span className="min-w-0 flex-1 break-all text-slate-200">{account.login_email}</span><Button variant="outline" onClick={() => copyText(`${account.id}-email`, account.login_email)}>{copied === `${account.id}-email` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></div><div><p className="text-muted-foreground">Password</p><div className="mt-1 flex gap-2"><code className="min-w-0 flex-1 truncate rounded-md border bg-slate-950 px-2 py-2 text-xs text-blue-100">{maskedPassword}</code><Button variant="outline" onClick={() => copyText(`${account.id}-password`, account.password ?? "")}>{copied === `${account.id}-password` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></div><div className="grid grid-cols-2 gap-3"><div><p className="text-muted-foreground">Expiry</p><p>{account.expiry_date ? formatDate(account.expiry_date) : "-"}</p></div><div><p className="text-muted-foreground">Price</p><p>{formatCurrency(account.selling_price)}</p></div></div></div><div className="mt-4 grid grid-cols-3 gap-2"><Button variant="outline" onClick={() => updateStatus(account.id, "sold")}>{t("sold")}</Button><Button variant="outline" onClick={() => updateStatus(account.id, "reserved")}>{t("reserved")}</Button><Button variant="outline" onClick={() => updateStatus(account.id, "available")}>{t("available")}</Button></div><div className="mt-2 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => startEdit(account)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button variant="destructive" onClick={() => deleteStock(account.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></div>; })}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="2xl:sticky 2xl:top-6 2xl:self-start">
          <CardHeader><CardTitle>{editingId ? t("edit") : "Add stock account"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveStock} className="space-y-4">
              <div><Label>App</Label><Select value={form.app_id || apps[0]?.id || ""} onChange={(event) => setForm({ ...form, app_id: event.target.value })}>{apps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}</Select></div>
              <div><Label>Label</Label><Input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} /></div>
              <div><Label>Login email</Label><Input value={form.login_email} onChange={(event) => setForm({ ...form, login_email: event.target.value })} /></div>
              <div><Label>Password</Label><Input type="password" value={form.password ?? ""} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2"><div><Label>Account type</Label><Select value={form.account_type} onChange={(event) => setForm({ ...form, account_type: event.target.value as AccountType })}><option value="private">{t("private")}</option><option value="shared">{t("shared")}</option></Select></div><div><Label>Status</Label><Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as StockStatus })}>{statuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</Select></div></div>
              <div className="grid gap-3 sm:grid-cols-2"><div><Label>Cost</Label><Input type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} /></div><div><Label>Selling price</Label><Input type="number" value={form.selling_price} onChange={(event) => setForm({ ...form, selling_price: Number(event.target.value) })} /></div></div>
              <div className="grid gap-3 sm:grid-cols-2"><div><Label>Purchase date</Label><Input type="date" value={form.purchase_date ?? ""} onChange={(event) => setForm({ ...form, purchase_date: event.target.value })} /></div><div><Label>Expiry date</Label><Input type="date" value={form.expiry_date ?? ""} onChange={(event) => setForm({ ...form, expiry_date: event.target.value })} /></div></div>
              <div><Label>Supplier</Label><Input value={form.supplier ?? ""} onChange={(event) => setForm({ ...form, supplier: event.target.value })} /></div>
              <div><Label>Image URL</Label><Input value={form.image_url ?? ""} onChange={(event) => setForm({ ...form, image_url: event.target.value })} /></div>
              <div><Label>Linked file</Label><Select value={form.folder_file_id ?? ""} onChange={(event) => setForm({ ...form, folder_file_id: event.target.value || null })}><option value="">None</option>{uploadedFiles.map((file) => <option key={file.id} value={file.id}>{file.file_name}</option>)}</Select></div>
              <div><Label>Note</Label><Textarea value={form.note ?? ""} onChange={(event) => setForm({ ...form, note: event.target.value })} /></div>
              <p className="text-xs text-muted-foreground">TODO: when stock is sold or assigned, it can later be converted into a service account or linked to a share group.</p>
              {saved ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{t("saved")}</p> : null}
              <Button type="submit" className="w-full">{t("save")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

