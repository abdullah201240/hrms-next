"use client";

import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { CalendarDays, ChevronLeft, ChevronRight, Diamond, GitBranch, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchSelect } from "@/components/shared/search-select";
import { canEditTask, dayKey, fromLocalInput, isClosed, toLocalInput } from "@/lib/tasks/domain";
import { taskDraft, taskStatus, workProgress } from "@/lib/tasks/workspace-model";
import type { WorkScope, WorkView, WorkspaceState, WorkspaceTask } from "@/lib/tasks/workspace-types";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { WorkLabel, WorkModal } from "./common";
import { TaskDateInput } from "../task-shared";
import { cn } from "@/lib/utils";

const dayNumber = (key: string) => Date.parse(`${key}T00:00:00Z`) / 86400000;
const shiftDay = (key: string, days: number) => new Date((dayNumber(key) + days) * 86400000).toISOString().slice(0, 10);
function shiftTime(value: string | null, days: number, timezone: string) {
  if (!value) return null;
  const local = toLocalInput(value, timezone);
  return fromLocalInput(`${shiftDay(local.slice(0, 10), days)}T${local.slice(11)}`, timezone);
}
export function WorkspaceSchedule({ state, scope, view, tasks, onOpen, onCreate }: { state: WorkspaceState; scope: WorkScope; view: WorkView; tasks: WorkspaceTask[]; onOpen: (id: string) => void; onCreate: (listId?: string, statusId?: string, dueAt?: string) => void }) {
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;
  const today = dayKey(new Date(), timezone);
  const [cursor, setCursor] = useState(today);
  const [scale, setScale] = useState("month");
  const [editing, setEditing] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }), useSensor(KeyboardSensor));
  const monthStart = `${cursor.slice(0, 7)}-01`;
  const weekday = (key: string) => (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start = scale === "week" ? shiftDay(cursor, -weekday(cursor)) : view.type === "calendar" ? shiftDay(monthStart, -weekday(monthStart)) : monthStart;
  const count = scale === "week" ? 7 : view.type === "calendar" ? 42 : new Date(Date.UTC(Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7)), 0)).getUTCDate();
  const days = Array.from({ length: count }, (_, i) => shiftDay(start, i));
  const navigate = (delta: number) => { if (scale === "week") setCursor(shiftDay(cursor, 7 * delta)); else { const d = new Date(`${monthStart}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + delta); setCursor(d.toISOString().slice(0, 10)); } };
  const inDay = (task: WorkspaceTask, day: string) => { const first = task.startAt ?? task.dueAt, last = task.dueAt ?? task.startAt; return !!first && !!last && day >= dayKey(first, timezone) && day <= dayKey(last, timezone); };
  const drop = (e: DragEndEvent) => {
    setDragging(null); if (!e.over) return;
    const id = e.active.data.current?.taskId as string; const day = e.over.data.current?.day as string;
    const task = tasks.find((t) => t.id === id); if (!task || !day) return;
    try {
      const anchor = e.active.data.current?.day as string | undefined;
      const delta = anchor ? dayNumber(day) - dayNumber(anchor) : 0;
      const patch = !task.startAt && !task.dueAt ? { dueAt: fromLocalInput(`${day}T17:00`, timezone) } : { startAt: shiftTime(task.startAt, delta, timezone), dueAt: shiftTime(task.dueAt, delta, timezone) };
      if (!runTaskCommand({ kind: "work-task", id, draft: { ...taskDraft(task), ...patch } }, "Task rescheduled")) setEditing(id);
    } catch (error) { toast.error((error as Error).message); setEditing(id); }
  };
  const edited = tasks.find((t) => t.id === editing);
  const unscheduled = tasks.filter((t) => !t.startAt && !t.dueAt);
  return <div className="flex h-full min-h-0 flex-col"><div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-5 py-3"><Button variant="outline" size="sm" onClick={() => setCursor(today)}>Today</Button><Button variant="ghost" size="icon-sm" aria-label="Previous period" onClick={() => navigate(-1)}><ChevronLeft className="size-4" /></Button><Button variant="ghost" size="icon-sm" aria-label="Next period" onClick={() => navigate(1)}><ChevronRight className="size-4" /></Button><h2 className="text-sm font-semibold">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${cursor}T12:00:00Z`))}</h2><div className="ml-auto w-32"><SearchSelect value={scale} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }]} onChange={(v) => v && setScale(v)} /></div><span className="text-[10px] text-muted-foreground">{timezone}</span></div>
    {view.type === "calendar" ? <DndContext sensors={sensors} onDragStart={(e) => setDragging(String(e.active.data.current?.taskId))} onDragCancel={() => setDragging(null)} onDragEnd={drop}><div className="min-h-0 flex-1 overflow-auto"><div className="grid min-w-[770px] grid-cols-7">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="sticky top-0 z-10 border-b bg-card px-3 py-2 text-center text-xs text-muted-foreground">{d}</div>)}{days.map((day) => <CalendarDay key={day} day={day} today={today} muted={day.slice(0, 7) !== cursor.slice(0, 7)} onCreate={() => { try { onCreate(scope.kind === "list" ? scope.id : undefined, undefined, fromLocalInput(`${day}T17:00`, timezone)!); } catch (e) { toast.error((e as Error).message); } }}>{tasks.filter((t) => inDay(t, day)).map((task) => <CalendarTask key={task.id} task={task} state={state} day={day} onOpen={() => onOpen(task.id)} onSchedule={() => setEditing(task.id)} />)}</CalendarDay>)}</div></div><div className="max-h-44 shrink-0 overflow-auto border-t px-5 py-3"><h3 className="mb-2 text-xs font-semibold">Unscheduled <Badge variant="secondary">{unscheduled.length}</Badge></h3><div className="flex flex-wrap gap-2">{unscheduled.map((task) => <div key={task.id} className="w-60"><CalendarTask task={task} state={state} onOpen={() => onOpen(task.id)} onSchedule={() => setEditing(task.id)} /></div>)}{!unscheduled.length && <span className="text-xs text-muted-foreground">All work has a date.</span>}</div></div><DragOverlay>{dragging && <Badge className="max-w-64 truncate">{tasks.find((t) => t.id === dragging)?.subject}</Badge>}</DragOverlay></DndContext> : <div className="min-h-0 flex-1 overflow-auto"><div className="relative" style={{ minWidth: 280 + days.length * (scale === "week" ? 120 : 42) }}><div className="sticky top-0 z-20 flex h-11 border-b bg-card"><div className="sticky left-0 z-30 w-64 shrink-0 bg-card px-5 py-3 text-xs font-medium">List / Task</div>{days.map((d) => <div key={d} className={cn("flex-1 border-l py-3 text-center text-[10px]", d === today && "bg-primary/10 text-primary")}>{Number(d.slice(8))}</div>)}</div>{state.lists.filter((l) => tasks.some((t) => t.listId === l.id)).map((list) => <section key={list.id}><div className="sticky left-0 flex h-10 items-center gap-2 border-b bg-muted px-4 text-xs font-semibold">{list.name}<Badge variant="secondary">{workProgress(tasks.filter((t) => t.listId === list.id)).percent}%</Badge></div>{tasks.filter((t) => t.listId === list.id).map((task) => { const activeDays = days.filter((d) => inDay(task, d)); const left = activeDays.length ? days.indexOf(activeDays[0]) : -1; const color = taskStatus(state, task)?.color; const progress = tasks.some((t) => t.parentId === task.id) ? workProgress(tasks.filter((t) => t.parentId === task.id)).percent : task.progress; return <div className="flex h-12 border-b" key={task.id}><div className="sticky left-0 z-10 flex w-64 shrink-0 items-center gap-1 bg-card px-3"><Button variant="link" className="min-w-0 flex-1 justify-start truncate px-0 text-xs text-foreground" onClick={() => onOpen(task.id)}>{task.subject}</Button><Button variant="ghost" size="icon-sm" aria-label={`Reschedule ${task.subject}`} onClick={() => setEditing(task.id)}><CalendarDays className="size-3" /></Button></div><div className="relative flex flex-1">{days.map((d) => <div key={d} className={cn("flex-1 border-l", d === today && "border-l-primary bg-primary/5")} />)}{left >= 0 && <Button variant="secondary" className="absolute top-2 h-7 justify-start overflow-hidden px-2 text-[10px]" style={{ left: `${left / count * 100}%`, width: `${activeDays.length / count * 100}%`, background: `${color}25`, color }} onClick={() => onOpen(task.id)}>{!task.startAt && <Diamond className="size-3 shrink-0" />}{task.dependencyIds.length > 0 && <GitBranch className="size-3 shrink-0" />}<span className="truncate">{task.subject} · {progress}%</span></Button>}{!task.startAt && !task.dueAt && <Button size="sm" variant="ghost" className="absolute left-3 top-1 text-xs text-muted-foreground" onClick={() => setEditing(task.id)}>Set dates</Button>}</div></div>; })}</section>)}</div></div>}
    {edited && <ScheduleDialog key={edited.id} state={state} task={edited} timezone={timezone} onClose={() => setEditing(null)} />}
  </div>;
}
function CalendarDay({ day, today, muted, children, onCreate }: { day: string; today: string; muted: boolean; children: React.ReactNode; onCreate: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: day, data: { day } });
  return <div ref={setNodeRef} className={cn("group min-h-36 space-y-1 border-b border-r px-1.5 py-2", muted && "bg-muted/40", isOver && "bg-primary/10 ring-1 ring-primary")}><div className="flex items-center justify-between px-1"><span className={cn("flex size-6 items-center justify-center rounded-full text-xs", day === today && "bg-primary font-semibold text-primary-foreground")}>{Number(day.slice(8))}</span><Button variant="ghost" size="icon-sm" className="size-5 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" aria-label={`Create task on ${day}`} onClick={onCreate}><Plus className="size-3" /></Button></div>{children}</div>;
}
function CalendarTask({ task, state, day, onOpen, onSchedule }: { task: WorkspaceTask; state: WorkspaceState; day?: string; onOpen: () => void; onSchedule: () => void }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `${task.id}:${day ?? "unscheduled"}`, data: { taskId: task.id, day }, disabled: !canEditTask(state, task) || isClosed(task) });
  const color = taskStatus(state, task)?.color;
  return <div ref={setNodeRef} className={cn("group/task flex items-center gap-0.5 border-l-2 px-1 py-0.5", isDragging && "opacity-30")} style={{ borderColor: color, background: `${color}12` }}><Button variant="ghost" size="icon-sm" className="size-4 shrink-0 touch-none" {...attributes} {...listeners} aria-label={`Drag ${task.subject}`}><GripVertical className="size-2.5" /></Button><Button variant="link" className="h-auto min-w-0 flex-1 justify-start truncate p-0 text-[10px] text-foreground" onClick={onOpen}>{task.subject}</Button><Button variant="ghost" size="icon-sm" className="size-5 shrink-0" aria-label={`Reschedule ${task.subject}`} onClick={onSchedule}><CalendarDays className="size-2.5" /></Button></div>;
}
function ScheduleDialog({ state, task, timezone, onClose }: { state: WorkspaceState; task: WorkspaceTask; timezone: string; onClose: () => void }) {
  const [start, setStart] = useState(task.startAt); const [due, setDue] = useState(task.dueAt);
  return <WorkModal title="Schedule task" description={`Dates use ${timezone}. Calendar moves preserve local clock time and shift both endpoints. Dependencies are not automatically scheduled.`} onClose={onClose}><p className="text-sm font-medium">{task.subject}</p><WorkLabel label="Start"><TaskDateInput id="schedule-start" value={start} timezone={timezone} onChange={setStart} /></WorkLabel><WorkLabel label="Due"><TaskDateInput id="schedule-due" value={due} timezone={timezone} onChange={setDue} /></WorkLabel><Button disabled={!canEditTask(state, task) || isClosed(task)} onClick={() => { if (runTaskCommand({ kind: "work-task", id: task.id, draft: { ...taskDraft(task), startAt: start, dueAt: due } }, "Schedule updated")) onClose(); }}>Save schedule</Button>{isClosed(task) && <p className="text-xs text-muted-foreground">Reopen this task before changing its schedule.</p>}</WorkModal>;
}
