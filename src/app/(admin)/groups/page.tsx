"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import { calculateGroupStatus } from "@/lib/group-status";
import type { ShareGroup } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);
const emptyGroup: Omit<ShareGroup, "id"> = {
  app_id: "",
  service_account_id: "",
  group_name: "",
  seats_total: 5,
  expiry_date: today,
  note: ""
};

export default function GroupsPage() {
  const { apps, groupMembers, serviceAccounts, setGroupMembers, setShareGroups, shareGroups } = useAdminData();
  const { t } = useLanguage();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyGroup);
  const [saved, setSaved] = useState(false);

  function withDefaults(group = emptyGroup) {
    return {
      ...group,
      app_id: group.app_id || apps[0]?.id || "",
      service_account_id: group.service_account_id || serviceAccounts[0]?.id || ""
    };
  }

  function startNew() {
    setEditingId(null);
    setForm(withDefaults());
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function startEdit(group: ShareGroup) {
    setEditingId(group.id);
    setForm(withDefaults({ ...group, note: group.note ?? "" }));
    setSaved(false);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }

  function saveGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: ShareGroup = {
      id: editingId ?? createId("grp"),
      ...withDefaults(form),
      group_name: form.group_name.trim() || "Untitled group",
      seats_total: Number(form.seats_total) || 1,
      note: form.note?.trim() || null
    };
    setShareGroups((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [payload, ...current]);
    setEditingId(payload.id);
    setSaved(true);
  }

  function deleteGroup(id: string) {
    if (!window.confirm("Delete this group?")) return;
    setShareGroups((current) => current.filter((item) => item.id !== id));
    setGroupMembers((current) => current.filter((member) => member.group_id !== id));
    if (editingId === id) startNew();
  }

  return (
    <div>
      <PageHeader title={t("groups")} description="Create subscription groups, assign service accounts, and track seat completion." action={<Button type="button" onClick={startNew}><Plus className="h-4 w-4" /> {t("newGroup")}</Button>} />
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader><CardTitle>{t("groups")}</CardTitle></CardHeader>
          <CardContent>
            {shareGroups.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
              <>
                <div className="hidden overflow-x-auto lg:block"><Table><TableHeader><TableRow><TableHead>Group</TableHead><TableHead>App</TableHead><TableHead>Account</TableHead><TableHead>Seats</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{shareGroups.map((group) => { const members = groupMembers.filter((member) => member.group_id === group.id); return <TableRow key={group.id}><TableCell><Link className="font-medium text-primary hover:underline" href={`/groups/${group.id}`}>{group.group_name}</Link></TableCell><TableCell>{apps.find((app) => app.id === group.app_id)?.name}</TableCell><TableCell>{serviceAccounts.find((account) => account.id === group.service_account_id)?.label}</TableCell><TableCell>{members.length}/{group.seats_total}</TableCell><TableCell>{formatDate(group.expiry_date)}</TableCell><TableCell><StatusBadge status={calculateGroupStatus(group, members)} /></TableCell><TableCell><div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(group)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" size="sm" variant="destructive" onClick={() => deleteGroup(group.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></TableCell></TableRow>; })}</TableBody></Table></div>
                <div className="grid gap-3 lg:hidden">{shareGroups.map((group) => { const members = groupMembers.filter((member) => member.group_id === group.id); return <div key={group.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link className="text-base font-semibold text-blue-200" href={`/groups/${group.id}`}>{group.group_name}</Link><p className="mt-1 text-sm text-muted-foreground">{apps.find((app) => app.id === group.app_id)?.name}</p></div><StatusBadge status={calculateGroupStatus(group, members)} /></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Seats</p><p className="font-semibold">{members.length}/{group.seats_total}</p></div><div><p className="text-muted-foreground">Expiry</p><p className="font-semibold">{formatDate(group.expiry_date)}</p></div></div><p className="mt-3 text-sm text-muted-foreground">{serviceAccounts.find((account) => account.id === group.service_account_id)?.label}</p><div className="mt-4 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => startEdit(group)}><Pencil className="h-4 w-4" /> {t("edit")}</Button><Button type="button" variant="destructive" onClick={() => deleteGroup(group.id)}><Trash2 className="h-4 w-4" /> {t("delete")}</Button></div></div>; })}</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{editingId ? t("edit") : t("newGroup")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveGroup} className="space-y-4">
              <div><Label>App</Label><Select value={form.app_id || apps[0]?.id || ""} onChange={(event) => setForm({ ...form, app_id: event.target.value })}>{apps.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}</Select></div>
              <div><Label>Service account</Label><Select value={form.service_account_id || serviceAccounts[0]?.id || ""} onChange={(event) => setForm({ ...form, service_account_id: event.target.value })}>{serviceAccounts.map((account) => <option value={account.id} key={account.id}>{account.label}</option>)}</Select></div>
              <div><Label>Group name</Label><Input ref={firstInputRef} value={form.group_name} onChange={(event) => setForm({ ...form, group_name: event.target.value })} placeholder="July group A" /></div>
              <div><Label>Total seats</Label><Input type="number" min={1} value={form.seats_total} onChange={(event) => setForm({ ...form, seats_total: Number(event.target.value) })} /></div>
              <div><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(event) => setForm({ ...form, expiry_date: event.target.value })} /></div>
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
