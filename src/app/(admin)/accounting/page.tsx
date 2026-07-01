"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Download, FileSpreadsheet, Pencil, Plus, Trash2 } from "lucide-react";
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
const currentMonth = today.slice(0, 7);
const monthOptions = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"]
];

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

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  const name = monthOptions.find(([value]) => value === monthNumber)?.[1] ?? monthNumber;
  return `${name} ${year}`;
}

function makeLookup<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function AccountingPage() {
  const { apps, customers, setTransactions, shareGroups, transactions } = useAdminData();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTransaction);
  const [saved, setSaved] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentMonth.slice(0, 4));
  const [filterMonth, setFilterMonth] = useState(currentMonth.slice(5, 7));
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterApp, setFilterApp] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterCustomer, setFilterCustomer] = useState("all");

  const appLookup = useMemo(() => makeLookup(apps), [apps]);
  const groupLookup = useMemo(() => makeLookup(shareGroups), [shareGroups]);
  const customerLookup = useMemo(() => makeLookup(customers), [customers]);

  const yearOptions = useMemo(() => {
    const years = new Set(transactions.map((item) => item.date.slice(0, 4)).filter(Boolean));
    years.add(currentMonth.slice(0, 4));
    years.add(filterYear);
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [filterYear, transactions]);

  const monthlyTransactions = useMemo(
    () => transactions.filter((item) => item.date.slice(0, 7) === selectedMonth),
    [selectedMonth, transactions]
  );

  const monthlySummary = useMemo(() => {
    const incomeRows = monthlyTransactions.filter((item) => item.type === "income");
    const expenseRows = monthlyTransactions.filter((item) => item.type === "expense");
    const totalIncome = incomeRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = expenseRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      month: selectedMonth,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeCount: incomeRows.length,
      expenseCount: expenseRows.length
    };
  }, [monthlyTransactions, selectedMonth]);

  const filteredTransactions = useMemo(() => transactions.filter((item) => {
    const dateOk = item.date.slice(0, 7) === selectedMonth;
    const typeOk = filterType === "all" || item.type === filterType;
    const appOk = filterApp === "all" || item.app_id === filterApp;
    const groupOk = filterGroup === "all" || item.group_id === filterGroup;
    const customerOk = filterCustomer === "all" || item.customer_id === filterCustomer;
    return dateOk && typeOk && appOk && groupOk && customerOk;
  }), [filterApp, filterCustomer, filterGroup, filterType, selectedMonth, transactions]);

  const exportRows = useMemo(() => {
    const toExportRow = (item: Transaction) => ({
      Date: item.date,
      Type: item.type,
      Amount: Number(item.amount || 0),
      Category: item.category,
      App: item.app_id ? appLookup.get(item.app_id)?.name ?? item.app_id : "",
      Group: item.group_id ? groupLookup.get(item.group_id)?.group_name ?? item.group_id : "",
      Customer: item.customer_id ? customerLookup.get(item.customer_id)?.nickname ?? item.customer_id : "",
      Note: item.note ?? "",
      "Slip URL": item.slip_url ?? ""
    });
    return {
      monthly: monthlyTransactions.map(toExportRow),
      all: transactions.map(toExportRow)
    };
  }, [appLookup, customerLookup, groupLookup, monthlyTransactions, transactions]);

  function setMonthParts(year: string, month: string) {
    setFilterYear(year);
    setFilterMonth(month);
    setSelectedMonth(`${year}-${month}`);
  }

  function handleMonthPicker(value: string) {
    if (!value) return;
    const [year, month] = value.split("-");
    setMonthParts(year, month);
  }

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

  function downloadCsv(scope: "month" | "all") {
    const rows = scope === "month" ? exportRows.monthly : exportRows.all;
    const headers = ["Date", "Type", "Amount", "Category", "App", "Group", "Customer", "Note", "Slip URL"];
    const csv = [`\uFEFF${headers.join(",")}`, ...rows.map((row) => headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = scope === "month" ? `accounting-transactions-${selectedMonth}.csv` : "accounting-all-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadExcel(scope: "month" | "all") {
    const XLSX = await import("xlsx");
    const summaryRows = [{
      Month: monthLabel(selectedMonth),
      "Total income": monthlySummary.totalIncome,
      "Total expense": monthlySummary.totalExpense,
      "Net profit": monthlySummary.netProfit,
      "Income transaction count": monthlySummary.incomeCount,
      "Expense transaction count": monthlySummary.expenseCount
    }];
    const rows = scope === "month" ? exportRows.monthly : exportRows.all;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Monthly Summary");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Transactions");
    XLSX.writeFile(workbook, scope === "month" ? `accounting-summary-${selectedMonth}.xlsx` : "accounting-all-transactions.xlsx");
  }

  const summaryCards = [
    {
      label: "Selected month",
      value: monthLabel(selectedMonth),
      detail: `${monthlySummary.incomeCount + monthlySummary.expenseCount} transactions`,
      className: "border-blue-500/40 bg-blue-500/10 text-blue-100"
    },
    {
      label: "Total income",
      value: formatCurrency(monthlySummary.totalIncome),
      detail: `${monthlySummary.incomeCount} income transactions`,
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
    },
    {
      label: "Total expense",
      value: formatCurrency(monthlySummary.totalExpense),
      detail: `${monthlySummary.expenseCount} expense transactions`,
      className: "border-rose-500/40 bg-rose-500/10 text-rose-100"
    },
    {
      label: "Net profit",
      value: formatCurrency(monthlySummary.netProfit),
      detail: monthlySummary.netProfit >= 0 ? "Profitable month" : "Loss month",
      className: monthlySummary.netProfit >= 0 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100" : "border-rose-500/40 bg-rose-500/10 text-rose-100"
    }
  ];

  return (
    <div className="min-w-0">
      <PageHeader title={t("accounting")} description="Track income, expenses, payment links, and export reports." />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={cn("min-w-0 overflow-hidden", card.className)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-current/75">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="break-words text-2xl font-semibold text-current">{card.value}</div>
              <p className="mt-2 text-sm text-current/75">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mb-6">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-300" /> Month and exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-end">
            <div>
              <Label>Selected month</Label>
              <Input type="month" value={selectedMonth} onChange={(event) => handleMonthPicker(event.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Button type="button" variant="outline" onClick={() => downloadCsv("month")}><Download className="h-4 w-4" /> Export current month CSV</Button>
              <Button type="button" variant="outline" onClick={() => downloadExcel("month")}><FileSpreadsheet className="h-4 w-4" /> Export current month Excel</Button>
              <Button type="button" variant="outline" onClick={() => downloadCsv("all")}><Download className="h-4 w-4" /> Export all CSV</Button>
              <Button type="button" variant="outline" onClick={() => downloadExcel("all")}><FileSpreadsheet className="h-4 w-4" /> Export all Excel</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>{editingId ? t("edit") : t("newTransaction")}</CardTitle><Button type="button" variant="outline" onClick={startNew}><Plus className="h-4 w-4" /> {t("newTransaction")}</Button></CardHeader>
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
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-5"><Button type="submit">{t("save")}</Button>{saved ? <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{t("saved")}</span> : null}</div>
          </form>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div><Label>Year</Label><Select value={filterYear} onChange={(event) => setMonthParts(event.target.value, filterMonth)}>{yearOptions.map((year) => <option value={year} key={year}>{year}</option>)}</Select></div>
            <div><Label>Month</Label><Select value={filterMonth} onChange={(event) => setMonthParts(filterYear, event.target.value)}>{monthOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select></div>
            <div><Label>Type</Label><Select value={filterType} onChange={(event) => setFilterType(event.target.value as "all" | TransactionType)}><option value="all">All</option><option value="income">{t("income")}</option><option value="expense">{t("expense")}</option></Select></div>
            <div><Label>App</Label><Select value={filterApp} onChange={(event) => setFilterApp(event.target.value)}><option value="all">All apps</option>{apps.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}</Select></div>
            <div><Label>Group</Label><Select value={filterGroup} onChange={(event) => setFilterGroup(event.target.value)}><option value="all">All groups</option>{shareGroups.map((group) => <option value={group.id} key={group.id}>{group.group_name}</option>)}</Select></div>
            <div><Label>Customer</Label><Select value={filterCustomer} onChange={(event) => setFilterCustomer(event.target.value)}><option value="all">All customers</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.nickname}</option>)}</Select></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Transactions for {monthLabel(selectedMonth)}</CardTitle></CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
            <>
              <div className="hidden overflow-x-auto lg:block"><Table><TableHeader><TableRow><TableHead></TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Category</TableHead><TableHead>App</TableHead><TableHead>Group</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Slip</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredTransactions.map((item) => <TableRow key={item.id} className={cn(item.type === "income" ? "bg-emerald-500/5" : "bg-rose-500/5")}><TableCell><span className="block h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} /></TableCell><TableCell><StatusBadge status={item.type === "income" ? t("income") : t("expense")} /></TableCell><TableCell className={item.type === "income" ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>{formatCurrency(item.amount)}</TableCell><TableCell>{item.category}</TableCell><TableCell>{appLookup.get(item.app_id ?? "")?.name ?? "-"}</TableCell><TableCell>{groupLookup.get(item.group_id ?? "")?.group_name ?? "-"}</TableCell><TableCell>{customerLookup.get(item.customer_id ?? "")?.nickname ?? "-"}</TableCell><TableCell>{formatDate(item.date)}</TableCell><TableCell>{item.slip_url ? "Attached" : "-"}</TableCell><TableCell><div className="flex flex-wrap justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" size="sm" variant="destructive" onClick={() => deleteTransaction(item.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></TableCell></TableRow>)}</TableBody></Table></div>
              <div className="grid gap-3 lg:hidden">{filteredTransactions.map((item) => <div key={item.id} className={cn("min-w-0 rounded-xl border p-4", item.type === "income" ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10")}><div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between"><div className="min-w-0"><StatusBadge status={item.type === "income" ? t("income") : t("expense")} /><p className="mt-2 break-words text-base font-semibold">{item.category}</p></div><p className={item.type === "income" ? "text-xl font-semibold text-emerald-200 min-[380px]:shrink-0" : "text-xl font-semibold text-rose-200 min-[380px]:shrink-0"}>{formatCurrency(item.amount)}</p></div><div className="mt-3 grid gap-1 text-sm text-slate-300"><p className="break-words">{appLookup.get(item.app_id ?? "")?.name ?? "-"} / {groupLookup.get(item.group_id ?? "")?.group_name ?? "-"}</p><p className="break-words">{customerLookup.get(item.customer_id ?? "")?.nickname ?? "-"} / {formatDate(item.date)}</p><p className="break-all">Slip: {item.slip_url ? "Attached" : "-"}</p>{item.note ? <p className="break-words text-slate-400">{item.note}</p> : null}</div><div className="mt-4 grid gap-2 min-[380px]:grid-cols-2"><Button type="button" variant="outline" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" variant="destructive" onClick={() => deleteTransaction(item.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></div>)}</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
