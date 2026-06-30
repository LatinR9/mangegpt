import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { apps } from "@/lib/mock-data";

export default function AppsPage() {
  return (
    <div>
      <PageHeader title="Apps" description="Create, edit, archive, and color-code supported subscription apps." action={<Button><Plus className="h-4 w-4" /> New app</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card><CardHeader><CardTitle>App catalog</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>App</TableHead><TableHead>Default seats</TableHead><TableHead>Status</TableHead><TableHead>Note</TableHead></TableRow></TableHeader><TableBody>{apps.map((app) => <TableRow key={app.id}><TableCell><div className="flex items-center gap-3"><img src={app.logo_url} alt="" className="h-10 w-10 rounded-md border" /><span className="font-medium" style={{ color: app.color }}>{app.name}</span></div></TableCell><TableCell>{app.default_seats}</TableCell><TableCell><Badge variant={app.status === "active" ? "success" : "secondary"}>{app.status}</Badge></TableCell><TableCell>{app.note}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Create or edit app</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>Name</Label><Input placeholder="StreamBox" /></div><div><Label>Logo URL</Label><Input placeholder="https://..." /></div><div><Label>Color</Label><Input type="color" defaultValue="#0f766e" /></div><div><Label>Default seats</Label><Input type="number" defaultValue={5} /></div><div><Label>Status</Label><Select defaultValue="active"><option>active</option><option>paused</option><option>archived</option></Select></div><div><Label>Note</Label><Textarea placeholder="Internal note" /></div><Button type="button" className="w-full">Save app</Button></form></CardContent></Card>
      </div>
    </div>
  );
}
