"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Plus, Save, Trash2, UserRoundX } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { calculateGroupStatus } from "@/lib/group-status";
import type { Customer, GroupMember, PaidStatus, RenewalIntent } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const paidOptions: { value: PaidStatus; label: string; className: string; selected: string }[] = [
  { value: "paid", label: "Paid", className: "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10", selected: "border-emerald-400 bg-emerald-500 text-white" },
  { value: "unpaid", label: "Unpaid", className: "border-rose-500/50 text-rose-300 hover:bg-rose-500/10", selected: "border-rose-400 bg-rose-500 text-white" },
  { value: "partial", label: "Partial", className: "border-amber-500/50 text-amber-300 hover:bg-amber-500/10", selected: "border-amber-400 bg-amber-500 text-slate-950" }
];

const renewalOptions: { value: RenewalIntent; label: string; className: string; selected: string }[] = [
  { value: "yes", label: "Renew", className: "border-sky-500/50 text-sky-300 hover:bg-sky-500/10", selected: "border-sky-400 bg-sky-500 text-white" },
  { value: "no", label: "Not renew", className: "border-slate-500 text-slate-300 hover:bg-slate-700/50", selected: "border-rose-400 bg-slate-700 text-white" },
  { value: "unknown", label: "Unknown", className: "border-amber-500/50 text-amber-300 hover:bg-amber-500/10", selected: "border-amber-400 bg-amber-500 text-slate-950" }
];

function emptyMember(groupId: string, seatNo: number, expiryDate: string): GroupMember {
  return {
    id: createId("mem"),
    group_id: groupId,
    seat_no: seatNo,
    customer_id: "",
    paid_status: "unpaid",
    paid_amount: 0,
    payment_date: null,
    wants_renewal: "unknown",
    member_expiry_date: expiryDate,
    note: null
  };
}

function contactLine(customer?: Customer) {
  if (!customer) return "Empty seat";
  return [customer.phone, customer.line_id, customer.facebook_url].filter(Boolean).join(" / ") || "No contact channel";
}

export function GroupMemberManager({ groupId }: { groupId: string }) {
  const { apps, customers, groupMembers, setGroupMembers, shareGroups } = useAdminData();
  const group = shareGroups.find((item) => item.id === groupId);
  const app = apps.find((item) => item.id === group?.app_id);
  const [draftMembers, setDraftMembers] = useState<GroupMember[]>([]);
  const [activeSeat, setActiveSeat] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!group) return;
    setDraftMembers(groupMembers.filter((member) => member.group_id === group.id).sort((a, b) => a.seat_no - b.seat_no));
    setActiveSeat(1);
    setCustomerSearch("");
    setSaved(false);
    setHasUnsavedChanges(false);
  }, [group?.id, groupMembers, group]);

  const activeMember = useMemo(() => {
    if (!group) return null;
    return draftMembers.find((member) => member.seat_no === activeSeat) ?? emptyMember(group.id, activeSeat, group.expiry_date);
  }, [activeSeat, draftMembers, group]);

  if (!group) {
    return (
      <div>
        <Link href="/groups" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to groups</Link>
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Group not found.</CardContent></Card>
      </div>
    );
  }

  const status = calculateGroupStatus(group, draftMembers);
  const paidCount = draftMembers.filter((member) => member.customer_id && member.paid_status === "paid").length;
  const unpaidCount = draftMembers.filter((member) => member.customer_id && member.paid_status !== "paid").length;
  const totalPaid = draftMembers.reduce((sum, member) => sum + Number(member.paid_amount || 0), 0);
  const filledSeats = draftMembers.filter((member) => member.customer_id).length;
  const missingPayments = draftMembers.filter((member) => member.customer_id && member.paid_status !== "paid").length;
  const seats = Array.from({ length: group.seats_total }, (_, index) => index + 1);
  const filteredCustomers = customers.filter((customer) => {
    const value = customerSearch.trim().toLowerCase();
    if (!value) return true;
    return [customer.nickname, customer.full_name, customer.phone, customer.line_id, customer.facebook_url, customer.telegram_username].some((field) => (field ?? "").toLowerCase().includes(value));
  });

  function updateActiveMember(next: GroupMember) {
    setSaved(false);
    setHasUnsavedChanges(true);
    setDraftMembers((current) => {
      const withoutSeat = current.filter((member) => member.seat_no !== next.seat_no);
      if (!next.customer_id) return withoutSeat;
      return [...withoutSeat, next].sort((a, b) => a.seat_no - b.seat_no);
    });
  }

  function assignCustomer(customerId: string) {
    if (!activeMember) return;
    const duplicate = draftMembers.find((member) => member.customer_id === customerId && member.seat_no !== activeSeat);
    if (duplicate && !window.confirm("This customer is already in this group. Add again anyway?")) return;
    updateActiveMember({ ...activeMember, customer_id: customerId });
  }

  function clearSeat(seatNo = activeSeat) {
    setSaved(false);
    setHasUnsavedChanges(true);
    setDraftMembers((current) => current.filter((member) => member.seat_no !== seatNo));
  }

  function saveChanges() {
    if (!group) return;
    setGroupMembers((current) => [
      ...current.filter((member) => member.group_id !== group.id),
      ...draftMembers.filter((member) => member.customer_id)
    ]);
    setSaved(true);
    setHasUnsavedChanges(false);
  }

  function addCustomerToGroup() {
    if (!group) return;
    const emptySeat = seats.find((seat) => !draftMembers.some((member) => member.seat_no === seat));
    setActiveSeat(emptySeat ?? group.seats_total);
    setSaved(false);
    setHasUnsavedChanges(true);
  }

  const selectedCustomer = customers.find((customer) => customer.id === activeMember?.customer_id);

  return (
    <div>
      <Link href="/groups" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to groups</Link>
      <PageHeader title={group.group_name} description={`${app?.name ?? "App"} expires ${formatDate(group.expiry_date)}`} action={<StatusBadge status={status} />} />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {[
          ["Total seats", group.seats_total],
          ["Filled seats", filledSeats],
          ["Paid members", paidCount],
          ["Unpaid members", unpaidCount],
          ["Total paid", formatCurrency(totalPaid)],
          ["Expiry date", formatDate(group.expiry_date)],
          ["Group status", status.replaceAll("_", " ")]
        ].map(([label, value]) => (
          <Card key={label} className="bg-gradient-to-br from-card to-slate-950">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent className="text-xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </section>

      <Card className="mb-6 border-blue-500/30 bg-blue-500/10">
        <CardContent className="flex flex-col gap-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-blue-100">
            {filledSeats < group.seats_total ? "Incomplete group" : missingPayments === 0 ? "Paid complete" : `Missing ${missingPayments} payments`}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={addCustomerToGroup}><Plus className="h-4 w-4" /> Add customer to group</Button>
            <Button type="button" variant="outline" onClick={() => clearSeat()}><UserRoundX className="h-4 w-4" /> Clear seat</Button>
            <Button type="button" onClick={saveChanges}><Save className="h-4 w-4" /> Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {saved ? <p className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><CheckCircle2 className="mr-2 inline h-4 w-4" /> Saved changes to localStorage.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader><CardTitle>Manage members</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {seats.map((seatNo) => {
                const member = draftMembers.find((item) => item.seat_no === seatNo);
                const customer = customers.find((item) => item.id === member?.customer_id);
                return (
                  <button
                    type="button"
                    key={seatNo}
                    onClick={() => setActiveSeat(seatNo)}
                    className={cn("rounded-lg border p-4 text-left transition hover:border-blue-400 hover:bg-blue-500/10", activeSeat === seatNo ? "border-blue-400 bg-blue-500/15" : "border-border bg-slate-950/60")}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">Seat {seatNo}</span>
                      {member?.customer_id ? <StatusBadge status={member.paid_status} /> : <span className="rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground">Empty</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {customer?.profile_image_url ? <img src={customer.profile_image_url} alt="" className="h-11 w-11 rounded-full border border-blue-500/30 bg-muted" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed text-xs text-muted-foreground">No</div>}
                      <div>
                        <p className="font-medium">{customer?.nickname ?? "No customer"}</p>
                        <p className="text-sm text-muted-foreground">{customer?.full_name ?? "Choose a customer"}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">{contactLine(customer)}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:sticky xl:top-6 xl:self-start">
          <CardHeader>
            <CardTitle>Seat editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeMember ? (
              <>
                <div className="space-y-2">
                  <Label>Seat number</Label>
                  <Select value={String(activeSeat)} onChange={(event) => setActiveSeat(Number(event.target.value))}>
                    {seats.map((seat) => <option key={seat} value={seat}>Seat {seat}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search customer</Label>
                  <Input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Nickname, name, phone, Line, Facebook..." />
                  <Select value={activeMember.customer_id || ""} onChange={(event) => assignCustomer(event.target.value)}>
                    <option value="">Select customer</option>
                    {filteredCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.nickname} - {customer.full_name}</option>)}
                  </Select>
                </div>
                {selectedCustomer ? (
                  <div className="rounded-lg border bg-slate-950/70 p-3">
                    <div className="flex items-center gap-3">
                      <img src={selectedCustomer.profile_image_url ?? ""} alt="" className="h-12 w-12 rounded-full border border-blue-500/30" />
                      <div>
                        <p className="font-medium">{selectedCustomer.nickname}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.full_name}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{contactLine(selectedCustomer)}</p>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label>Payment status</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {paidOptions.map((option) => <button type="button" key={option.value} onClick={() => updateActiveMember({ ...activeMember, paid_status: option.value })} className={cn("rounded-lg border px-3 py-3 text-sm font-semibold transition", activeMember.paid_status === option.value ? option.selected : option.className)}>{option.label}</button>)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Paid amount</Label><Input type="number" value={activeMember.paid_amount} onChange={(event) => updateActiveMember({ ...activeMember, paid_amount: Number(event.target.value) })} /></div>
                  <div className="space-y-2"><Label>Payment date</Label><Input type="date" value={activeMember.payment_date ?? ""} onChange={(event) => updateActiveMember({ ...activeMember, payment_date: event.target.value || null })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Renewal status</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {renewalOptions.map((option) => <button type="button" key={option.value} onClick={() => updateActiveMember({ ...activeMember, wants_renewal: option.value })} className={cn("rounded-lg border px-3 py-3 text-sm font-semibold transition", activeMember.wants_renewal === option.value ? option.selected : option.className)}>{option.label}</button>)}
                  </div>
                </div>
                <div className="space-y-2"><Label>Member expiry date</Label><Input type="date" value={activeMember.member_expiry_date} onChange={(event) => updateActiveMember({ ...activeMember, member_expiry_date: event.target.value })} /></div>
                <div className="space-y-2"><Label>Note</Label><Textarea value={activeMember.note ?? ""} onChange={(event) => updateActiveMember({ ...activeMember, note: event.target.value || null })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => clearSeat()}><Trash2 className="h-4 w-4" /> Clear seat</Button>
                  <Button type="button" onClick={saveChanges}><Save className="h-4 w-4" /> Save changes</Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
      {hasUnsavedChanges ? (
        <div className="fixed inset-x-0 bottom-[72px] z-40 border-y border-blue-500/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur lg:hidden">
          <Button type="button" className="w-full" onClick={saveChanges}><Save className="h-4 w-4" /> Save changes</Button>
        </div>
      ) : null}
    </div>
  );
}
