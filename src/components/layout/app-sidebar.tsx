"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { navSections } from "@/lib/nav";
import { company } from "@/lib/mock/data";
import { Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();

  // Find the section that owns the current route (if any)
  const activeSection = navSections.find((sec) =>
    sec.items.some(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
    )
  );

  // Single open section state — accordion behavior (opening one closes all others)
  const [openSection, setOpenSection] = useState<string | null>(() =>
    activeSection && activeSection.items.length > 1 ? activeSection.label : null
  );

  // Sync open section when navigating across routes (e.g. back/forward, external link)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (activeSection && activeSection.items.length > 1) {
      setOpenSection(activeSection.label);
    }
  }

  const handleTriggerToggle = (label: string, willOpen: boolean) => {
    if (state === "collapsed" && willOpen) {
      setOpen(true);
    }
    setOpenSection(willOpen ? label : null);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{company.name}</span>
                <span className="truncate text-xs text-muted-foreground">HR Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-2">
          <SidebarMenu className="gap-1">
            {navSections.map((section) => {
              const isSingleItem = section.items.length === 1;
              const SectionIcon = section.icon;

              if (isSingleItem) {
                const singleItem = section.items[0];
                const active =
                  pathname === singleItem.href ||
                  (singleItem.href !== "/dashboard" &&
                    pathname.startsWith(singleItem.href + "/"));

                return (
                  <SidebarMenuItem key={section.label}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={singleItem.title}
                      render={<Link href={singleItem.href} />}
                      onClick={() => setOpenSection(null)}
                    >
                      <SectionIcon className="size-4 shrink-0" />
                      <span>{singleItem.title}</span>
                      {singleItem.badge ? (
                        <Badge
                          variant="secondary"
                          className="ml-auto px-1.5 py-0 text-[10px]"
                        >
                          {singleItem.badge}
                        </Badge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              // Multi-item section -> Collapsible Accordion Dropdown
              const isOpen = openSection === section.label;
              const isSectionActive = section.items.some(
                (item) =>
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/"))
              );

              // Calculate total badges in this section
              const badgeTotal = section.items.reduce((acc, it) => {
                const n = parseInt(it.badge ?? "0", 10);
                return acc + (isNaN(n) ? 0 : n);
              }, 0);

              return (
                <SidebarMenuItem key={section.label}>
                  <Collapsible
                    open={isOpen}
                    onOpenChange={(willOpen) =>
                      handleTriggerToggle(section.label, willOpen)
                    }
                    className="group/collapsible w-full"
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={section.label}
                          isActive={isSectionActive}
                          className="w-full justify-between"
                        />
                      }
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <SectionIcon className="size-4 shrink-0" />
                        <span className="truncate font-medium">{section.label}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        {badgeTotal > 0 && (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {badgeTotal}
                          </Badge>
                        )}
                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                            isOpen && "rotate-90"
                          )}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 border-l-0 pl-2">
                        {section.items.map((item) => {
                          const active =
                            pathname === item.href ||
                            (item.href !== "/dashboard" &&
                              pathname.startsWith(item.href + "/"));
                          const ItemIcon = item.icon;

                          return (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton
                                isActive={active}
                                size="md"
                                render={<Link href={item.href} />}
                              >
                                <ItemIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{item.title}</span>
                                {item.badge ? (
                                  <Badge
                                    variant="secondary"
                                    className="ml-auto px-1.5 py-0 text-[10px]"
                                  >
                                    {item.badge}
                                  </Badge>
                                ) : null}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
