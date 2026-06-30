import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apps, groupMembers, serviceAccounts, shareGroups } from "@/lib/mock-data";
import { calculateGroupStatus } from "@/lib/group-status";
import { formatDate } from "@/lib/utils";

export default function GroupsPage() {
  return (
    <div>
      <PageHeader title="Share groups" description="Create subscription groups, assign service accounts, and track seat completion." action={<Button><Plus className="h-4 w-4" /> New group</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card><CardHeader><CardTitle>Groups</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Group</TableHead><TableHead>App</TableHead><TableHead>Account</TableHead><TableHead>Seats</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{shareGroups.map((group) => { const members = groupMembers.filter((member) => member.group_id === group.id); return <TableRow key={group.id}><TableCell><Link className="font-medium text-primary hover:underline" href={`/groups/${group.id}`}>{group.group_name}</Link></TableCell><TableCell>{apps.find((app) => app.id === group.app_id)?.name}</TableCell><TableCell>{serviceAccounts.find((account) => account.id === group.service_account_id)?.label}</TableCell><TableCell>{members.length}/{group.seats_total}</TableCell><TableCell>{formatDate(group.expiry_date)}</TableCell><TableCell><StatusBadge status={calculateGroupStatus(group, members)} /></TableCell></TableRow>; })}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Create or edit group</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>App</Label><Select>{apps.map((app) => <option key={app.id}>{app.name}</option>)}</Select></div><div><Label>Service account</Label><Select>{serviceAccounts.map((account) => <option key={account.id}>{account.label}</option>)}</Select></div><div><Label>Group name</Label><Input placeholder="July group A" /></div><div><Label>Total seats</Label><Input type="number" defaultValue={5} /></div><div><Label>Expiry date</Label><Input type="date" /></div><div><Label>Note</Label><Textarea /></div><Button type="button" className="w-full">Save group</Button></form></CardContent></Card>
      </div>
    </div>
  );
}
