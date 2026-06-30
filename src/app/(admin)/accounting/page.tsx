"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ExportButtons } from "@/components/export-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import type { Transaction, TransactionType } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);
const emptyTransaction: Omit<Transaction, "id"> = {
  type: "income",
  amount: 0,
  category: "",
  app_id: null,
  group_id: null,
  customer_id: null,
  date: today,
  note: "",
  slip_url: "",
  color: "#10b981"
};

function nullableSelect(value: string) {
  return value === "none" ? null : value;
}

export default function AccountingPage() {
  const { apps, customers, setTransactions, shareGroups, transactions } = useAdminData();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTransaction);
  const [saved, setSaved] = useState(false);
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterApp, setFilterApp] = useState("all");

  const filteredTransactions = useMemo(() => transactions.filter((item) => {
    const typeOk = filterType === "all" || item.type === filterType;
    const appOk = filterApp === "all" || item.app_id === filterApp;
    return typeOk && appOk;
  }), [filterApp, filterType, transactions]);

  function startNew() {
    setEditingId(null);
    setForm(emptyTransaction);
    setSaved(false);
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({ ...transaction, note: transaction.note ?? "", slip_url: transaction.slip_url ?? "" });
    setSaved(false);
  }

  function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: Transaction = {
      id: editingId ?? createId("txn"),
      type: form.type,
      amount: Number(form.amount) || 0,
      category: form.category.trim() || (form.type === "income" ? t("income") : t("expense")),
      app_id: form.app_id,
      group_id: form.group_id,
      customer_id: form.customer_id,
      date: form.date || today,
      note: form.note?.trim() || null,
      slip_url: form.slip_url?.trim() || null,
      color: form.color || (form.type === "income" ? "#10b981" : "#ef4444")
    };
    setTransactions((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [payload, ...current]);
    setEditingId(payload.id);
    setSaved(true);
  }

  function deleteTransaction(id: string) {
    if (!window.confirm("Delete this transaction?")) return;
    setTransactions((current) => current.filter((item) => item.id !== id));
    if (editingId === id) startNew();
  }

  return (
    <div>
      <PageHeader title={t("accounting")} description="Track income, expenses, payment links, and export reports." action={<ExportButtons rows={transactions} />} />
      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between"><CardTitle>{editingId ? t("edit") : t("newTransaction")}</CardTitle><Button type="button" variant="outline" onClick={startNew}><Plus className="h-4 w-4" /> {t("newTransaction")}</Button></CardHeader>
        <CardContent>
          <form onSubmit={saveTransaction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div><Label>Type</Label><Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as TransactionType, color: event.target.value === "income" ? "#10b981" : "#ef4444" })}><option value="income">{t("income")}</option><option value="expense">{t("expense")}</option></Select></div>
            <div><Label>Amount</Label><Input type="number" min={0} value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div>
            <div><Label>App</Label><Select value={form.app_id ?? "none"} onChange={(event) => setForm({ ...form, app_id: nullableSelect(event.target.value) })}><option value="none">None</option>{apps.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}</Select></div>
            <div><Label>Group</Label><Select value={form.group_id ?? "none"} onChange={(event) => setForm({ ...form, group_id: nullableSelect(event.target.value) })}><option value="none">None</option>{shareGroups.map((group) => <option value={group.id} key={group.id}>{group.group_name}</option>)}</Select></div>
            <div><Label>Customer</Label><Select value={form.customer_id ?? "none"} onChange={(event) => setForm({ ...form, customer_id: nullableSelect(event.target.value) })}><option value="none">None</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.nickname}</option>)}</Select></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
            <div><Label>Slip URL</Label><Input value={form.slip_url ?? ""} onChange={(event) => setForm({ ...form, slip_url: event.target.value })} /></div>
            <div><Label>Color</Label><Input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></div>
            <div className="sm:col-span-2 lg:col-span-5"><Label>Note</Label><Textarea value={form.note ?? ""} onChange={(event) => setForm({ ...form, note: event.target.value })} /></div>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-5"><Button type="submit">{t("save")}</Button>{saved ? <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t("saved")}</span> : null}</div>
          </form>
        </CardContent>
      </Card>
      <Card className="mb-6"><CardHeader><CardTitle>Filters</CardTitle></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div><Label>Date from</Label><Input type="date" /></div><div><Label>Date to</Label><Input type="date" /></div><div><Label>App</Label><Select value={filterApp} onChange={(event) => setFilterApp(event.target.value)}><option value="all">All apps</option>{apps.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}</Select></div><div><Label>Group</Label><Select><option>All groups</option>{shareGroups.map((group) => <option key={group.id}>{group.group_name}</option>)}</Select></div><div><Label>Type</Label><Select value={filterType} onChange={(event) => setFilterType(event.target.value as "all" | TransactionType)}><option value="all">All</option><option value="income">{t("income")}</option><option value="expense">{t("expense")}</option></Select></div></form></CardContent></Card>
      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredTransactions.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
            <Table><TableHeader><TableRow><TableHead></TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Category</TableHead><TableHead>App</TableHead><TableHead>Group</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Slip</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredTransactions.map((item) => <TableRow key={item.id} className={cn(item.type === "income" ? "bg-emerald-50/35" : "bg-rose-50/35")}><TableCell><span className="block h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} /></TableCell><TableCell><StatusBadge status={item.type === "income" ? t("income") : t("expense")} /></TableCell><TableCell className={item.type === "income" ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>{formatCurrency(item.amount)}</TableCell><TableCell>{item.category}</TableCell><TableCell>{apps.find((app) => app.id === item.app_id)?.name ?? "-"}</TableCell><TableCell>{shareGroups.find((group) => group.id === item.group_id)?.group_name ?? "-"}</TableCell><TableCell>{customers.find((customer) => customer.id === item.customer_id)?.nickname ?? "-"}</TableCell><TableCell>{formatDate(item.date)}</TableCell><TableCell>{item.slip_url ? "Attached" : "-"}</TableCell><TableCell><div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" size="sm" variant="destructive" onClick={() => deleteTransaction(item.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></TableCell></TableRow>)}</TableBody></Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
