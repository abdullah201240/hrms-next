"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, ArrowUpRight, CheckCheck, ClipboardList, GitBranch, MessageSquare, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand, useTaskClock } from "@/hooks/use-task-workspace";
import { applyTaskCommand, blockedBy, canEditTask, canManage, canViewProject, formatTaskDate, isClosed, personName } from "@/lib/tasks/domain";
import { TASK_STATUSES, type TaskCommand, type TaskStatus, type TaskWorkspace, type WorkTask } from "@/lib/tasks/types";
import { TaskAssignees, TaskBoundary, TaskEmpty, TaskField, TaskLink, TaskPriorityBadge, TaskSignals, TaskStatusBadge } from "./task-shared";

export function TaskDetailPage({ id }: { id: string }) {
  return <TaskBoundary>{(state) => <TaskDetail state={state} id={id} />}</TaskBoundary>;
}
export function TaskDetail({ state, id, compact = false }: { state: TaskWorkspace; id: string; compact?: boolean }) {
  const now = useTaskClock();
  const [comment, setComment] = useState("");
  const [confirm, setConfirm] = useState<TaskCommand | null>(null);
  const task = state.tasks.find((item) => item.id === id);
  const project = state.projects.find((item) => item.id === task?.projectId);
  if (!task || !project) return <TaskEmpty title="Task not found" description="It may belong to a different browser demo, or the demo was reset."><TaskLink href="/tasks">All tasks</TaskLink></TaskEmpty>;
  if (!canViewProject(state, project)) return <TaskEmpty title="Project access required" description="Switch to a demo project member or manager to view this task." />;
  const editable = canEditTask(state, task) && !isClosed(task) && !task.archived;
  const manager = canManage(state, project);
  const subtasks = state.tasks.filter((child) => child.parentId === task.id);
  const dependencies = state.tasks.filter((item) => task.dependencyIds.includes(item.id));
  const dependents = state.tasks.filter((item) => item.dependencyIds.includes(task.id));
  const comments = state.comments.filter((item) => item.taskId === task.id);
  const history = state.activities.filter((item) => item.taskId === task.id).toReversed();
  const actions = TASK_STATUSES.filter((status) => status !== task.status).map((status) => {
    let reason = "";
    try { applyTaskCommand(state, { kind: "transition", ids: [task.id], status }, { now: now.toISOString(), newId: () => "preview" }); }
    catch (error) { reason = (error as Error).message; }
    return { status, reason };
  });
  const label = (status: TaskStatus) => status === "Open" && isClosed(task) ? "Reopen" : status === "Working" ? task.status === "Pending Review" ? "Request changes" : "Start work" : status === "Pending Review" ? "Request review" : status === "Completed" ? "Complete task" : status === "Cancelled" ? "Cancel task" : "Return to Open";
  const taskRows = (tasks: WorkTask[], empty: string) => tasks.length ? <div className="divide-y">{tasks.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><Link href={`/tasks/${item.id}`} className="min-w-0 flex-1 text-sm font-medium hover:text-primary"><span className="mr-2 text-xs text-muted-foreground">{item.code}</span>{item.subject}</Link><TaskStatusBadge status={item.status} /></div>)}</div> : <p className="py-5 text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-6">
    {!compact && <PageHeader title={task.subject} icon={ClipboardList} description={`${task.code} · ${project.name}`} backHref="/tasks"><TaskLink href={`/projects/${project.id}`}>View project</TaskLink>{editable && <TaskLink href={`/tasks/${id}/edit`}><Pencil className="size-4" /> Edit task</TaskLink>}</PageHeader>}
    {compact && <div className="flex flex-wrap gap-2"><TaskLink href={`/tasks/${id}`}><ArrowUpRight className="size-4" /> Open full page</TaskLink>{editable && <TaskLink href={`/tasks/${id}/edit`}>Edit task</TaskLink>}</div>}
    <div className="flex flex-wrap items-center gap-2"><TaskStatusBadge status={task.status} /><TaskPriorityBadge priority={task.priority} /><TaskSignals state={state} task={task} now={now} />{task.isGroup && <Badge variant="outline"><GitBranch className="size-3" /> Group task</Badge>}{task.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
    <Card><CardContent className="space-y-4 py-4"><div className="flex flex-wrap gap-2">{actions.map(({ status, reason }) => <div key={status} title={reason || label(status)}><Button size="sm" variant={status === "Completed" ? "default" : "outline"} disabled={!!reason} onClick={() => status === "Cancelled" ? setConfirm({ kind: "transition", ids: [id], status }) : runTaskCommand({ kind: "transition", ids: [id], status }, `Task ${status.toLowerCase()}`)}>{status === "Completed" && <CheckCheck className="size-4" />}{label(status)}</Button></div>)}{manager && isClosed(task) && <Button size="sm" variant="ghost" onClick={() => setConfirm({ kind: "archive", id, archived: !task.archived })}><Archive className="size-4" /> {task.archived ? "Unarchive" : "Archive"}</Button>}</div>
      {blockedBy(state, task).length > 0 && <p className="text-xs text-amber-700 dark:text-amber-300">Blocked: complete or cancel {blockedBy(state, task).map((item) => item.code).join(", ")} before starting.</p>}
      <p className="text-xs text-muted-foreground">{task.reviewRequired ? "Reviewer approval is required. " : "Review is optional. "}Unavailable actions follow the demo workflow rules; hover for the reason.</p>
    </CardContent></Card>
    <Tabs defaultValue="overview"><TabsList className="h-auto flex-wrap"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="subtasks">Subtasks ({subtasks.length})</TabsTrigger><TabsTrigger value="dependencies">Dependencies ({dependencies.length})</TabsTrigger><TabsTrigger value="activity">Activity & comments</TabsTrigger></TabsList>
      <TabsContent value="overview" className="space-y-5 pt-4"><div className={compact ? "space-y-5" : "grid gap-5 lg:grid-cols-[1.6fr_1fr]"}>
        <Card><CardHeader><CardTitle>Description</CardTitle></CardHeader><CardContent className="space-y-6"><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{task.description || "No description yet. Add context from Edit task."}</p>{task.parentId && <TaskLink href={`/tasks/${task.parentId}`}>View parent task</TaskLink>}<div className="space-y-2"><div className="flex justify-between text-sm"><span>Progress</span><span>{task.progress}%</span></div><Progress value={task.progress} aria-label="Task progress" /></div><p className="text-xs text-muted-foreground">Estimate: {task.estimateHours}h · Actual time tracking will be added later.</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Task information</CardTitle></CardHeader><CardContent className="space-y-5 text-sm">
          <TaskField label="Board stage" hint="Moving a stage does not change lifecycle status."><SearchSelect disabled={!editable} value={task.stageId} options={project.stages.map((stage) => ({ value: stage.id, label: stage.name }))} placeholder="Move to stage" onChange={(stageId) => stageId && runTaskCommand({ kind: "move", id, stageId }, "Task moved")} /></TaskField>
          <div className="space-y-2"><p className="text-muted-foreground">Assigned to</p><TaskAssignees state={state} ids={task.assigneeIds} /><p>{task.assigneeIds.map((person) => personName(state, person)).join(", ") || "Unassigned"}</p></div>
          <dl className="grid grid-cols-2 gap-3"><dt className="text-muted-foreground">Reviewer</dt><dd>{personName(state, task.reviewerId)}</dd><dt className="text-muted-foreground">Starts</dt><dd>{formatTaskDate(task.startAt, state.timezone, true)}</dd><dt className="text-muted-foreground">Due</dt><dd>{formatTaskDate(task.dueAt, state.timezone, true)}</dd><dt className="text-muted-foreground">Task type</dt><dd>{task.type}</dd><dt className="text-muted-foreground">Created by</dt><dd>{personName(state, task.createdBy)}</dd>{task.completedAt && <><dt className="text-muted-foreground">Completed</dt><dd>{formatTaskDate(task.completedAt, state.timezone, true)} by {personName(state, task.completedBy ?? "")}</dd></>}</dl><p className="text-xs text-muted-foreground">Timezone: {state.timezone}</p>
        </CardContent></Card>
      </div></TabsContent>
      <TabsContent value="subtasks" className="pt-4"><Card><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><CardTitle>Subtasks</CardTitle>{manager && editable && task.isGroup && <TaskLink href={`/tasks/new?project=${project.id}&parent=${id}`}><Plus className="size-4" /> Add subtask</TaskLink>}</CardHeader><CardContent>{taskRows(subtasks, task.isGroup ? "No subtasks yet." : "Enable Group task in Edit task to add subtasks.")}</CardContent></Card></TabsContent>
      <TabsContent value="dependencies" className="space-y-5 pt-4"><Card><CardHeader><CardTitle>Waiting on</CardTitle></CardHeader><CardContent>{taskRows(dependencies, "No dependencies. This task is not waiting on other work.")}</CardContent></Card><Card><CardHeader><CardTitle>Unblocks</CardTitle></CardHeader><CardContent>{taskRows(dependents, "No other tasks depend on this task.")}</CardContent></Card>{editable && manager && <TaskLink href={`/tasks/${id}/edit`}>Manage dependencies</TaskLink>}</TabsContent>
      <TabsContent value="activity" className="space-y-5 pt-4"><Card><CardHeader><CardTitle><MessageSquare className="mr-2 inline size-4" /> Team conversation</CardTitle></CardHeader><CardContent className="space-y-5">
        {comments.map((item) => <div key={item.id} className="space-y-2 border-b pb-4"><p className="text-sm font-medium">{personName(state, item.actorId)} <span className="ml-2 text-xs font-normal text-muted-foreground">{formatTaskDate(item.at, state.timezone, true)}</span></p><p className="whitespace-pre-wrap break-words text-sm">{item.body}</p></div>)}
        {!comments.length && <p className="text-sm text-muted-foreground">Start the conversation with your team.</p>}
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (runTaskCommand({ kind: "comment", taskId: id, body: comment }, "Comment added")) setComment(""); }}><Textarea aria-label="Write a comment" required maxLength={5000} value={comment} placeholder="Write a comment…" onChange={(event) => setComment(event.target.value)} /><Button type="submit" disabled={!comment.trim()}>Post comment</Button></form>
      </CardContent></Card><Card><CardHeader><CardTitle>Activity history</CardTitle></CardHeader><CardContent><ol className="space-y-4">{history.map((item) => <li key={item.id} className="border-l-2 border-primary/20 pl-4"><p className="text-sm">{item.message}</p><p className="mt-1 text-xs text-muted-foreground">{personName(state, item.actorId)} · {formatTaskDate(item.at, state.timezone, true)}</p></li>)}</ol></CardContent></Card></TabsContent>
    </Tabs>
    <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>Confirm task change</DialogTitle><DialogDescription>{confirm?.kind === "archive" ? confirm.archived ? "Archive this closed task? Its relationships and history will be kept." : "Restore this task to the closed task views?" : "Cancel this task? Dependencies will treat it as resolved."}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirm(null)}>Go back</Button><Button onClick={() => { if (confirm && runTaskCommand(confirm, "Task updated")) setConfirm(null); }}>Confirm</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
