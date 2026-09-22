"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/layout/nav-user";
import { NavNotifications } from "@/components/layout/nav-notifications";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { navSections, resolveActiveHref } from "@/lib/nav";

function resolveTitle(pathname: string) {
  const href = resolveActiveHref(pathname);
  if (!href) return "HR Portal";
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.href === href) return item.title;
    }
  }
  return "HR Portal";
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/50 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800/40 dark:bg-[#0f1420]/90 lg:px-6">
      <SidebarTrigger className="-ml-1 size-9 rounded-xl border border-slate-200/50 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800" />
      <Separator orientation="vertical" className="mr-1 h-5! bg-slate-200 dark:bg-slate-800" />
      <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <NavNotifications />
        <ModeToggle />
        <NavUser />
      </div>
    </header>
  );
}
