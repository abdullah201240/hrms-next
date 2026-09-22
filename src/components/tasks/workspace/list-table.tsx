"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchSelect } from "@/components/shared/search-select";
import { canEditTask, formatTaskDate, isClosed } from "@/lib/tasks/domain";
import { fieldsFor, groupsFor, scopeLists, statusesFor, taskDraft, taskGroup } from "@/lib/tasks/workspace-model";
import { TASK_PRIORITIES, type TaskDraft } from "@/lib/tasks/types";
import type { WorkScope, WorkView, WorkspaceCommand, WorkspaceState, WorkspaceTask } from "@/lib/tasks/workspace-types";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { WorkEmpty, WorkLabel, WorkModal, WorkPeople, WorkPriority, WorkStatusBadge } from "./common";
import { CustomFieldInput, TaskMoveDialog } from "./task-panel";
import { TaskDateInput } from "../task-shared";

export const BASE_FIELDS = [{ value: "status", label: "Status" }, { value: "assignee", label: "Assignee" }, { value: "priority", label: "Priority" }, { value: "due", label: "Due date" }, { value: "start", label: "Start date" }, { value: "estimate", label: "Estimate" }, { value: "progress", label: "Progress" }, { value: "list", label: "List" }, { value: "tags", label: "Tags" }];
export function WorkspaceTable({ state, scope, view, tasks, selected, onSelect, onOpen, onView, onCreate }: { state: WorkspaceState; scope: WorkScope; view: WorkView; tasks: WorkspaceTask[]; selected: Set<string>; onSelect: (ids: Set<string>) => void; onOpen: (id: string) => void; onView: (view: WorkView) => void; onCreate: (listId?: string, statusId?: string) => void }) {
  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);
  const [foldedTasks, setFoldedTasks] = useState<string[]>([]);
  const groups = view.type === "table" ? [{ id: "all", name: "All tasks", color: "#64748b" }] : groupsFor(state, scope, view.groupBy);
  const nested = view.type === "list" && view.subtasks === "nested";
  const roots = nested ? tasks.filter((t) => !tasks.some((p) => p.id === t.parentId)) : tasks;
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;
  const toggle = (id: string) => { const next = new Set(selected); if (next.has(id)) next.delete(id); else next.add(id); onSelect(next); };
  const label = (field: string) => BASE_FIELDS.find((f) => f.value === field)?.label ?? state.fields.find((f) => `field:${f.id}` === field)?.name ?? field;
  const cellValue = (task: WorkspaceTask, field: string) => {
    if (field === "status") return <WorkStatusBadge state={state} task={task} />;
    if (field === "assignee") return <WorkPeople state={state} ids={task.assigneeIds} />;
    if (field === "priority") return <WorkPriority value={task.priority} label />;
    if (field === "due" || field === "start") return <span className="text-xs">{formatTaskDate(field === "due" ? task.dueAt : task.startAt, timezone) || "—"}</span>;
    if (field === "estimate") return `${task.estimateHours}h`;
    if (field === "progress") return `${task.progress}%`;
    if (field === "list") return state.lists.find((l) => l.id === task.listId)?.name;
    if (field === "tags") return task.tags.join(", ") || "—";
    const f = state.fields.find((f) => `field:${f.id}` === field); const value = f && task.fields[f.id];
    return f?.options.find((o) => o.id === value)?.label ?? (value == null || value === "" ? "—" : typeof value === "boolean" ? value ? "Yes" : "No" : String(value));
  };
  const row = (task: WorkspaceTask, depth = 0): React.ReactNode => {
    const children = nested ? tasks.filter((t) => t.parentId === task.id) : [];
    const folded = foldedTasks.includes(task.id);
    return <FragmentRows key={task.id} rows={<><TableRow data-state={selected.has(task.id) ? "selected" : undefined}><TableCell className="w-9"><Checkbox checked={selected.has(task.id)} aria-label={`Select ${task.subject}`} onCheckedChange={() => toggle(task.id)} /></TableCell><TableCell className="min-w-72"><div className="group flex items-center gap-2" style={{ paddingLeft: depth * 18 }}>{!!children.length && <Button size="icon-sm" variant="ghost" aria-label={`${folded ? "Expand" : "Collapse"} subtasks`} onClick={() => setFoldedTasks(folded ? foldedTasks.filter((id) => id !== task.id) : [...foldedTasks, task.id])}>{folded ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}</Button>}<Button variant="link" className={`h-auto min-w-0 justify-start whitespace-normal p-0 text-left text-xs text-foreground ${view.density === "compact" ? "py-0.5" : "py-2"}`} onClick={() => onOpen(task.id)}>{task.subject}</Button><Button variant="ghost" className="ml-auto size-6 shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" size="icon-sm" aria-label={`Rename ${task.subject}`} disabled={!canEditTask(state, task) || isClosed(task)} onClick={() => setEditing({ id: task.id, field: "name" })}><Pencil className="size-3" /></Button><span className="shrink-0 text-[9px] text-muted-foreground">{task.code}</span></div></TableCell>{view.fields.map((field) => <TableCell key={field} style={{ minWidth: view.widths[field] ?? 145, maxWidth: view.widths[field] ?? 220 }}><Button variant="ghost" className="h-auto w-full justify-start overflow-hidden px-1 text-left text-xs" disabled={field === "list" || field !== "status" && (!canEditTask(state, task) || isClosed(task)) || field.startsWith("field:") && !fieldsFor(state, task.listId).some((f) => `field:${f.id}` === field)} aria-label={`Edit ${label(field)} for ${task.subject}`} onClick={() => setEditing({ id: task.id, field })}>{cellValue(task, field)}</Button></TableCell>)}</TableRow>{!folded && children.map((child) => row(child, depth + 1))}</>} />;
  };
  const editingTask = editing && state.tasks.find((t) => t.id === editing.id);
  return <div className="h-full overflow-auto px-5 py-4">
    {!tasks.length && <WorkEmpty title="No tasks match this view" description="Adjust your filters or create the next piece of work." action={<Button size="sm" onClick={() => onCreate()}>Add task</Button>} />}
    {groups.map((group) => { const items = view.type === "table" ? roots : roots.filter((t) => taskGroup(t, view.groupBy, groups) === group.id); const folded = view.folded.includes(group.id); return <section key={group.id} className="mb-5">{view.type !== "table" && <div className="mb-2 flex items-center gap-2"><Button variant="ghost" size="icon-sm" onClick={() => onView({ ...view, folded: folded ? view.folded.filter((id) => id !== group.id) : [...view.folded, group.id] })} aria-label={`Toggle ${group.name}`}>{folded ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}</Button><Badge variant="secondary" style={{ color: group.color }}>{group.name}</Badge><span className="text-xs text-muted-foreground">{items.length}</span></div>}{!folded && <><Table><TableHeader><TableRow><TableHead className="w-9"><Checkbox aria-label={`Select ${group.name}`} checked={items.length > 0 && items.every((t) => selected.has(t.id))} onCheckedChange={(checked) => { const next = new Set(selected); items.forEach((t) => checked ? next.add(t.id) : next.delete(t.id)); onSelect(next); }} /></TableHead><TableHead>Task name</TableHead>{view.fields.map((field) => <TableHead key={field}>{label(field)}</TableHead>)}</TableRow></TableHeader><TableBody>{items.map((t) => row(t))}</TableBody></Table><Button variant="ghost" size="sm" className="mt-1 text-xs text-muted-foreground" onClick={() => onCreate(scope.kind === "list" ? scope.id : undefined, view.groupBy === "status" && statusesFor(state, scope.id).some((s) => s.id === group.id) ? group.id : undefined)}><Plus className="size-3.5" />Add task</Button></>}</section>; })}
    {editing && editingTask && <InlineEditor key={`${editing.id}-${editing.field}`} state={state} task={editingTask} field={editing.field} onClose={() => setEditing(null)} />}
  </div>;
}
function FragmentRows({ rows }: { rows: React.ReactNode }) { return <>{rows}</>; }
function InlineEditor({ state, task, field, onClose }: { state: WorkspaceState; task: WorkspaceTask; field: string; onClose: () => void }) {
  const [draft, setDraft] = useState(taskDraft(task));
  const [status, setStatus] = useState(task.statusId);
  const [fields, setFields] = useState(task.fields);
  const list = state.lists.find((l) => l.id === task.listId)!;
  const timezone = state.workspaces.find((w) => w.id === list.workspaceId)!.timezone;
  const custom = state.fields.find((f) => `field:${f.id}` === field);
  return <WorkModal title={`Edit ${custom?.name ?? field}`} onClose={onClose}><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (field === "status" && statusesFor(state, list.id).find((s) => s.id === status)?.category === "Cancelled" && !window.confirm("Cancel this task?")) return; if (runTaskCommand(field === "status" ? { kind: "work-status", ids: [task.id], statusIds: { [task.id]: status } } : { kind: "work-task", id: task.id, draft, fields }, "Task updated")) onClose(); }}>
    {field === "name" && <Input autoFocus value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} aria-label="Task name" />}
    {field === "status" && <SearchSelect value={status} options={statusesFor(state, task.listId).map((s) => ({ value: s.id, label: s.name }))} onChange={(v) => v && setStatus(v)} />}
    {field === "assignee" && <SearchSelect multiple value={draft.assigneeIds} options={state.people.filter((p) => list.memberIds.includes(p.id)).map((p) => ({ value: p.id, label: p.name }))} onChange={(assigneeIds) => setDraft({ ...draft, assigneeIds })} />}
    {field === "priority" && <SearchSelect value={draft.priority} options={TASK_PRIORITIES} onChange={(priority) => priority && setDraft({ ...draft, priority: priority as TaskDraft["priority"] })} />}
    {(field === "due" || field === "start") && <TaskDateInput id="inline-date" timezone={timezone} value={field === "due" ? draft.dueAt : draft.startAt} onChange={(value) => setDraft({ ...draft, [field === "due" ? "dueAt" : "startAt"]: value })} />}
    {(field === "estimate" || field === "progress") && <Input type="number" min={0} max={field === "progress" ? 100 : undefined} aria-label={field} value={field === "estimate" ? draft.estimateHours : draft.progress} onChange={(e) => setDraft({ ...draft, [field === "estimate" ? "estimateHours" : "progress"]: Number(e.target.value) })} />}
    {field === "tags" && <Input value={draft.tags.join(",")} aria-label="Tags separated by commas" onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",") })} />}
    {custom && <CustomFieldInput field={custom} value={fields[custom.id] ?? null} onChange={(v) => setFields({ ...fields, [custom.id]: v })} />}
    <Button type="submit">Save changes</Button>
  </form></WorkModal>;
}
export function BulkEditor({ state, scope, ids, onClose }: { state: WorkspaceState; scope: WorkScope; ids: string[]; onClose: () => void }) {
  const [action, setAction] = useState("priority");
  const [value, setValue] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [dates, setDates] = useState<{ startAt: string | null; dueAt: string | null }>({ startAt: null, dueAt: null });
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const tasks = state.tasks.filter((t) => ids.includes(t.id));
  const members = state.people.filter((p) => tasks.every((t) => state.lists.find((l) => l.id === t.listId)?.memberIds.includes(p.id)));
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;
  if (action === "move") return <TaskMoveDialog state={state} ids={ids} onClose={onClose} />;
  const submit = () => {
    let command: WorkspaceCommand;
    if (action === "status") command = { kind: "work-status", ids, statusIds: statuses };
    else command = { kind: "work-bulk", ids, ...(action === "archive" ? { archived: true } : {}), patch: action === "priority" ? { priority: value as TaskDraft["priority"] } : action === "assignee" ? { assigneeIds: people } : action === "tags" ? { tags: value.split(",").map((s) => s.trim()).filter(Boolean) } : action === "dates" ? dates : {} };
    if ((action === "archive" || action === "status" && tasks.some((t) => statusesFor(state, t.listId).find((s) => s.id === statuses[t.id])?.category === "Cancelled")) && !window.confirm(`Confirm ${action} for ${ids.length} selected tasks?`)) return;
    if (runTaskCommand(command, `${ids.length} tasks updated`)) onClose();
  };
  return <WorkModal title={`Update ${ids.length} selected tasks`} description="All selected tasks must pass validation. A failed change keeps both the data and selection intact." onClose={onClose}><SearchSelect value={action} options={[{ value: "priority", label: "Priority" }, { value: "status", label: "Status" }, { value: "assignee", label: "Assignments (replace)" }, { value: "tags", label: "Tags (replace)" }, { value: "dates", label: "Dates" }, { value: "move", label: "Move to List" }, { value: "archive", label: "Archive" }]} onChange={(v) => v && setAction(v)} />
    {action === "priority" && <SearchSelect value={value} options={TASK_PRIORITIES} onChange={setValue} />}{action === "tags" && <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Tags separated by commas" />}{action === "assignee" && <SearchSelect multiple value={people} options={members.map((p) => ({ value: p.id, label: p.name }))} onChange={setPeople} />}{action === "dates" && <><WorkLabel label="Start"><TaskDateInput id="bulk-start" timezone={timezone} value={dates.startAt} onChange={(startAt) => setDates({ ...dates, startAt })} /></WorkLabel><WorkLabel label="Due"><TaskDateInput id="bulk-due" timezone={timezone} value={dates.dueAt} onChange={(dueAt) => setDates({ ...dates, dueAt })} /></WorkLabel></>}{action === "status" && tasks.map((t) => <WorkLabel key={t.id} label={t.subject}><SearchSelect value={statuses[t.id] ?? ""} options={statusesFor(state, t.listId).map((s) => ({ value: s.id, label: s.name }))} onChange={(v) => setStatuses({ ...statuses, [t.id]: v })} /></WorkLabel>)}
    <Button onClick={submit} disabled={action === "priority" && !value || action === "status" && ids.some((id) => !statuses[id])}>Apply to all selected</Button>
  </WorkModal>;
}
