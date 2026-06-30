"use client";

import Link from "next/link";
import { BarChart3, BellRing, CreditCard, LayoutDashboard, LogOut, Package, Repeat2, Settings, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { useLanguage } from "@/hooks/use-language";
import type { TranslationKey } from "@/lib/i18n";

const navItems: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/apps", labelKey: "apps", icon: Package },
  { href: "/accounts", labelKey: "serviceAccounts", icon: Shield },
  { href: "/groups", labelKey: "groups", icon: Users },
  { href: "/customers", labelKey: "customers", icon: Users },
  { href: "/groups", labelKey: "renewals", icon: Repeat2 },
  { href: "/accounting", labelKey: "accounting", icon: BarChart3 },
  { href: "/settings/telegram", labelKey: "telegram", icon: BellRing },
  { href: "/settings", labelKey: "settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-transparent lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="admin-band sticky top-0 z-30 lg:fixed lg:inset-y-0 lg:w-[280px] lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-4 lg:h-24 lg:items-start lg:flex-col lg:justify-center">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-lg shadow-blue-950/40"><CreditCard className="h-5 w-5" /></span>
            <span className="text-slate-50">SubGroup Manager</span>
          </Link>
          <form action="/logout" method="post" className="lg:hidden"><Button size="icon" variant="ghost" title="Log out"><LogOut className="h-4 w-4" /></Button></form>
        </div>
        <div className="px-3 pb-3 lg:px-4">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("language")}</label>
          <Select value={language} onChange={(event) => setLanguage(event.target.value as "th" | "en")} className="h-9">
            <option value="th">Thai</option>
            <option value="en">English</option>
          </Select>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-4">
          {navItems.map((item) => (
            <Link key={`${item.href}-${item.labelKey}`} href={item.href} className="flex min-w-fit items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white">
              <item.icon className="h-4 w-4 text-blue-300" /> {t(item.labelKey)}
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
