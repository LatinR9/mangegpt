import { LockKeyhole, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

const DEFAULT_ADMIN_USERNAME = "LatinR9";

async function loginAction(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!username || !password) redirect("/login?error=missing");

  const expectedUsername = process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) redirect("/login?error=config");
  if (username !== expectedUsername || password !== expectedPassword) redirect("/login?error=invalid");

  const cookieStore = await cookies();
  cookieStore.set("sg_admin_mock", "active", { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(next.startsWith("/") ? next : "/dashboard");
}

function getErrorMessage(error?: string) {
  if (error === "missing") return "Enter username and password to continue.";
  if (error === "invalid") return "Username or password is incorrect.";
  if (error === "config") return "Admin password is not configured. Add ADMIN_PASSWORD to your environment variables.";
  return null;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#1d4ed8,_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a)] p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-950/90 text-slate-50 shadow-2xl shadow-blue-950/30">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">SubGroup Manager</CardTitle>
            <CardDescription className="text-slate-400">Private admin access for your subscription dashboard.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" placeholder="Admin username" autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Admin password" autoComplete="current-password" />
            </div>
            {errorMessage ? <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{errorMessage}</p> : null}
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-500" type="submit"><LockKeyhole className="h-4 w-4" /> Log in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
