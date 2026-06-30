import { LockKeyhole, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) redirect("/login?error=missing");

  const cookieStore = await cookies();
  cookieStore.set("sg_admin_mock", "active", { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_transparent_32%),linear-gradient(135deg,_#f8fafc,_#eef2f7)] p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">SubGroup Manager</CardTitle>
            <CardDescription>Private admin access for shared subscription groups.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <div className="space-y-2">
              <Label htmlFor="email">Admin email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@example.test" autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Masked by browser" autoComplete="current-password" />
            </div>
            {params.error ? <p className="text-sm text-destructive">Enter both fields to continue.</p> : null}
            <Button className="w-full" type="submit"><LockKeyhole className="h-4 w-4" /> Log in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
