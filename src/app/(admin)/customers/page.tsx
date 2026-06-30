import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customers } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <div>
      <PageHeader title="Customers" description="Manage contact profiles and platform handles for each member." action={<Button><Plus className="h-4 w-4" /> New customer</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card><CardHeader><CardTitle>Customer list</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Line</TableHead><TableHead>Telegram</TableHead><TableHead>Note</TableHead></TableRow></TableHeader><TableBody>{customers.map((customer) => <TableRow key={customer.id}><TableCell><div className="flex items-center gap-3"><img src={customer.profile_image_url ?? ""} alt="" className="h-10 w-10 rounded-full border bg-muted" /><div><p className="font-medium">{customer.nickname}</p><p className="text-sm text-muted-foreground">{customer.full_name}</p></div></div></TableCell><TableCell>{customer.phone}</TableCell><TableCell>{customer.line_id}</TableCell><TableCell>{customer.telegram_username}</TableCell><TableCell>{customer.note}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Create or edit customer</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>Nickname</Label><Input /></div><div><Label>Full name</Label><Input /></div><div><Label>Phone</Label><Input /></div><div><Label>Line ID</Label><Input /></div><div><Label>Facebook URL</Label><Input /></div><div><Label>Telegram username</Label><Input /></div><div><Label>Profile image URL</Label><Input /></div><div><Label>Note</Label><Textarea /></div><Button type="button" className="w-full">Save customer</Button></form></CardContent></Card>
      </div>
    </div>
  );
}
