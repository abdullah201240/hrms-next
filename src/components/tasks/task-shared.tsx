"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Database, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand, useTaskWorkspace } from "@/hooks/use-task-workspace";
import { resetTaskDemo, retryTaskStorage } from "@/lib/tasks/store";
import { blockedBy, formatTaskDate, fromLocalInput, isOverdue, personName, toLocalInput } from "@/lib/tasks/domain";
import { WORKSPACE_TIMEZONES, type TaskWorkspace, type WorkTask } from "@/lib/tasks/types";

export function TaskLink({ href, children, variant = "outline" }: { href: string; children: ReactNode; variant?: "outline" | "default" | "ghost" }) {
  return <Button variant={variant} nativeButton={false} render={<Link href={href} />}>{children}</Button>;
}
export function TaskField({ label, id, children, hint }: { label: string; id?: string; children: ReactNode; hint?: string }) {
  return <div className="min-w-0 space-y-2"><Label htmlFor={id}>{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>;
}
export function TaskDateInput({ id, value, onChange, timezone }: { id: string; value: string | null; onChange: (value: string | null) => void; timezone: string }) {
  return <Input id={id} type="datetime-local" value={toLocalInput(value, timezone)} onChange={(e) => {
    try { onChange(fromLocalInput(e.target.value, timezone)); } catch (error) { toast.error((error as Error).message); }
  }} />;
}
export function personOptions(state: TaskWorkspace, ids?: string[]) {
  return state.people.filter((p) => !ids || ids.includes(p.id)).map((p) => ({ value: p.id, label: `${p.name} · ${p.employeeCode}` }));
}
export function TaskEmpty({ title = "Nothing here yet", description = "Create a task to get your team started.", children }: { title?: string; description?: string; children?: ReactNode }) {
  return <Card><CardContent className="space-y-3 py-12 text-center"><h2 className="text-lg font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p>{children}</CardContent></Card>;
}
export function TaskBoundary({ children }: { children: (state: TaskWorkspace) => ReactNode }) {
  const { workspace, ready, error } = useTaskWorkspace();
  const [reset, setReset] = useState(false);
  return <div className="space-y-6">
    <Card className="border-primary/10 bg-primary/5"><CardContent className="flex flex-wrap items-center gap-3 py-3">
      <Database className="size-4 text-primary" /><div className="min-w-40 flex-1"><p className="text-sm font-medium">Task workspace · Demo</p><p className="text-xs text-muted-foreground">Mock data saved in this browser only. No backend or real permissions.</p></div>
      {workspace && <><div className="w-full sm:w-60"><SearchSelect value={workspace.actorId} onChange={(id) => id && runTaskCommand({ kind: "actor", id })} options={personOptions(workspace)} placeholder="Demo employee" /></div><div className="w-full sm:w-48"><SearchSelect value={workspace.timezone} onChange={(timezone) => timezone && runTaskCommand({ kind: "timezone", timezone })} options={WORKSPACE_TIMEZONES} placeholder="Workspace timezone" /></div></>}
      <Button variant="ghost" size="sm" onClick={() => setReset(true)}><RotateCcw className="size-3.5" /> Reset demo</Button>
    </CardContent></Card>
    {error && <Card className="border-destructive"><CardContent className="space-y-3 py-4" role="alert"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={retryTaskStorage}>Retry storage</Button></CardContent></Card>}
    {!ready ? <div role="status" aria-label="Loading task workspace" className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-80 w-full" /></div> : workspace ? <div key={workspace.actorId}>{children(workspace)}</div> : <TaskEmpty title="Task demo unavailable" description="Retry browser storage or reset the demo to continue." />}
    <Dialog open={reset} onOpenChange={setReset}><DialogContent><DialogHeader><DialogTitle>Reset the task demo?</DialogTitle><DialogDescription>This replaces local tasks, projects, templates, comments, and notification read state with fresh sample data. Other HR screens are not changed.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setReset(false)}>Keep my demo</Button><Button variant="destructive" onClick={() => { try { resetTaskDemo(); setReset(false); toast.success("Task demo reset"); } catch (error) { toast.error((error as Error).message); } }}>Reset demo data</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
const statusClasses: Record<string, string> = {
  Open: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Working: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Pending Review": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};
export function TaskStatusBadge({ status }: { status: string }) { return <Badge variant="secondary" className={statusClasses[status]}>{status}</Badge>; }
export function TaskPriorityBadge({ priority }: { priority: string }) {
  return <Badge variant="outline" className={priority === "Urgent" ? "text-rose-600 dark:text-rose-400" : priority === "High" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>{priority}</Badge>;
}
export function TaskSignals({ state, task, now }: { state: TaskWorkspace; task: WorkTask; now: Date }) {
  return <>{isOverdue(task, now) && <Badge variant="secondary" className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Overdue</Badge>}{blockedBy(state, task).length > 0 && <Badge variant="secondary">Blocked</Badge>}{task.archived && <Badge variant="outline">Archived</Badge>}</>;
}
export function TaskAssignees({ state, ids }: { state: TaskWorkspace; ids: string[] }) {
  if (!ids.length) return <span className="text-xs text-muted-foreground">Unassigned</span>;
  return <div className="flex items-center -space-x-1.5" aria-label={ids.map((id) => personName(state, id)).join(", ")}>{ids.slice(0, 3).map((id) => <Avatar key={id} className="size-7 border-2 border-background" title={personName(state, id)}><AvatarFallback className="bg-primary/10 text-[10px] text-primary">{personName(state, id).split(" ").map((name) => name[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>)}{ids.length > 3 && <Badge variant="secondary">+{ids.length - 3}</Badge>}</div>;
}
export function TaskDue({ state, task, now }: { state: TaskWorkspace; task: WorkTask; now: Date }) {
  return <span className={isOverdue(task, now) ? "text-xs text-rose-600 dark:text-rose-400" : "text-xs text-muted-foreground"}>{formatTaskDate(task.dueAt, state.timezone)}</span>;
}
