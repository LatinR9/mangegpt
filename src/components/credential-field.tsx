import { EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskSecret } from "@/lib/utils";

export function CredentialField({ hint }: { hint?: string | null }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <Lock className="h-4 w-4" />
      <span className="font-mono">{maskSecret(hint ?? "secret")}</span>
      <Button size="icon" variant="ghost" title="Credentials are masked by default" className="ml-auto h-7 w-7"><EyeOff className="h-4 w-4" /></Button>
    </div>
  );
}
