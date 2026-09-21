"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/layout/nav-user";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { navSections } from "@/lib/nav";

function resolveTitle(pathname: string) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) return item.title;
    }
  }
  return "HR Portal";
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5!" />
      <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <NavUser />
      </div>
    </header>
  );
}
