import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apps, customers, groupMembers, shareGroups } from "@/lib/mock-data";
import { calculateGroupStatus } from "@/lib/group-status";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = shareGroups.find((item) => item.id === groupId) ?? shareGroups[0];
  const app = apps.find((item) => item.id === group.app_id);
  const members = groupMembers.filter((member) => member.group_id === group.id);
  const status = calculateGroupStatus(group, members);

  return (
    <div>
      <Link href="/groups" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to groups</Link>
      <PageHeader title={group.group_name} description={`${app?.name ?? "App"} expires ${formatDate(group.expiry_date)}`} action={<StatusBadge status={status} />} />
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>Total seats</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{group.seats_total}</CardContent></Card>
        <Card><CardHeader><CardTitle>Assigned seats</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{members.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid seats</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{members.filter((member) => member.paid_status === "paid").length}</CardContent></Card>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card><CardHeader><CardTitle>Seat members</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Seat</TableHead><TableHead>Customer</TableHead><TableHead>Paid</TableHead><TableHead>Amount</TableHead><TableHead>Payment date</TableHead><TableHead>Renewal</TableHead><TableHead>Member expiry</TableHead></TableRow></TableHeader><TableBody>{members.map((member) => { const customer = customers.find((item) => item.id === member.customer_id); return <TableRow key={member.id}><TableCell>{member.seat_no}</TableCell><TableCell><div className="flex items-center gap-3"><img src={customer?.profile_image_url ?? ""} alt="" className="h-9 w-9 rounded-full border" /><span className="font-medium">{customer?.nickname}</span></div></TableCell><TableCell><StatusBadge status={member.paid_status} /></TableCell><TableCell>{formatCurrency(member.paid_amount)}</TableCell><TableCell>{member.payment_date ? formatDate(member.payment_date) : "-"}</TableCell><TableCell>{member.wants_renewal}</TableCell><TableCell>{formatDate(member.member_expiry_date)}</TableCell></TableRow>; })}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Add customer to seat</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>Seat number</Label><Input type="number" defaultValue={members.length + 1} /></div><div><Label>Customer</Label><Select>{customers.map((customer) => <option key={customer.id}>{customer.nickname}</option>)}</Select></div><div><Label>Paid status</Label><Select defaultValue="unpaid"><option>paid</option><option>unpaid</option><option>partial</option></Select></div><div><Label>Paid amount</Label><Input type="number" defaultValue={0} /></div><div><Label>Payment date</Label><Input type="date" /></div><div><Label>Wants renewal</Label><Select defaultValue="unknown"><option>yes</option><option>no</option><option>unknown</option></Select></div><div><Label>Member expiry date</Label><Input type="date" defaultValue={group.expiry_date} /></div><div><Label>Note</Label><Textarea /></div><Button type="button" className="w-full"><Plus className="h-4 w-4" /> Add member</Button></form></CardContent></Card>
      </div>
    </div>
  );
}
