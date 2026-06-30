import { Plus } from "lucide-react";
import { CredentialField } from "@/components/credential-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apps, serviceAccounts } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountsPage() {
  return (
    <div>
      <PageHeader title="Service accounts" description="Manage app logins and subscription costs. Password-like fields are masked by default." action={<Button><Plus className="h-4 w-4" /> New account</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card><CardHeader><CardTitle>Accounts</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Label</TableHead><TableHead>App</TableHead><TableHead>Login email</TableHead><TableHead>Password</TableHead><TableHead>Expiry</TableHead><TableHead>Cost</TableHead></TableRow></TableHeader><TableBody>{serviceAccounts.map((account) => <TableRow key={account.id}><TableCell className="font-medium">{account.label}</TableCell><TableCell>{apps.find((app) => app.id === account.app_id)?.name}</TableCell><TableCell>{account.login_email}</TableCell><TableCell><CredentialField hint={account.password_hint} /></TableCell><TableCell>{formatDate(account.expiry_date)}</TableCell><TableCell>{formatCurrency(account.cost)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Create or edit account</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>App</Label><Select>{apps.map((app) => <option key={app.id}>{app.name}</option>)}</Select></div><div><Label>Label</Label><Input placeholder="Main workspace" /></div><div><Label>Login email</Label><Input type="email" placeholder="admin@example.test" /></div><div><Label>Password</Label><Input type="password" placeholder="Stored encrypted later" /></div><div><Label>Expiry date</Label><Input type="date" /></div><div><Label>Cost</Label><Input type="number" /></div><div><Label>Note</Label><Textarea /></div><Button type="button" className="w-full">Save account</Button></form></CardContent></Card>
      </div>
    </div>
  );
}
