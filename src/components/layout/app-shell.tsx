"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { LegacyWorkspaceRedirect, WorkspaceLoading } from "@/components/tasks/workspace/workspace-app";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/workspaces" || pathname.startsWith("/workspaces/")) return <>{children}</>;
  if (/^\/(tasks|projects|my-tasks)(\/|$)/.test(pathname)) return <Suspense fallback={<WorkspaceLoading />}><LegacyWorkspaceRedirect /></Suspense>;
  return <SidebarProvider><AppSidebar /><SidebarInset><SiteHeader /><main className="flex-1 space-y-6 p-4 lg:p-6">{children}</main></SidebarInset></SidebarProvider>;
}
