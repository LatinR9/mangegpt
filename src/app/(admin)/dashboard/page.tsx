import { AlertTriangle, CalendarClock, CreditCard, DollarSign, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { apps, customers, groupMembers, shareGroups, transactions } from "@/lib/mock-data";
import { calculateGroupStatus } from "@/lib/group-status";
import { daysUntil, formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const groupSummaries = shareGroups.map((group) => {
    const members = groupMembers.filter((member) => member.group_id === group.id);
    return { group, members, status: calculateGroupStatus(group, members), app: apps.find((app) => app.id === group.app_id) };
  });
  const expiring = groupSummaries.filter((item) => daysUntil(item.group.expiry_date) >= 0 && daysUntil(item.group.expiry_date) <= 7);
  const unpaid = groupSummaries.filter((item) => item.members.some((member) => member.paid_status !== "paid"));

  const cards = [
    { label: "Total apps", value: apps.length, icon: Package },
    { label: "Active groups", value: shareGroups.length, icon: Users },
    { label: "Groups expiring soon", value: expiring.length, icon: CalendarClock },
    { label: "Unpaid members", value: groupMembers.filter((item) => item.paid_status !== "paid").length, icon: AlertTriangle },
    { label: "Monthly income", value: formatCurrency(income), icon: DollarSign },
    { label: "Monthly expenses", value: formatCurrency(expenses), icon: CreditCard },
    { label: "Estimated profit", value: formatCurrency(income - expenses), icon: DollarSign }
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Operational view of subscription groups, renewals, payments, and profit." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <Card key={card.label}><CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle><card.icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-semibold">{card.value}</div></CardContent></Card>)}
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Expiring within 7 days</CardTitle></CardHeader><CardContent className="space-y-3">{expiring.map(({ group, app, status }) => <div key={group.id} className="flex items-center justify-between rounded-md border p-3"><div><p className="font-medium">{group.group_name}</p><p className="text-sm text-muted-foreground">{app?.name} expires {formatDate(group.expiry_date)}</p></div><StatusBadge status={status} /></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Groups with unpaid members</CardTitle></CardHeader><CardContent className="space-y-3">{unpaid.map(({ group, members }) => { const names = members.filter((member) => member.paid_status !== "paid").map((member) => customers.find((customer) => customer.id === member.customer_id)?.nickname).join(", "); return <div key={group.id} className="rounded-md border p-3"><div className="flex items-center justify-between"><p className="font-medium">{group.group_name}</p><StatusBadge status="unpaid" /></div><p className="mt-1 text-sm text-muted-foreground">{names}</p></div>; })}</CardContent></Card>
      </section>
    </div>
  );
}
