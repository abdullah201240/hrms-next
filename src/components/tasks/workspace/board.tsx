"use client";

import { useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, sortableKeyboardCoordinates, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckCheck, ChevronDown, ChevronRight, GitBranch, GripVertical, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/shared/search-select";
import { canEditTask, formatTaskDate, isClosed, isOverdue } from "@/lib/tasks/domain";
import { groupsFor, selectTasks, statusesFor, taskDraft, taskGroup, type TaskGroup } from "@/lib/tasks/workspace-model";
import type { WorkScope, WorkView, WorkspaceCommand, WorkspaceState, WorkspaceTask } from "@/lib/tasks/workspace-types";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { WorkLabel, WorkMenu, WorkModal, WorkPeople, WorkPriority, WorkStatusBadge } from "./common";
import { TaskMoveDialog } from "./task-panel";
import { cn } from "@/lib/utils";

interface BoardProps {
  state: WorkspaceState; scope: WorkScope; view: WorkView; tasks: WorkspaceTask[];
  selected: Set<string>; onSelect: (ids: Set<string>) => void;
  onView: (view: WorkView) => void; onOpen: (id: string) => void;
  onCreate: (listId?: string, statusId?: string) => void;
}
export function WorkspaceBoard(props: BoardProps) {
  const { state, scope, view, tasks, selected, onSelect, onView, onOpen, onCreate } = props;
  const [dragging, setDragging] = useState<string | null>(null);
  const [move, setMove] = useState<{ ids: string[]; target: string; before?: string } | null>(null);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [moveLists, setMoveLists] = useState<string[]>([]);
  const [wipGroup, setWipGroup] = useState("");
  const [limit, setLimit] = useState(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const groups = groupsFor(state, scope, view.groupBy).sort((a, b) => { const ia = view.columnOrder.indexOf(a.id), ib = view.columnOrder.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
  const visible = view.subtasks === "separate" ? tasks : tasks.filter((t) => !t.parentId || !tasks.some((p) => p.id === t.parentId));
  const base = selectTasks(state, scope, { ...view, filters: [], showClosed: true });
  const lanes = view.swimlane === "none" ? [{ id: "all", name: "" }] : view.swimlane === "priority" ? ["Urgent", "High", "Medium", "Low"].map((name) => ({ id: name, name })) : state.lists.filter((l) => visible.some((t) => t.listId === l.id)).map((l) => ({ id: l.id, name: l.name }));
  const inLane = (t: WorkspaceTask, lane: string) => lane === "all" || (view.swimlane === "priority" ? t.priority === lane : t.listId === lane);
  const executeMove = (ids: string[], target: string, before?: string, explicit: Record<string, string> = {}) => {
    if (!target) return;
    const moving = state.tasks.filter((t) => ids.includes(t.id));
    if (view.groupBy === "list") { setMoveLists(ids); return; }
    const commands: WorkspaceCommand[] = [];
    if (view.groupBy === "status") {
      const statusIds: Record<string, string> = {};
      let needsChoice = false;
      for (const task of moving) {
        const options = statusesFor(state, task.listId).filter((s) => s.id === target || s.category === target);
        const choice = options.find((s) => s.id === explicit[task.id]) ?? (options.length === 1 ? options[0] : undefined);
        if (!choice) needsChoice = true; else statusIds[task.id] = choice.id;
      }
      if (needsChoice) { setMove({ ids, target, before }); return; }
      if (moving.some((t) => statusesFor(state, t.listId).find((s) => s.id === statusIds[t.id])?.category === "Cancelled") && !window.confirm(`Cancel ${ids.length} task(s)? Their dependencies will be treated as resolved.`)) return;
      commands.push({ kind: "work-status", ids, statusIds });
    } else if (view.groupBy === "priority") commands.push({ kind: "work-bulk", ids, patch: { priority: target as WorkspaceTask["priority"] } });
    else if (view.groupBy === "assignee") {
      if (target === "unassigned" && !window.confirm("Clear all assignees from the selected tasks?")) return;
      for (const task of moving) commands.push({ kind: "work-bulk", ids: [task.id], patch: { assigneeIds: target === "unassigned" ? [] : [target, ...task.assigneeIds.filter((p) => p !== target)] } });
    } else if (view.groupBy.startsWith("field:")) {
      const fieldId = view.groupBy.slice(6);
      for (const task of moving) commands.push({ kind: "work-task", id: task.id, draft: taskDraft(task), fields: { ...task.fields, [fieldId]: target === "unset" ? null : target } });
    }
    if (runTaskCommand({ kind: "work-batch", commands }, `${ids.length} task(s) moved`)) {
      if (view.sort === "manual") {
        const ordered = visible.filter((t) => !ids.includes(t.id)).map((t) => t.id);
        const index = before ? ordered.indexOf(before) : -1; ordered.splice(index < 0 ? ordered.length : index, 0, ...ids);
        onView({ ...view, ranks: { ...view.ranks, ...Object.fromEntries(ordered.map((id, i) => [id, i])) } });
      }
      setMove(null); setChoices({});
    }
  };
  const drop = (e: DragEndEvent) => {
    setDragging(null);
    if (!e.over || e.active.id === e.over.id) return;
    const from = e.active.data.current, to = e.over.data.current;
    if (from?.type === "column") {
      const target = to?.groupId;
      if (target) onView({ ...view, columnOrder: arrayMove(groups.map((g) => g.id), groups.findIndex((g) => g.id === from.groupId), groups.findIndex((g) => g.id === target)) });
      return;
    }
    if (from?.lane !== to?.lane) { toast.info("Use Move to another List or edit priority to change swimlanes."); return; }
    if (view.sort !== "manual" && from?.groupId === to?.groupId) { toast.info("Choose Manual sort to reorder cards."); return; }
    const ids = selected.has(String(e.active.id)) ? [...selected] : [String(e.active.id)];
    executeMove(ids, to?.groupId, to?.type === "task" ? String(e.over.id) : undefined);
  };
  const dragged = state.tasks.find((t) => t.id === dragging);
  return <><DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(e) => setDragging(String(e.active.id))} onDragEnd={drop} onDragCancel={() => setDragging(null)} accessibility={{ announcements: { onDragStart: ({ active }) => `Picked up ${state.tasks.find((t) => t.id === active.id)?.subject ?? "column"}`, onDragOver: ({ over }) => over ? `Over ${groups.find((g) => g.id === over.data.current?.groupId)?.name ?? "task"}` : "Outside a drop target", onDragCancel: () => "Move cancelled. No changes made.", onDragEnd: ({ over }) => over ? "Move requested. Workflow rules apply." : "Move cancelled." } }}>
    <div className="h-full min-h-0 overflow-auto px-5 pb-6 pt-4">
      {lanes.map((lane) => <section key={lane.id} className="mb-5">{lane.name && <h3 className="sticky left-0 mb-3 flex items-center gap-2 text-xs font-semibold">{lane.name}<Badge variant="secondary">{visible.filter((t) => inLane(t, lane.id)).length}</Badge></h3>}<div className="flex min-w-max items-start gap-3"><SortableContext items={groups.map((g) => `column:${lane.id}:${g.id}`)} strategy={horizontalListSortingStrategy}>{groups.map((group) => <BoardColumn key={group.id} group={group} lane={lane.id} view={view} count={visible.filter((t) => inLane(t, lane.id) && taskGroup(t, view.groupBy, groups) === group.id).length} total={base.filter((t) => !isClosed(t) && inLane(t, lane.id) && taskGroup(t, view.groupBy, groups) === group.id && (view.subtasks === "separate" || !t.parentId)).length} onFold={() => onView({ ...view, folded: view.folded.includes(group.id) ? view.folded.filter((id) => id !== group.id) : [...view.folded, group.id] })} onWip={() => { setWipGroup(group.id); setLimit(view.wip[group.id] ?? 0); }} onCreate={() => onCreate(scope.kind === "list" ? scope.id : undefined, view.groupBy === "status" && !["Open", "Working", "Pending Review", "Completed", "Cancelled"].includes(group.id) ? group.id : undefined)}>
        <SortableContext items={visible.filter((t) => inLane(t, lane.id) && taskGroup(t, view.groupBy, groups) === group.id).map((t) => t.id)} strategy={verticalListSortingStrategy}>{visible.filter((t) => inLane(t, lane.id) && taskGroup(t, view.groupBy, groups) === group.id).map((task, index, items) => <SortableCard key={task.id} task={task} state={state} view={view} groupId={group.id} lane={lane.id} selected={selected.has(task.id)} onSelect={() => { const next = new Set(selected); if (next.has(task.id)) next.delete(task.id); else next.add(task.id); onSelect(next); }} onOpen={() => onOpen(task.id)} onMove={() => setMove({ ids: selected.has(task.id) ? [...selected] : [task.id], target: "" })} onUp={index > 0 && view.sort === "manual" ? () => executeMove([task.id], group.id, items[index - 1].id) : undefined} />)}</SortableContext>
      </BoardColumn>)}</SortableContext></div></section>)}
    </div><DragOverlay>{dragged ? <Card className="w-72 rotate-2 border-primary/30 py-0"><CardContent className="p-4 text-sm font-medium">{dragged.subject}{selected.has(dragged.id) && selected.size > 1 && <Badge className="ml-2">+{selected.size - 1}</Badge>}</CardContent></Card> : null}</DragOverlay>
  </DndContext>
  {move && <WorkModal title={`Move ${move.ids.length} task(s)`} description="Choose a destination. Review and dependency rules apply equally to dragging and keyboard moves." onClose={() => { setMove(null); setChoices({}); }}><div className="space-y-4"><SearchSelect value={move.target} options={groups.map((g) => ({ value: g.id, label: g.name }))} onChange={(target) => { setMove({ ...move, target }); setChoices({}); }} placeholder="Destination column" />{view.groupBy === "status" && move.target && move.ids.map((id) => { const t = state.tasks.find((t) => t.id === id)!; const options = statusesFor(state, t.listId).filter((s) => s.id === move.target || s.category === move.target); return options.length !== 1 ? <WorkLabel label={t.subject} key={id}><SearchSelect value={choices[id] ?? ""} options={options.map((s) => ({ value: s.id, label: s.name }))} onChange={(value) => setChoices({ ...choices, [id]: value })} placeholder="Choose a status for this List" /></WorkLabel> : null; })}<Button className="w-full" disabled={!move.target} onClick={() => executeMove(move.ids, move.target, move.before, choices)}>Move tasks</Button></div></WorkModal>}
  {!!moveLists.length && <TaskMoveDialog state={state} ids={moveLists} onClose={() => setMoveLists([])} />}
  {wipGroup && <WorkModal title="Column work-in-progress limit" description="An advisory warning, counted before filters. Set 0 for no limit." onClose={() => setWipGroup("")}><Input type="number" min={0} aria-label="WIP limit" value={limit} onChange={(e) => setLimit(Math.max(0, Number(e.target.value)))} /><Button onClick={() => { onView({ ...view, wip: { ...view.wip, [wipGroup]: limit } }); setWipGroup(""); }}>Apply to view</Button></WorkModal>}
  </>;
}
function BoardColumn({ group, lane, view, count, total, children, onFold, onWip, onCreate }: { group: TaskGroup; lane: string; view: WorkView; count: number; total: number; children: React.ReactNode; onFold: () => void; onWip: () => void; onCreate: () => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isOver } = useSortable({ id: `column:${lane}:${group.id}`, data: { type: "column", groupId: group.id, lane } });
  const folded = view.folded.includes(group.id);
  const overLimit = !!view.wip[group.id] && total > view.wip[group.id];
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("shrink-0 rounded-xl bg-muted/65 pb-2", folded ? "w-12" : "w-[285px]", isOver && "ring-1 ring-primary/40")}>
    <div className={cn("sticky top-0 z-10 mb-2 flex items-center gap-1 bg-muted px-2 py-2", overLimit && "bg-amber-500/10", folded && "flex-col")}><Button size="icon-sm" variant="ghost" aria-label={`${folded ? "Expand" : "Collapse"} ${group.name}`} onClick={onFold}>{folded ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}</Button>{!folded ? <><Badge className="max-w-40 truncate border-0 text-[10px] font-semibold uppercase tracking-wide" style={{ color: group.color, background: `${group.color}18` }}>{group.name}</Badge><span className="px-1 text-xs text-muted-foreground">{count}{view.wip[group.id] ? ` / ${view.wip[group.id]}` : ""}</span><Button {...attributes} {...listeners} size="icon-sm" variant="ghost" className="ml-auto size-6 touch-none" aria-label={`Reorder ${group.name} column`}><GripVertical className="size-3" /></Button><WorkMenu label={`${group.name} options`} actions={[{ label: "Set WIP limit", onClick: onWip }, { label: "Collapse column", onClick: onFold }, { label: "Add task", onClick: onCreate }]} /></> : <span className="py-2 text-xs font-semibold [writing-mode:vertical-rl]">{group.name} · {count}</span>}</div>
    {!folded && <>{overLimit && <p className="px-3 pb-2 text-[10px] text-amber-600">{total} active cards · WIP limit exceeded</p>}<div className="min-h-12 space-y-2 px-2">{children}{!count && <div className="rounded-lg border border-dashed px-3 py-8 text-center text-xs text-muted-foreground">Drop work here</div>}</div><Button size="sm" variant="ghost" className="mx-2 mt-2 justify-start gap-2 text-xs text-muted-foreground" onClick={onCreate}><Plus className="size-3.5" />Add task</Button></>}
  </div>;
}
function SortableCard({ task, state, view, groupId, lane, selected, onSelect, onOpen, onMove, onUp }: { task: WorkspaceTask; state: WorkspaceState; view: WorkView; groupId: string; lane: string; selected: boolean; onSelect: () => void; onOpen: () => void; onMove: () => void; onUp?: () => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: "task", groupId, lane }, disabled: !canEditTask(state, task) || task.archived });
  const comments = state.comments.filter((c) => c.taskId === task.id && !c.deleted).length;
  const children = state.tasks.filter((t) => t.parentId === task.id);
  const timezone = state.workspaces.find((w) => w.id === state.lists.find((l) => l.id === task.listId)?.workspaceId)?.timezone ?? state.timezone;
  const overdue = isOverdue(task, new Date());
  const blocked = task.dependencyIds.some((id) => state.tasks.some((t) => t.id === id && !isClosed(t)));
  return <Card ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("group gap-0 border border-border/80 py-0 transition-colors hover:border-primary/30", isDragging && "opacity-25", selected && "border-primary bg-primary/5")}>
    <CardContent className={cn("space-y-3 p-3.5", view.density === "compact" && "space-y-2 p-2.5")}>
      <div className="flex items-center gap-1"><span className="text-[9px] font-medium tracking-wide text-muted-foreground">{task.code}</span><div className={cn("ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100", selected && "opacity-100")}><Checkbox checked={selected} aria-label={`Select ${task.subject}`} onCheckedChange={onSelect} /><Button {...attributes} {...listeners} variant="ghost" size="icon-sm" className="size-5 touch-none" aria-label={`Drag ${task.subject}`}><GripVertical className="size-3" /></Button><WorkMenu label={`Actions for ${task.subject}`} actions={[{ label: "Open task", onClick: onOpen }, { label: "Move to column…", onClick: onMove }, { label: "Move up", disabled: !onUp, onClick: () => onUp?.() }, { label: "Duplicate task", onClick: () => runTaskCommand({ kind: "work-duplicate", id: task.id }, "Task duplicated") }]} /></div><WorkPriority value={task.priority} /></div>
      <Button variant="link" onClick={onOpen} className="h-auto w-full justify-start whitespace-normal p-0 text-left text-[13px] font-medium leading-relaxed text-foreground hover:text-primary">{task.subject}</Button>
      <div className="flex flex-wrap gap-1">{task.tags.slice(0, view.density === "compact" ? 1 : 2).map((tag, i) => <Badge key={tag} variant="secondary" className={cn("border-0 px-1.5 py-0 text-[9px] font-normal", i ? "bg-violet-500/10 text-violet-600 dark:text-violet-300" : "bg-blue-500/10 text-blue-600 dark:text-blue-300")}>{tag}</Badge>)}{blocked && <Badge variant="outline" className="gap-1 border-amber-500/20 text-[9px] text-amber-600"><GitBranch className="size-2.5" />Blocked</Badge>}</div>
      {view.groupBy !== "status" && <WorkStatusBadge state={state} task={task} />}
      {view.fields.filter((f) => f.startsWith("field:")).map((id) => { const f = state.fields.find((f) => f.id === id.slice(6)); const value = task.fields[id.slice(6)]; return f && value != null ? <p key={id} className="text-[10px] text-muted-foreground">{f.name}: {f.options.find((o) => o.id === value)?.label ?? String(value)}</p> : null; })}
      <div className="flex items-center gap-2 border-t border-border/60 pt-2"><WorkPeople state={state} ids={task.assigneeIds} /><div className="ml-auto flex items-center gap-2 text-[9px] text-muted-foreground">{comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="size-3" />{comments}</span>}{children.length > 0 && <span className="flex items-center gap-1"><GitBranch className="size-3" />{children.filter(isClosed).length}/{children.length}</span>}{task.checklist.length > 0 && <span className="flex items-center gap-1"><CheckCheck className="size-3" />{task.checklist.filter((i) => i.done).length}/{task.checklist.length}</span>}{task.dueAt && <span className={cn("flex items-center gap-1", overdue && "text-rose-500")}><CalendarDays className="size-3" />{formatTaskDate(task.dueAt, timezone)}</span>}</div></div>
    </CardContent>
  </Card>;
}
