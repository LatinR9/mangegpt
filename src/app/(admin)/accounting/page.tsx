import { ExportButtons } from "@/components/export-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apps, customers, shareGroups, transactions } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountingPage() {
  return (
    <div>
      <PageHeader title="Accounting" description="Track income, expenses, payment links, and export reports." action={<ExportButtons rows={transactions} />} />
      <Card className="mb-6"><CardHeader><CardTitle>Filters</CardTitle></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div><Label>Date from</Label><Input type="date" /></div><div><Label>Date to</Label><Input type="date" /></div><div><Label>App</Label><Select><option>All apps</option>{apps.map((app) => <option key={app.id}>{app.name}</option>)}</Select></div><div><Label>Group</Label><Select><option>All groups</option>{shareGroups.map((group) => <option key={group.id}>{group.group_name}</option>)}</Select></div><div><Label>Type</Label><Select><option>All</option><option>income</option><option>expense</option></Select></div></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Transactions</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Category</TableHead><TableHead>App</TableHead><TableHead>Group</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Slip</TableHead></TableRow></TableHeader><TableBody>{transactions.map((item) => <TableRow key={item.id}><TableCell><StatusBadge status={item.type} /></TableCell><TableCell>{formatCurrency(item.amount)}</TableCell><TableCell>{item.category}</TableCell><TableCell>{apps.find((app) => app.id === item.app_id)?.name ?? "-"}</TableCell><TableCell>{shareGroups.find((group) => group.id === item.group_id)?.group_name ?? "-"}</TableCell><TableCell>{customers.find((customer) => customer.id === item.customer_id)?.nickname ?? "-"}</TableCell><TableCell>{formatDate(item.date)}</TableCell><TableCell>{item.slip_url ? "Attached" : "-"}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  );
}
