"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { runTaskCommand, useTaskWorkspace } from "@/hooks/use-task-workspace";
import { resetTaskDemo, retryTaskStorage } from "@/lib/tasks/store";
import { canSeeList, listArchived, nodeById, nodeHref, scopeHref } from "@/lib/tasks/workspace-model";
import type { WorkScope, WorkspaceState } from "@/lib/tasks/workspace-types";
import { toast } from "sonner";
import { WorkspaceShell } from "./shell";
import { WorkspaceWorkArea } from "./work-area";
import { QuickTask, WorkspaceTaskDetail } from "./task-panel";
import { WorkspaceDashboards, WorkspaceHome, WorkspaceInbox, WorkspaceMyWork } from "./hubs";
import { WorkEmpty } from "./common";

export function WorkspaceLoading() { return <div className="flex h-dvh gap-4 p-5" role="status" aria-label="Loading workspace"><Skeleton className="hidden h-full w-64 md:block" /><div className="flex-1 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div></div>; }
export function WorkspaceRecovery({ error }: { error: string }) { return <div className="mx-auto flex min-h-80 max-w-xl flex-col justify-center gap-4 p-8"><h1 className="text-lg font-semibold">Workspace storage needs attention</h1><p role="alert" className="text-sm text-destructive">{error}</p><Button onClick={retryTaskStorage}>Retry storage</Button><Button variant="outline" onClick={() => { if (window.confirm("Reset ALL task-demo v2 workspaces, tasks, conversations, templates, and preferences? The original v1 snapshot and unrelated HR data will not be changed.")) { try { resetTaskDemo(); } catch (e) { toast.error((e as Error).message); } } }}>Reset task-demo v2 data</Button><Link href="/dashboard" className="text-sm text-primary">Back to HR</Link></div>; }
export function WorkspaceApp() {
  const { workspace, ready, error } = useTaskWorkspace();
  if (!ready) return <WorkspaceLoading />;
  if (!workspace) return <WorkspaceRecovery error={error ?? "The browser demo could not be loaded."} />;
  return <WorkspaceRoute state={workspace} error={error} />;
}
function WorkspaceRoute({ state, error }: { state: WorkspaceState; error: string | null }) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const segments = pathname.split("/").filter(Boolean).slice(1).map((part) => { try { return decodeURIComponent(part); } catch { return part; } });
  const workspaceId = segments[0] ?? state.activeWorkspaceId;
  const work = state.workspaces.find((w) => w.id === workspaceId && w.members[state.actorId] && !w.archived);
  const section = segments[1] ?? "home";
  const scopeKind = section === "spaces" ? "space" : section === "folders" ? "folder" : section === "lists" ? "list" : "workspace";
  const node = scopeKind !== "workspace" ? nodeById(state, segments[2]) : undefined;
  const scope: WorkScope = { kind: scopeKind, id: node?.id ?? workspaceId, workspaceId };
  const taskId = section === "tasks" ? segments[2] : params.get("task");
  const trigger = useRef<HTMLElement | null>(null);
  const previousTask = useRef<string | null>(null);
  const [creating, setCreating] = useState<{ listId?: string; statusId?: string; dueAt?: string } | null>(null);
  const [dismissedCreate, setDismissedCreate] = useState("");
  const urlCreate = params.get("create") === "task" && dismissedCreate !== params.toString();
  useEffect(() => {
    if (!segments.length) {
      const target = state.workspaces.find((w) => w.id === state.activeWorkspaceId && w.members[state.actorId] && !w.archived) ?? state.workspaces.find((w) => w.members[state.actorId] && !w.archived);
      if (target) router.replace(`/workspaces/${target.id}`);
    } else if (work && state.activeWorkspaceId !== work.id) runTaskCommand({ kind: "work-switch", workspaceId: work.id });
  }, [pathname, state.activeWorkspaceId, state.actorId, state.workspaces, router, segments.length, work]);
  useEffect(() => {
    if (previousTask.current && !taskId) { requestAnimationFrame(() => trigger.current?.isConnected && trigger.current.focus({ preventScroll: true })); }
    previousTask.current = taskId ?? null;
  }, [taskId]);
  if (!work) return <WorkEmpty title="Workspace unavailable" description="This workspace does not exist or is not accessible to this demo member." action={<Button nativeButton={false} render={<Link href="/workspaces" />}>Open my workspace</Button>} />;
  const openTask = (id: string) => {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (section === "tasks") router.push(`/workspaces/${workspaceId}/tasks/${id}`, { scroll: false });
    else { const p = new URLSearchParams(window.location.search); p.set("task", id); router.push(`${pathname}?${p}`, { scroll: false }); }
  };
  const closeTask = () => {
    if (section === "tasks") { const task = state.tasks.find((t) => t.id === taskId); const list = state.lists.find((l) => l.id === task?.listId); router.push(list ? nodeHref(list) : `/workspaces/${workspaceId}/everything`); }
    else { const p = new URLSearchParams(window.location.search); p.delete("task"); router.push(`${pathname}?${p}`, { scroll: false }); }
  };
  const closeCreate = () => { setCreating(null); setDismissedCreate(params.toString()); if (params.has("create")) { const p = new URLSearchParams(window.location.search); p.delete("create"); p.delete("parent"); p.delete("list"); router.replace(`${pathname}?${p}`, { scroll: false }); } };
  const create = (listId?: string, statusId?: string, dueAt?: string) => setCreating({ listId, statusId, dueAt });
  const invalid = scopeKind !== "workspace" && (!node || node.kind !== scopeKind || node.workspaceId !== workspaceId || node.archived || node.kind === "list" && (!canSeeList(state, node) || listArchived(state, node)));
  const selectedTask = taskId ? state.tasks.find((t) => t.id === taskId && state.lists.find((l) => l.id === t.listId)?.workspaceId === workspaceId) : undefined;
  const title = node?.name ?? ({ home: "Home", "my-work": "My Work", inbox: "Inbox", dashboards: "Dashboards", settings: "Settings", templates: "Templates" } as Record<string, string>)[section] ?? "Workspace";
  const shared = { state, scope, onOpen: openTask };
  return <WorkspaceShell key={`${workspaceId}-${state.actorId}`} state={state} workspaceId={workspaceId} title={title} onOpen={openTask} onCreate={() => create()}>
    {error && <div role="alert" className="flex shrink-0 items-center gap-3 bg-destructive/10 px-5 py-2 text-xs text-destructive">{error}<Button size="sm" variant="outline" onClick={retryTaskStorage}>Retry</Button></div>}
    {invalid ? <WorkEmpty title="Location unavailable" description="Check its address, membership, or archived items in Settings." /> : section === "tasks" ? <WorkspaceTaskDetail state={state} id={selectedTask?.id ?? ""} onOpen={openTask} onClose={closeTask} fullPage /> : section === "home" ? <WorkspaceHome {...shared} /> : section === "my-work" ? <WorkspaceMyWork {...shared} /> : section === "inbox" ? <WorkspaceInbox {...shared} /> : section === "dashboards" ? <WorkspaceDashboards {...shared} /> : ["everything", "spaces", "folders", "lists"].includes(section) ? <WorkspaceWorkArea key={`${scope.id}-${state.actorId}`} {...shared} onCreate={create} /> : <WorkEmpty title={title} description="Workspace management is being connected." />}
    {section !== "tasks" && <Sheet open={!!taskId} onOpenChange={(open) => !open && closeTask()}><SheetContent side="right" showCloseButton={false} className="w-full! max-w-none! gap-0 p-0 sm:w-[94vw]! xl:w-[1120px]!"><SheetTitle className="sr-only">Task details</SheetTitle><SheetDescription className="sr-only">Task properties, subtasks, checklists, and conversation.</SheetDescription><WorkspaceTaskDetail state={state} id={selectedTask?.id ?? ""} onOpen={openTask} onClose={closeTask} /></SheetContent></Sheet>}
    {(creating || urlCreate) && <QuickTask state={state} scope={scope} {...creating} listId={creating?.listId ?? params.get("list") ?? (scope.kind === "list" ? scope.id : undefined)} parentId={urlCreate ? params.get("parent") ?? undefined : undefined} onClose={closeCreate} onCreated={openTask} />}
  </WorkspaceShell>;
}
export function LegacyWorkspaceRedirect() {
  const { workspace: state, ready, error } = useTaskWorkspace(); const pathname = usePathname(); const params = useSearchParams(); const router = useRouter();
  useEffect(() => {
    if (!state) return;
    const parts = pathname.split("/").filter(Boolean);
    const task = parts[0] === "tasks" && parts[1] && parts[1] !== "new" ? state.tasks.find((t) => t.id === parts[1]) : undefined;
    const parent = params.get("parentId") ?? params.get("parent");
    const parentTask = state.tasks.find((t) => t.id === parent);
    const project = state.lists.find((l) => l.id === (task?.listId ?? (parts[0] === "projects" && parts[1] !== "new" ? parts[1] : null) ?? params.get("projectId") ?? params.get("project") ?? parentTask?.listId));
    const wid = project?.workspaceId ?? state.activeWorkspaceId;
    const base = `/workspaces/${wid}`;
    let target = parts[0] === "my-tasks" ? `${base}/my-work` : parts[0] === "projects" && parts[1] === "templates" ? `${base}/templates` : task ? `${base}/tasks/${task.id}` : project ? nodeHref(project) : `${base}/everything`;
    const p = new URLSearchParams();
    if (parts[0] === "tasks" && parts[1] === "new") { p.set("create", "task"); if (project) p.set("list", project.id); if (parent) p.set("parent", parent); }
    if (parts[0] === "projects" && parts[1] === "new") { target = `${base}/settings`; p.set("create", "list"); }
    if (parts[0] === "projects" && parts[2] === "edit" && project) { target = `${base}/settings`; p.set("edit", project.id); }
    if (parts[0] === "tasks" && parts[1] && !["new"].includes(parts[1]) && !task) target = `${base}/tasks/${encodeURIComponent(parts[1])}`;
    router.replace(`${target}${p.size ? `?${p}` : ""}`);
  }, [state, pathname, params, router]);
  if (error && !state) return <WorkspaceRecovery error={error} />;
  return ready && !state ? <WorkEmpty title="Workspace unavailable" /> : <WorkspaceLoading />;
}
