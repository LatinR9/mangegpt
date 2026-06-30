"use client";

import Link from "next/link";
import { Archive, BarChart3, BellRing, CreditCard, FolderOpen, LayoutDashboard, LogOut, Menu, Package, Settings, Shield, Users, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useLanguage } from "@/hooks/use-language";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navItems: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/apps", labelKey: "apps", icon: Package },
  { href: "/accounts", labelKey: "serviceAccounts", icon: Shield },
  { href: "/stock", labelKey: "stock", icon: Archive },
  { href: "/groups", labelKey: "groups", icon: Users },
  { href: "/customers", labelKey: "customers", icon: Users },
  { href: "/files", labelKey: "files", icon: FolderOpen },
  { href: "/accounting", labelKey: "accounting", icon: BarChart3 },
  { href: "/settings/telegram", labelKey: "telegram", icon: BellRing },
  { href: "/settings", labelKey: "settings", icon: Settings }
];

const bottomNav = navItems.filter((item) => ["dashboard", "stock", "groups", "files", "settings"].includes(item.labelKey));

function BrandMark({ compact = false }: { compact?: boolean }) {
  const [settings] = useAppSettings();
  return (
    <Link href="/dashboard" className="flex min-w-0 items-center gap-3 font-semibold">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-lg shadow-blue-950/40">
        {settings.site_logo_url ? <img src={settings.site_logo_url} alt="" className="h-full w-full object-cover" /> : <CreditCard className="h-5 w-5" />}
      </span>
      {!compact ? <span className="truncate text-slate-50">{settings.site_name || "SubGroup Manager"}</span> : null}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = (mobile = false) => (
    <nav className={cn("flex gap-1", mobile ? "flex-col" : "overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-4")}>
      {navItems.map((item) => (
        <Link key={`${item.href}-${item.labelKey}`} href={item.href} onClick={() => setDrawerOpen(false)} className="flex min-h-11 min-w-fit items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white">
          <item.icon className="h-4 w-4 shrink-0 text-blue-300" /> {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-transparent">
      <header className="admin-band sticky top-0 z-40 flex h-16 items-center justify-between px-4 lg:hidden">
        <BrandMark />
        <Button size="icon" variant="outline" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[min(86vw,340px)] overflow-y-auto border-r border-slate-800 bg-slate-950 p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><BrandMark /><Button size="icon" variant="ghost" onClick={() => setDrawerOpen(false)}><X className="h-5 w-5" /></Button></div>
            <div className="mb-4"><label className="mb-1 block text-xs font-medium text-muted-foreground">{t("language")}</label><Select value={language} onChange={(event) => setLanguage(event.target.value as "th" | "en")}><option value="th">Thai</option><option value="en">English</option></Select></div>
            {nav(true)}
          </aside>
        </div>
      ) : null}

      <aside className="admin-band sticky top-0 z-30 hidden lg:fixed lg:inset-y-0 lg:block lg:w-[280px] lg:border-r lg:border-b-0">
        <div className="flex h-24 items-start justify-center px-4 lg:flex-col"><BrandMark /></div>
        <div className="px-3 pb-3 lg:px-4"><label className="mb-1 block text-xs font-medium text-muted-foreground">{t("language")}</label><Select value={language} onChange={(event) => setLanguage(event.target.value as "th" | "en")} className="h-10"><option value="th">Thai</option><option value="en">English</option></Select></div>
        {nav()}
        <form action="/logout" method="post" className="mt-auto hidden p-4 lg:block"><Button className="w-full" variant="outline"><LogOut className="h-4 w-4" /> Log out</Button></form>
      </aside>

      <main className="pb-24 lg:pb-0 lg:pl-[280px]">
        <div className="mx-auto w-full max-w-7xl overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-800 bg-slate-950/95 px-1 py-2 backdrop-blur lg:hidden">
        {bottomNav.map((item) => (
          <Link key={`bottom-${item.labelKey}`} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-slate-300 active:bg-blue-500/15">
            <item.icon className="h-5 w-5 text-blue-300" />
            <span className="max-w-full truncate">{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
