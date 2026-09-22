"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell, BookOpen, ChevronDown, ChevronRight, CircleCheck, Folder, Hash, Home, Layers3, LayoutDashboard, Menu, Plus, Search, Settings2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTaskStoreSnapshot } from "@/lib/tasks/store";
import { canManageNode, canSeeList, canWriteWorkspace, isWorkspaceAdmin, nodeById, nodeHref, preferencesFor, scopeLists, selectTasks } from "@/lib/tasks/workspace-model";
import { isClosed } from "@/lib/tasks/domain";
import type { WorkNode, WorkScope, WorkspaceState } from "@/lib/tasks/workspace-types";
import { WorkMenu, WorkModal, WorkPeople } from "./common";
import { buildNode, HierarchyEditor } from "./hierarchy-editor";

export function WorkspaceShell({ state, workspaceId, title, onCreate, onOpen, children }: { state: WorkspaceState; workspaceId: string; title: string; onCreate: () => void; onOpen: (id: string) => void; children: ReactNode }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const work = state.workspaces.find((w) => w.id === workspaceId)!;
  const pref = preferencesFor(state, workspaceId);
  const scope: WorkScope = { kind: "workspace", id: workspaceId, workspaceId };
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [editor, setEditor] = useState<WorkNode | null>(null);
  const [createWorkspace, setCreateWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [sample, setSample] = useState("empty");
  const container = useRef<HTMLDivElement>(null);
  const base = `/workspaces/${workspaceId}`;
  const tasks = selectTasks(state, scope);
  const unread = state.notifications.filter((n) => n.workspaceId === workspaceId && n.recipientId === state.actorId && !n.read && !n.archived).length;
  const changePref = (patch: Parameters<typeof runTaskCommand>[0] & { kind: "work-preferences" }) => runTaskCommand(patch);
  const favorite = (id: string) => changePref({ kind: "work-preferences", workspaceId, patch: { favorites: pref.favorites.includes(id) ? pref.favorites.filter((v) => v !== id) : [...pref.favorites, id] } });
  const visit = (node: WorkNode) => {
    runTaskCommand({ kind: "work-preferences", workspaceId, patch: { recent: [node.id, ...pref.recent.filter((id) => id !== node.id)].slice(0, 12) } });
    setMobile(false);
  };
  const reorder = (node: WorkNode, delta: number) => {
    const siblings = [...state.spaces, ...state.folders, ...state.lists].filter((n) => n.kind === node.kind && n.workspaceId === workspaceId && (n.kind === "space" || node.kind !== "space" && n.spaceId === node.spaceId) && (n.kind !== "list" || node.kind !== "list" || n.folderId === node.folderId)).sort((a, b) => a.position - b.position);
    const index = siblings.findIndex((n) => n.id === node.id); const other = siblings[index + delta];
    if (!other) return;
    [siblings[index], siblings[index + delta]] = [other, node];
    runTaskCommand({ kind: "work-batch", commands: siblings.map((n, position) => ({ kind: "work-node", node: { ...n, position } })) });
  };
  const tree = (node: WorkNode, depth = 0): ReactNode => {
    if (node.archived || node.kind === "list" && !canSeeList(state, node)) return null;
    const children = node.kind === "space" ? [...state.folders.filter((f) => f.spaceId === node.id), ...state.lists.filter((l) => l.spaceId === node.id && !l.folderId)] : node.kind === "folder" ? state.lists.filter((l) => l.folderId === node.id) : [];
    const expanded = pref.expanded.includes(node.id);
    const managed = canManageNode(state, node);
    const count = scopeLists(state, { kind: node.kind, id: node.id, workspaceId }).reduce((n, l) => n + tasks.filter((t) => t.listId === l.id && !isClosed(t)).length, 0);
    const Icon = node.kind === "folder" ? Folder : node.kind === "list" ? Hash : Layers3;
    return <div key={node.id}>
      <div className="group flex items-center gap-0.5 pr-1" style={{ paddingLeft: depth * 12 }}>
        {node.kind !== "list" ? <Button variant="ghost" size="icon-sm" className="size-6 shrink-0" aria-label={`${expanded ? "Collapse" : "Expand"} ${node.name}`} onClick={() => changePref({ kind: "work-preferences", workspaceId, patch: { expanded: expanded ? pref.expanded.filter((id) => id !== node.id) : [...pref.expanded, node.id] } })}>{expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}</Button> : <span className="w-6 shrink-0" />}
        <SidebarMenuButton className="h-8 min-w-0 flex-1 text-xs" isActive={pathname === nodeHref(node)} render={<Link href={nodeHref(node)} />} onClick={() => visit(node)}><Icon className="size-3.5 shrink-0" style={{ color: node.color }} /><span className="truncate">{node.name}</span><span className="ml-auto text-[10px] text-muted-foreground">{count || ""}</span></SidebarMenuButton>
        <WorkMenu label={`${node.name} actions`} actions={[
          { label: pref.favorites.includes(node.id) ? "Remove favorite" : "Favorite", onClick: () => favorite(node.id) },
          { label: "Edit / move location", disabled: !managed, onClick: () => setEditor(node) },
          ...(node.kind !== "list" ? [{ label: "Create List", disabled: !managed, onClick: () => setEditor(buildNode(state, { kind: node.kind, id: node.id, workspaceId }, "list")) }] : []),
          ...(node.kind === "space" ? [{ label: "Create Folder", disabled: !managed, onClick: () => setEditor(buildNode(state, { kind: "space", id: node.id, workspaceId }, "folder")) }] : []),
          { label: "Move up", disabled: !managed, onClick: () => reorder(node, -1) },
          { label: "Move down", disabled: !managed, onClick: () => reorder(node, 1) },
          { label: "Archive location", disabled: !managed, danger: true, onClick: () => { if (window.confirm(`Archive ${node.name}? ${count} active tasks and all descendant locations will be hidden. Their statuses and history will be kept.`)) runTaskCommand({ kind: "work-node", node: { ...node, archived: true } }); } },
        ]} />
      </div>
      {expanded && children.sort((a, b) => a.position - b.position).map((child) => tree(child, depth + 1))}
    </div>;
  };
  const navItems = [
    { name: "Home", path: "", icon: Home }, { name: "My Work", path: "/my-work", icon: CircleCheck },
    { name: "Inbox", path: "/inbox", icon: Bell }, { name: "Everything", path: "/everything", icon: Layers3 },
    { name: "Dashboards", path: "/dashboards", icon: LayoutDashboard },
  ];
  const navigation = <Sidebar collapsible="none" className="h-full w-full border-r bg-sidebar">
    <SidebarContent className="gap-1">
      <SidebarGroup><SidebarMenu>{navItems.map((item) => <SidebarMenuItem key={item.name}><SidebarMenuButton isActive={pathname === base + item.path} render={<Link href={base + item.path} />} onClick={() => setMobile(false)}><item.icon className="size-4" /><span>{item.name}</span>{item.path === "/inbox" && unread > 0 && <Badge className="ml-auto text-[10px]" variant="secondary">{unread}</Badge>}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup>
      <SidebarGroup><SidebarGroupLabel>Favorites</SidebarGroupLabel><SidebarMenu>{pref.favorites.map((id) => { const node = nodeById(state, id); const task = tasks.find((t) => t.id === id); const view = state.views.find((v) => v.id === id && (!v.personal || v.creatorId === state.actorId)); if ((!node || node.archived || node.kind === "list" && !canSeeList(state, node)) && !task && !view) return null; return <SidebarMenuItem key={id}><SidebarMenuButton onClick={() => { if (task) onOpen(id); else if (view) router.push(`${view.scopeId === workspaceId ? base + "/everything" : nodeHref(nodeById(state, view.scopeId)!)}?view=${view.id}`); else if (node) { visit(node); router.push(nodeHref(node)); } }}><Star className="size-3 text-amber-500" /><span className="truncate text-xs">{task?.subject ?? view?.name ?? node?.name}</span></SidebarMenuButton></SidebarMenuItem>; })}{!pref.favorites.length && <p className="px-2 text-[11px] text-muted-foreground">Favorite a List, view, or task.</p>}</SidebarMenu></SidebarGroup>
      <SidebarGroup className="px-1"><div className="flex items-center justify-between px-2"><SidebarGroupLabel className="px-0">Spaces</SidebarGroupLabel><Button variant="ghost" size="icon-sm" aria-label="Create Space" disabled={!isWorkspaceAdmin(state, workspaceId)} onClick={() => setEditor(buildNode(state, scope, "space"))}><Plus className="size-3.5" /></Button></div>{state.spaces.filter((s) => s.workspaceId === workspaceId).sort((a, b) => a.position - b.position).map((s) => tree(s))}{!state.spaces.some((s) => s.workspaceId === workspaceId && !s.archived) && <p className="p-3 text-xs text-muted-foreground">Create a Space to organize your team's work.</p>}</SidebarGroup>
    </SidebarContent>
    <SidebarFooter className="border-t"><SidebarMenu>{[{ name: "Templates", path: "/templates", icon: BookOpen }, { name: "Members & Settings", path: "/settings", icon: Settings2 }].map((item) => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={pathname === base + item.path} render={<Link href={base + item.path} />} onClick={() => setMobile(false)}><item.icon className="size-4" />{item.name}</SidebarMenuButton></SidebarMenuItem>)}<SidebarMenuItem><SidebarMenuButton render={<Link href="/dashboard" />}><ArrowLeft className="size-4" />Back to HR</SidebarMenuButton></SidebarMenuItem></SidebarMenu><p className="px-2 py-1 text-[9px] text-muted-foreground">Local demo · same-browser synchronization</p></SidebarFooter>
  </Sidebar>;
  return <SidebarProvider className="h-dvh min-h-0 w-full overflow-hidden"><div className="flex h-full min-w-0 flex-1 flex-col">
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3">
      <Button className="md:hidden" variant="ghost" size="icon-sm" aria-label="Open workspace navigation" onClick={() => setMobile(true)}><Menu className="size-4" /></Button>
      <div className="min-w-0 max-w-56 flex-1 md:w-56 md:flex-none"><SearchSelect value={work.id} options={state.workspaces.filter((w) => !w.archived && w.members[state.actorId]).map((w) => ({ value: w.id, label: w.name }))} onChange={(id) => { if (id && runTaskCommand({ kind: "work-switch", workspaceId: id })) router.push(`/workspaces/${id}`); }} /></div>
      <WorkMenu label="Workspace actions" actions={[{ label: "Create workspace", onClick: () => setCreateWorkspace(true) }, { label: "Workspace settings", onClick: () => router.push(base + "/settings") }]} />
      <Badge variant="secondary" className="hidden text-[9px] sm:inline-flex">Demo</Badge><span className="hidden truncate border-l pl-3 text-xs text-muted-foreground lg:block">{title}</span>
      <div className="ml-auto flex items-center gap-1.5"><Button variant="outline" size="sm" onClick={() => setSearch("")} aria-label="Search workspace"><Search className="size-3.5" /><span className="hidden sm:inline">Search workspace</span></Button><Button size="sm" disabled={!canWriteWorkspace(state, workspaceId)} onClick={onCreate}><Plus className="size-3.5" /><span className="hidden sm:inline">Create</span></Button><Button variant="ghost" size="icon-sm" aria-label={`Inbox, ${unread} unread`} nativeButton={false} render={<Link href={base + "/inbox"} />}><Bell className="size-4" /></Button><ModeToggle /><Button variant="ghost" size="icon" aria-label="Demo member settings" nativeButton={false} render={<Link href={base + "/settings"} />}><WorkPeople state={state} ids={[state.actorId]} /></Button></div>
    </header>
    <div className="min-h-0 flex-1" ref={container}>{!isMobile ? <ResizablePanelGroup orientation="horizontal" onLayoutChanged={(layout, meta) => { if (meta.isUserInteraction && container.current) runTaskCommand({ kind: "work-preferences", workspaceId, patch: { sidebarWidth: Math.max(240, Math.min(320, layout.navigation / 100 * container.current.clientWidth)) } }); }}><ResizablePanel id="navigation" defaultSize={`${pref.sidebarWidth}px`} minSize="240px" maxSize="320px">{navigation}</ResizablePanel><ResizableHandle /><ResizablePanel id="work" minSize="30%"><main className="flex h-full min-w-0 flex-col overflow-hidden bg-background">{children}</main></ResizablePanel></ResizablePanelGroup> : <main className="flex h-full min-w-0 flex-col overflow-hidden">{children}</main>}</div>
    <Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left" className="w-80 gap-0 p-0"><SheetHeader className="border-b p-4"><SheetTitle>{work.name}</SheetTitle></SheetHeader>{navigation}</SheetContent></Sheet>
    {editor && <HierarchyEditor state={state} initial={editor} onClose={() => setEditor(null)} />}
    {search !== null && <WorkModal title="Search workspace" description="Find accessible tasks and locations in this workspace." onClose={() => setSearch(null)} wide><Input autoFocus aria-label="Search tasks and locations" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Task name, code, or location…" /><div className="max-h-96 space-y-1 overflow-auto">{[...state.spaces, ...state.folders, ...scopeLists(state, scope)].filter((n) => n.workspaceId === workspaceId && !n.archived && n.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8).map((n) => <Button key={n.id} variant="ghost" className="w-full justify-start text-xs" onClick={() => { router.push(nodeHref(n)); visit(n); setSearch(null); }}><Hash className="size-3.5" />{n.name}<Badge variant="secondary" className="ml-auto">{n.kind}</Badge></Button>)}{selectTasks(state, scope, undefined, search).slice(0, 30).map((t) => <Button key={t.id} variant="ghost" className="h-auto w-full justify-start py-3 text-left text-xs" onClick={() => { setSearch(null); onOpen(t.id); }}><CircleCheck className="size-3.5 shrink-0" /><span className="truncate">{t.subject}</span><span className="ml-auto shrink-0 text-[9px] text-muted-foreground">{t.code}</span></Button>)}</div></WorkModal>}
    {createWorkspace && <WorkModal title="Create workspace" description="A separate browser-local workspace. Existing data is kept." onClose={() => setCreateWorkspace(false)}><Input autoFocus aria-label="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Workspace name" /><SearchSelect value={sample} options={[{ value: "empty", label: "Start empty" }, { value: "sample", label: "Include sample projects and tasks" }]} onChange={(v) => v && setSample(v)} /><Button disabled={!workspaceName.trim()} onClick={() => { if (runTaskCommand({ kind: "work-create", name: workspaceName, sample: sample === "sample" }, "Workspace created")) { setCreateWorkspace(false); router.push(`/workspaces/${getTaskStoreSnapshot().workspace!.activeWorkspaceId}`); } }}>Create workspace</Button></WorkModal>}
  </div></SidebarProvider>;
}
