"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import type { Customer } from "@/lib/types";

const emptyCustomer: Omit<Customer, "id"> = {
  nickname: "",
  full_name: "",
  phone: "",
  line_id: "",
  facebook_url: "",
  telegram_username: "",
  profile_image_url: "",
  note: ""
};

function nullable(value: string) {
  return value.trim() || null;
}

export default function CustomersPage() {
  const { customers, setCustomers } = useAdminData();
  const { t } = useLanguage();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCustomer);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customers;
    return customers.filter((customer) => [customer.nickname, customer.full_name, customer.phone, customer.line_id, customer.facebook_url, customer.telegram_username].some((value) => (value ?? "").toLowerCase().includes(normalized)));
  }, [customers, query]);

  function startNew() {
    setEditingId(null);
    setForm(emptyCustomer);
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id);
    setForm({ ...customer, phone: customer.phone ?? "", line_id: customer.line_id ?? "", facebook_url: customer.facebook_url ?? "", telegram_username: customer.telegram_username ?? "", profile_image_url: customer.profile_image_url ?? "", note: customer.note ?? "" });
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: Customer = {
      id: editingId ?? createId("cus"),
      nickname: form.nickname.trim() || "New customer",
      full_name: form.full_name.trim() || form.nickname.trim() || "New customer",
      phone: nullable(form.phone ?? ""),
      line_id: nullable(form.line_id ?? ""),
      facebook_url: nullable(form.facebook_url ?? ""),
      telegram_username: nullable(form.telegram_username ?? ""),
      profile_image_url: nullable(form.profile_image_url ?? "") || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(form.nickname || "Customer")}`,
      note: nullable(form.note ?? "")
    };
    setCustomers((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [payload, ...current]);
    setEditingId(payload.id);
    setSaved(true);
  }

  function deleteCustomer(id: string) {
    if (!window.confirm("Delete this customer?")) return;
    setCustomers((current) => current.filter((item) => item.id !== id));
    if (editingId === id) startNew();
  }

  return (
    <div>
      <PageHeader title={t("customers")} description="Manage contact profiles and platform handles for each member." action={<Button type="button" onClick={startNew}><Plus className="h-4 w-4" /> {t("newCustomer")}</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Customer list</CardTitle><div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCustomer")} /></div></CardHeader>
          <CardContent className="overflow-x-auto">
            {filteredCustomers.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
              <Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Line</TableHead><TableHead>Facebook</TableHead><TableHead>Telegram</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredCustomers.map((customer) => <TableRow key={customer.id}><TableCell><div className="flex items-center gap-3"><img src={customer.profile_image_url ?? ""} alt="" className="h-10 w-10 rounded-full border bg-muted" /><div><p className="font-medium">{customer.nickname}</p><p className="text-sm text-muted-foreground">{customer.full_name}</p></div></div></TableCell><TableCell>{customer.phone}</TableCell><TableCell>{customer.line_id}</TableCell><TableCell className="max-w-48 truncate">{customer.facebook_url}</TableCell><TableCell>{customer.telegram_username}</TableCell><TableCell><div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(customer)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" size="sm" variant="destructive" onClick={() => deleteCustomer(customer.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></TableCell></TableRow>)}</TableBody></Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{editingId ? t("edit") : t("newCustomer")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveCustomer} className="space-y-4">
              <div><Label>Nickname</Label><Input ref={firstInputRef} value={form.nickname} onChange={(event) => setForm({ ...form, nickname: event.target.value })} /></div>
              <div><Label>Full name</Label><Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
              <div><Label>Line ID</Label><Input value={form.line_id ?? ""} onChange={(event) => setForm({ ...form, line_id: event.target.value })} /></div>
              <div><Label>Facebook URL</Label><Input value={form.facebook_url ?? ""} onChange={(event) => setForm({ ...form, facebook_url: event.target.value })} /></div>
              <div><Label>Telegram username</Label><Input value={form.telegram_username ?? ""} onChange={(event) => setForm({ ...form, telegram_username: event.target.value })} /></div>
              <div><Label>Profile image URL</Label><Input value={form.profile_image_url ?? ""} onChange={(event) => setForm({ ...form, profile_image_url: event.target.value })} /></div>
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
