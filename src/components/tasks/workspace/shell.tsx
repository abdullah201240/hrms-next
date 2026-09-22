"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Folder,
  Hash,
  Home,
  Layers3,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings2,
  Star,
  Sparkles,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTaskStoreSnapshot } from "@/lib/tasks/store";
import {
  canManageNode,
  canSeeList,
  canWriteWorkspace,
  isWorkspaceAdmin,
  nodeById,
  nodeHref,
  preferencesFor,
  scopeLists,
  selectTasks,
} from "@/lib/tasks/workspace-model";
import { isClosed } from "@/lib/tasks/domain";
import type { WorkNode, WorkScope, WorkspaceState } from "@/lib/tasks/workspace-types";
import { WorkMenu, WorkModal, WorkPeople } from "./common";
import { buildNode, HierarchyEditor } from "./hierarchy-editor";
import { cn } from "@/lib/utils";

export function WorkspaceShell({
  state,
  workspaceId,
  title,
  onCreate,
  onOpen,
  children,
}: {
  state: WorkspaceState;
  workspaceId: string;
  title: string;
  onCreate: () => void;
  onOpen: (id: string) => void;
  children: ReactNode;
}) {
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
  const unread = state.notifications.filter(
    (n) =>
      n.workspaceId === workspaceId &&
      n.recipientId === state.actorId &&
      !n.read &&
      !n.archived,
  ).length;

  const changePref = (
    patch: Parameters<typeof runTaskCommand>[0] & { kind: "work-preferences" },
  ) => runTaskCommand(patch);

  const favorite = (id: string) =>
    changePref({
      kind: "work-preferences",
      workspaceId,
      patch: {
        favorites: pref.favorites.includes(id)
          ? pref.favorites.filter((v) => v !== id)
          : [...pref.favorites, id],
      },
    });

  const visit = (node: WorkNode) => {
    runTaskCommand({
      kind: "work-preferences",
      workspaceId,
      patch: {
        recent: [node.id, ...pref.recent.filter((id) => id !== node.id)].slice(0, 12),
      },
    });
    setMobile(false);
  };

  const reorder = (node: WorkNode, delta: number) => {
    const siblings = [...state.spaces, ...state.folders, ...state.lists]
      .filter(
        (n) =>
          n.kind === node.kind &&
          n.workspaceId === workspaceId &&
          (n.kind === "space" ||
            (node.kind !== "space" && n.spaceId === node.spaceId)) &&
          (n.kind !== "list" || node.kind !== "list" || n.folderId === node.folderId),
      )
      .sort((a, b) => a.position - b.position);
    const index = siblings.findIndex((n) => n.id === node.id);
    const other = siblings[index + delta];
    if (!other) return;
    [siblings[index], siblings[index + delta]] = [other, node];
    runTaskCommand({
      kind: "work-batch",
      commands: siblings.map((n, position) => ({
        kind: "work-node",
        node: { ...n, position },
      })),
    });
  };

  const tree = (node: WorkNode, depth = 0): ReactNode => {
    if (node.archived || (node.kind === "list" && !canSeeList(state, node))) return null;
    const children =
      node.kind === "space"
        ? [
            ...state.folders.filter((f) => f.spaceId === node.id),
            ...state.lists.filter((l) => l.spaceId === node.id && !l.folderId),
          ]
        : node.kind === "folder"
          ? state.lists.filter((l) => l.folderId === node.id)
          : [];
    const expanded = pref.expanded.includes(node.id);
    const managed = canManageNode(state, node);
    const count = scopeLists(state, {
      kind: node.kind,
      id: node.id,
      workspaceId,
    }).reduce(
      (n, l) => n + tasks.filter((t) => t.listId === l.id && !isClosed(t)).length,
      0,
    );
    const Icon = node.kind === "folder" ? Folder : node.kind === "list" ? Hash : Layers3;

    return (
      <div key={node.id} className="py-0.5">
        <div
          className="group flex items-center gap-1 rounded-xl pr-1 transition-colors hover:bg-muted/60"
          style={{ paddingLeft: depth * 14 + 4 }}
        >
          {node.kind !== "list" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={`${expanded ? "Collapse" : "Expand"} ${node.name}`}
              onClick={() =>
                changePref({
                  kind: "work-preferences",
                  workspaceId,
                  patch: {
                    expanded: expanded
                      ? pref.expanded.filter((id) => id !== node.id)
                      : [...pref.expanded, node.id],
                  },
                })
              }
            >
              {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            </Button>
          ) : (
            <span className="w-5 shrink-0" />
          )}

          <SidebarMenuButton
            className="h-8 min-w-0 flex-1 rounded-lg text-xs font-medium"
            isActive={pathname === nodeHref(node)}
            render={<Link href={nodeHref(node)} />}
            onClick={() => visit(node)}
          >
            <Icon
              className="size-3.5 shrink-0"
              style={{ color: node.color || "var(--primary)" }}
            />
            <span className="truncate">{node.name}</span>
            {count > 0 && (
              <span className="ml-auto rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                {count}
              </span>
            )}
          </SidebarMenuButton>

          <WorkMenu
            label={`${node.name} actions`}
            actions={[
              {
                label: pref.favorites.includes(node.id) ? "Remove favorite" : "Favorite",
                onClick: () => favorite(node.id),
              },
              {
                label: "Edit / move location",
                disabled: !managed,
                onClick: () => setEditor(node),
              },
              ...(node.kind !== "list"
                ? [
                    {
                      label: "Create List",
                      disabled: !managed,
                      onClick: () =>
                        setEditor(
                          buildNode(
                            state,
                            { kind: node.kind, id: node.id, workspaceId },
                            "list",
                          ),
                        ),
                    },
                  ]
                : []),
              ...(node.kind === "space"
                ? [
                    {
                      label: "Create Folder",
                      disabled: !managed,
                      onClick: () =>
                        setEditor(
                          buildNode(
                            state,
                            { kind: "space", id: node.id, workspaceId },
                            "folder",
                          ),
                        ),
                    },
                  ]
                : []),
              {
                label: "Move up",
                disabled: !managed,
                onClick: () => reorder(node, -1),
              },
              {
                label: "Move down",
                disabled: !managed,
                onClick: () => reorder(node, 1),
              },
              {
                label: "Archive location",
                disabled: !managed,
                danger: true,
                onClick: () => {
                  if (
                    window.confirm(
                      `Archive ${node.name}? ${count} active tasks and all descendant locations will be hidden. Their statuses and history will be kept.`,
                    )
                  )
                    runTaskCommand({
                      kind: "work-node",
                      node: { ...node, archived: true },
                    });
                },
              },
            ]}
          />
        </div>

        {expanded &&
          children
            .sort((a, b) => a.position - b.position)
            .map((child) => tree(child, depth + 1))}
      </div>
    );
  };

  const navItems = [
    { name: "Home", path: "", icon: Home },
    { name: "My Work", path: "/my-work", icon: CircleCheck },
    { name: "Inbox", path: "/inbox", icon: Bell },
    { name: "Everything", path: "/everything", icon: Layers3 },
    { name: "Dashboards", path: "/dashboards", icon: LayoutDashboard },
  ];

  const navigation = (
    <Sidebar collapsible="none" className="h-full w-full border-r bg-card/60 backdrop-blur-md">
      <SidebarContent className="gap-2 p-2">
        {/* Workspace Brand Summary Card */}
        <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/80 p-3 shadow-2xs">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-xs"
            style={{ backgroundColor: work.color || "#2563eb" }}
          >
            {work.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xs font-bold text-foreground">{work.name}</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="font-medium">{work.members[state.actorId] || "Member"}</span>
              <span>•</span>
              <span>{Object.keys(work.members).length} people</span>
            </div>
          </div>
        </div>

        {/* Main Hubs */}
        <SidebarGroup className="p-0 pt-2">
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              const active = pathname === base + item.path;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={active}
                    render={<Link href={base + item.path} />}
                    onClick={() => setMobile(false)}
                    className={cn(
                      "h-9 rounded-xl px-3 text-xs font-semibold transition-all",
                      active
                        ? "bg-blue-50 text-blue-700 shadow-2xs dark:bg-blue-950/60 dark:text-blue-300"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.name}</span>
                    {item.path === "/inbox" && unread > 0 && (
                      <Badge className="ml-auto rounded-full px-1.5 py-0 text-[10px] bg-blue-600 text-white">
                        {unread}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Favorites */}
        <SidebarGroup className="p-0 pt-3">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Favorites
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {pref.favorites.map((id) => {
              const node = nodeById(state, id);
              const task = tasks.find((t) => t.id === id);
              const view = state.views.find(
                (v) => v.id === id && (!v.personal || v.creatorId === state.actorId),
              );
              if (
                (!node ||
                  node.archived ||
                  (node.kind === "list" && !canSeeList(state, node))) &&
                !task &&
                !view
              )
                return null;

              return (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    className="h-8 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (task) onOpen(id);
                      else if (view)
                        router.push(
                          `${
                            view.scopeId === workspaceId
                              ? base + "/everything"
                              : nodeHref(nodeById(state, view.scopeId)!)
                          }?view=${view.id}`,
                        );
                      else if (node) {
                        visit(node);
                        router.push(nodeHref(node));
                      }
                    }}
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    <span className="truncate text-xs">
                      {task?.subject ?? view?.name ?? node?.name}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            {!pref.favorites.length && (
              <p className="px-2 py-1 text-[11px] text-muted-foreground/70">
                Click star on any List or task to pin it here.
              </p>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Spaces Hierarchy */}
        <SidebarGroup className="p-0 pt-3">
          <div className="flex items-center justify-between px-2 pb-1">
            <SidebarGroupLabel className="p-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Spaces
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 rounded-md hover:bg-muted"
              aria-label="Create Space"
              disabled={!isWorkspaceAdmin(state, workspaceId)}
              onClick={() => setEditor(buildNode(state, scope, "space"))}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="space-y-0.5">
            {state.spaces
              .filter((s) => s.workspaceId === workspaceId && !s.archived)
              .sort((a, b) => a.position - b.position)
              .map((s) => tree(s))}

            {!state.spaces.some((s) => s.workspaceId === workspaceId && !s.archived) && (
              <div className="rounded-xl border border-dashed border-border/80 p-3 text-center text-xs text-muted-foreground">
                <p>No Spaces yet.</p>
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => setEditor(buildNode(state, scope, "space"))}
                >
                  Create your first Space
                </Button>
              </div>
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/80 p-3 space-y-1">
        <SidebarMenu className="gap-0.5">
          {[
            { name: "Templates", path: "/templates", icon: BookOpen },
            { name: "Members & Settings", path: "/settings", icon: Settings2 },
          ].map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                isActive={pathname === base + item.path}
                render={<Link href={base + item.path} />}
                onClick={() => setMobile(false)}
                className="h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <item.icon className="size-3.5 shrink-0" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard" />}
              className="h-8 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <ArrowLeft className="size-3.5 shrink-0" />
              <span>Back to HR Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarProvider className="h-dvh min-h-0 w-full overflow-hidden bg-background">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* Modern Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button
              className="md:hidden size-8 rounded-lg"
              variant="ghost"
              size="icon-sm"
              aria-label="Open workspace navigation"
              onClick={() => setMobile(true)}
            >
              <Menu className="size-4" />
            </Button>

            {/* Workspace Selector */}
            <div className="w-48 sm:w-56">
              <SearchSelect
                value={work.id}
                options={state.workspaces
                  .filter((w) => !w.archived && w.members[state.actorId])
                  .map((w) => ({ value: w.id, label: w.name }))}
                onChange={(id) => {
                  if (id && runTaskCommand({ kind: "work-switch", workspaceId: id }))
                    router.push(`/workspaces/${id}`);
                }}
              />
            </div>

            <WorkMenu
              label="Workspace actions"
              actions={[
                {
                  label: "Create workspace",
                  icon: <Plus className="size-3.5" />,
                  onClick: () => setCreateWorkspace(true),
                },
                {
                  label: "Workspace settings",
                  icon: <Settings2 className="size-3.5" />,
                  onClick: () => router.push(base + "/settings"),
                },
              ]}
            />

            {/* Breadcrumb / Title */}
            <div className="hidden items-center gap-2 border-l border-border pl-3 lg:flex">
              <span className="text-xs font-semibold text-foreground truncate max-w-64">
                {title}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Global Search Trigger */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-xl border-border bg-muted/30 px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              aria-label="Search workspace"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Search workspace</span>
              <kbd className="hidden rounded bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-block shadow-2xs">
                ⌘K
              </kbd>
            </Button>

            {/* Create Task Action */}
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              disabled={!canWriteWorkspace(state, workspaceId)}
              onClick={onCreate}
            >
              <Plus className="size-3.5" />
              <span>New Task</span>
            </Button>

            {/* Inbox Notification Bell */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label={`Inbox, ${unread} unread`}
              nativeButton={false}
              render={<Link href={base + "/inbox"} />}
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-blue-600" />
                </span>
              )}
            </Button>

            <ModeToggle />

            {/* Member Profile Avatar */}
            <div className="pl-1 border-l border-border">
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-full p-0"
                aria-label="Member settings"
                nativeButton={false}
                render={<Link href={base + "/settings"} />}
              >
                <WorkPeople state={state} ids={[state.actorId]} size="md" />
              </Button>
            </div>
          </div>
        </header>

        {/* Resizable / Scrollable Canvas Area */}
        <div className="min-h-0 flex-1" ref={container}>
          {!isMobile ? (
            <ResizablePanelGroup
              orientation="horizontal"
              onLayoutChanged={(layout, meta) => {
                if (meta.isUserInteraction && container.current)
                  runTaskCommand({
                    kind: "work-preferences",
                    workspaceId,
                    patch: {
                      sidebarWidth: Math.max(
                        240,
                        Math.min(
                          340,
                          (layout.navigation / 100) * container.current.clientWidth,
                        ),
                      ),
                    },
                  });
              }}
            >
              <ResizablePanel
                id="navigation"
                defaultSize={`${pref.sidebarWidth}px`}
                minSize="240px"
                maxSize="340px"
              >
                {navigation}
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-border/60 hover:bg-blue-500" />
              <ResizablePanel id="work" minSize="30%">
                <main className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
                  {children}
                </main>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <main className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
              {children}
            </main>
          )}
        </div>

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobile} onOpenChange={setMobile}>
          <SheetContent side="left" className="w-80 gap-0 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-sm font-bold">{work.name}</SheetTitle>
            </SheetHeader>
            {navigation}
          </SheetContent>
        </Sheet>

        {/* Hierarchy Node Editor Dialog */}
        {editor && (
          <HierarchyEditor
            state={state}
            initial={editor}
            onClose={() => setEditor(null)}
          />
        )}

        {/* Global Workspace Search Modal */}
        {search !== null && (
          <WorkModal
            title="Search Workspace"
            description="Find tasks, Lists, and Spaces across this workspace."
            onClose={() => setSearch(null)}
            wide
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                autoFocus
                aria-label="Search tasks and locations"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by task name, code, or list…"
                className="pl-9 h-10 rounded-xl text-sm"
              />
            </div>

            <div className="max-h-96 space-y-1 overflow-auto pt-2">
              {/* Matching locations */}
              {[...state.spaces, ...state.folders, ...scopeLists(state, scope)]
                .filter(
                  (n) =>
                    n.workspaceId === workspaceId &&
                    !n.archived &&
                    n.name.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(0, 6)
                .map((n) => (
                  <Button
                    key={n.id}
                    variant="ghost"
                    className="w-full justify-start gap-2.5 rounded-xl text-xs"
                    onClick={() => {
                      router.push(nodeHref(n));
                      visit(n);
                      setSearch(null);
                    }}
                  >
                    <Hash className="size-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-foreground">{n.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] capitalize">
                      {n.kind}
                    </Badge>
                  </Button>
                ))}

              {/* Matching tasks */}
              {selectTasks(state, scope, undefined, search)
                .slice(0, 20)
                .map((t) => (
                  <Button
                    key={t.id}
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2.5 rounded-xl py-2.5 text-left text-xs"
                    onClick={() => {
                      setSearch(null);
                      onOpen(t.id);
                    }}
                  >
                    <CircleCheck className="size-4 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium text-foreground">{t.subject}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                      {t.code}
                    </span>
                  </Button>
                ))}
            </div>
          </WorkModal>
        )}

        {/* Create Workspace Modal */}
        {createWorkspace && (
          <WorkModal
            title="Create Workspace"
            description="Create a clean, isolated team workspace in your local storage."
            onClose={() => setCreateWorkspace(false)}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
                <Input
                  autoFocus
                  aria-label="Workspace name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Engineering & Product"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Starter Content</label>
                <SearchSelect
                  value={sample}
                  options={[
                    { value: "empty", label: "Start fresh (Empty workspace)" },
                    { value: "sample", label: "Include demo projects, sprints & tasks" },
                  ]}
                  onChange={(v) => v && setSample(v)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateWorkspace(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  disabled={!workspaceName.trim()}
                  onClick={() => {
                    if (
                      runTaskCommand(
                        {
                          kind: "work-create",
                          name: workspaceName,
                          sample: sample === "sample",
                        },
                        "Workspace created",
                      )
                    ) {
                      setCreateWorkspace(false);
                      router.push(
                        `/workspaces/${getTaskStoreSnapshot().workspace!.activeWorkspaceId}`,
                      );
                    }
                  }}
                >
                  Create Workspace
                </Button>
              </div>
            </div>
          </WorkModal>
        )}
      </div>
    </SidebarProvider>
  );
}
