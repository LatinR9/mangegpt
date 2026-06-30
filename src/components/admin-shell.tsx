import Link from "next/link";
import { BarChart3, BellRing, CreditCard, LayoutDashboard, LogOut, Package, Settings, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apps", label: "Apps", icon: Package },
  { href: "/accounts", label: "Accounts", icon: Shield },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/accounting", label: "Accounting", icon: BarChart3 },
  { href: "/settings/telegram", label: "Telegram", icon: BellRing },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="admin-band sticky top-0 z-30 lg:fixed lg:inset-y-0 lg:w-[260px] lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-4 lg:h-20 lg:items-start lg:flex-col lg:justify-center">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><CreditCard className="h-5 w-5" /></span>
            <span>SubGroup Manager</span>
          </Link>
          <form action="/logout" method="post" className="lg:hidden"><Button size="icon" variant="ghost" title="Log out"><LogOut className="h-4 w-4" /></Button></form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <form action="/logout" method="post" className="mt-auto hidden p-4 lg:block"><Button className="w-full" variant="outline"><LogOut className="h-4 w-4" /> Log out</Button></form>
      </aside>
      <main className="lg:col-start-2">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
