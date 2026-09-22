"use client";

import { useState } from "react";
import { ArrowUp, ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { canEditTask, emptyTask, isClosed } from "@/lib/tasks/domain";
import { TASK_STATUSES, type TaskProject, type TaskStatus, type TaskWorkspace, type WorkTask } from "@/lib/tasks/types";
import { TaskAssignees, TaskDue, TaskPriorityBadge, TaskSignals, TaskStatusBadge } from "./task-shared";

export function TaskBoard({ state, tasks, project, now, onOpen }: { state: TaskWorkspace; tasks: WorkTask[]; project?: TaskProject; now: Date; onOpen: (id: string) => void }) {
  const [folds, setFolds] = useState<Record<string, boolean>>({});
  const [cancelId, setCancelId] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const columns = project ? project.stages : TASK_STATUSES.map((status) => ({ id: status, name: status, folded: false }));
  const move = (id: string, column: string, beforeId?: string) => {
    if (!project && column === "Cancelled") { setCancelId(id); return; }
    const command = project ? { kind: "move" as const, id, stageId: column, beforeId } : { kind: "transition" as const, ids: [id], status: column as TaskStatus };
    if (runTaskCommand(command, project ? "Board stage updated" : "Task status updated")) setAnnouncement(`Task moved to ${columns.find((item) => item.id === column)?.name}`);
  };
  return <div className="space-y-3">
    <p className="text-xs text-muted-foreground">{project ? "Project stages · Drag to move or reorder. Use each card’s Move picker with keyboard or touch. Stage movement does not change task status." : "All projects · Columns show lifecycle status. Select a project to use its custom stages. Workflow rules apply to every move."}</p>
    <p className="sr-only" aria-live="polite">{announcement}</p>
    <div className="flex items-start gap-4 overflow-x-auto pb-5" aria-label="Task board">
      {columns.map((column) => {
        const items = tasks.filter((task) => project ? task.stageId === column.id : task.status === column.id).sort((a, b) => a.position - b.position);
        const folded = folds[column.id] ?? column.folded;
        return <section key={column.id} aria-label={`${column.name} column`} className="w-72 shrink-0 space-y-3 rounded-xl bg-muted/50 p-3"
          onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("application/x-hrms-task"); if (tasks.some((task) => task.id === id)) move(id, column.id); }}>
          <div className="flex items-center justify-between"><Button variant="ghost" size="sm" className="gap-2" aria-expanded={!folded} onClick={() => setFolds({ ...folds, [column.id]: !folded })}>{folded ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}{column.name}<Badge variant="secondary">{items.length}</Badge></Button></div>
          {!folded && <>
            {items.map((task, index) => {
              const editable = canEditTask(state, task) && !isClosed(task) && !task.archived;
              return <Card key={task.id} className="gap-0 py-0" draggable={editable} onDragStart={(event) => { event.dataTransfer.setData("application/x-hrms-task", task.id); event.dataTransfer.effectAllowed = "move"; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (!project) return; event.preventDefault(); event.stopPropagation(); const id = event.dataTransfer.getData("application/x-hrms-task"); if (id !== task.id && tasks.some((item) => item.id === id)) move(id, column.id, task.id); }}>
                <CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-medium text-muted-foreground">{task.code}</span><div className="flex items-center gap-1"><TaskPriorityBadge priority={task.priority} />{editable && <GripVertical aria-hidden className="size-3.5 text-muted-foreground" />}</div></div>
                  <Button variant="link" className="h-auto w-full justify-start whitespace-normal p-0 text-left text-sm font-semibold text-foreground" onClick={() => onOpen(task.id)}>{task.subject}</Button>
                  {!project && <p className="text-xs text-muted-foreground">{state.projects.find((item) => item.id === task.projectId)?.name}</p>}
                  <div className="flex flex-wrap gap-1.5">{project && <TaskStatusBadge status={task.status} />}<TaskSignals state={state} task={task} now={now} />{task.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}</div>
                  <div className="flex items-center justify-between"><TaskAssignees state={state} ids={task.assigneeIds} /><TaskDue state={state} task={task} now={now} /></div>
                  <div className="flex items-center gap-1 border-t pt-3"><div className="min-w-0 flex-1"><SearchSelect disabled={project ? !editable : task.archived} value={project ? task.stageId : task.status} options={columns.map((item) => ({ value: item.id, label: item.name }))} placeholder={`Move ${task.code}`} onChange={(value) => value && move(task.id, value)} /></div>{project && <Button variant="ghost" size="icon-sm" aria-label={`Move ${task.code} up`} disabled={!editable || index === 0} onClick={() => move(task.id, column.id, items[index - 1].id)}><ArrowUp className="size-4" /></Button>}</div>
                </CardContent>
              </Card>;
            })}
            {!items.length && <p className="border border-dashed p-5 text-center text-xs text-muted-foreground">No tasks in this column</p>}
            {project && <BoardQuickAdd state={state} project={project} stageId={column.id} />}
          </>}
        </section>;
      })}
    </div>
    <Dialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId("")}><DialogContent><DialogHeader><DialogTitle>Cancel this task?</DialogTitle><DialogDescription>Dependencies will treat this task as resolved. Only a demo manager can cancel work.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setCancelId("")}>Keep task</Button><Button onClick={() => { if (runTaskCommand({ kind: "transition", ids: [cancelId], status: "Cancelled" }, "Task cancelled")) setCancelId(""); }}>Cancel task</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
function BoardQuickAdd({ state, project, stageId }: { state: TaskWorkspace; project: TaskProject; stageId: string }) {
  const [adding, setAdding] = useState(false);
  const [subject, setSubject] = useState("");
  if (!adding) return <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setAdding(true)}><Plus className="size-4" /> Add task</Button>;
  return <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); if (runTaskCommand({ kind: "save-task", id: crypto.randomUUID(), draft: { ...emptyTask(project), subject, stageId, assigneeIds: project.memberIds.includes(state.actorId) ? [state.actorId] : [] } }, "Task created")) { setSubject(""); setAdding(false); } }}><Input aria-label="Quick task subject" autoFocus required maxLength={255} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Task subject" /><div className="flex gap-2"><Button size="sm" type="submit">Add</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div></form>;
}
