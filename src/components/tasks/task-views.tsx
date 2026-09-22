"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCheck, ClipboardList, Clock, Kanban, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchSelect } from "@/components/shared/search-select";
import { StatCard } from "@/components/shared/stat-card";
import { runTaskCommand, useTaskClock } from "@/hooks/use-task-workspace";
import { blockedBy, canViewProject, dayKey, emptyTask, isClosed, isOverdue } from "@/lib/tasks/domain";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskCommand, type TaskStatus, type TaskWorkspace, type WorkTask } from "@/lib/tasks/types";
import { TaskBoard } from "./task-board";
import { TaskDetail } from "./task-detail";
import { personOptions, TaskAssignees, TaskBoundary, TaskDue, TaskField, TaskLink, TaskPriorityBadge, TaskSignals, TaskStatusBadge } from "./task-shared";

export function TasksPage({ mine = false, projectId }: { mine?: boolean; projectId?: string }) {
  return <TaskBoundary>{(state) => <TaskViews state={state} mine={mine} initialProjectId={projectId} />}</TaskBoundary>;
}
export function TaskViews({ state, mine = false, initialProjectId = "", embedded = false }: { state: TaskWorkspace; mine?: boolean; initialProjectId?: string; embedded?: boolean }) {
  const now = useTaskClock();
  const [view, setView] = useState(embedded ? "board" : "list");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ project: initialProjectId, status: "", stage: "", assignee: "", priority: "", tag: "", due: "", scope: "Active" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState("");
  const [quick, setQuick] = useState(false);
  const [quickSubject, setQuickSubject] = useState("");
  const [quickProject, setQuickProject] = useState(initialProjectId);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkPeople, setBulkPeople] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<TaskCommand | null>(null);
  const projects = state.projects.filter((project) => canViewProject(state, project));
  const project = projects.find((item) => item.id === filters.project);
  const base = state.tasks.filter((task) => projects.some((item) => item.id === task.projectId) && (!mine || task.assigneeIds.includes(state.actorId)) && (!embedded || task.projectId === initialProjectId));
  const active = base.filter((task) => !isClosed(task) && !task.archived);
  const today = dayKey(now, state.timezone);
  const setFilter = (key: keyof typeof filters, value: string) => { setFilters({ ...filters, [key]: value, ...(key === "project" ? { stage: "" } : {}) }); setSelected(new Set()); };
  const rows = base.filter((task) => {
    if (filters.project && task.projectId !== filters.project) return false;
    if (filters.scope === "Archived" ? !task.archived : task.archived) return false;
    if (filters.scope === "Active" && !filters.status && isClosed(task)) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.stage && task.stageId !== filters.stage) return false;
    if (filters.assignee === "unassigned" ? task.assigneeIds.length : filters.assignee && !task.assigneeIds.includes(filters.assignee)) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.tag && !task.tags.includes(filters.tag)) return false;
    if (query.trim() && !`${task.subject} ${task.code} ${task.description} ${task.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (filters.due === "Overdue" && !isOverdue(task, now)) return false;
    if (filters.due === "Due today" && (isClosed(task) || !task.dueAt || dayKey(task.dueAt, state.timezone) !== today)) return false;
    if (filters.due === "Upcoming" && (isClosed(task) || !task.dueAt || dayKey(task.dueAt, state.timezone) <= today)) return false;
    if (filters.due === "No date" && task.dueAt) return false;
    if (filters.due === "Blocked" && !blockedBy(state, task).length) return false;
    return true;
  });
  const selectedTasks = rows.filter((task) => selected.has(task.id));
  const ids = selectedTasks.map((task) => task.id);
  const members = state.people.filter((person) => selectedTasks.every((task) => projects.find((item) => item.id === task.projectId)?.memberIds.includes(person.id))).map((person) => person.id);
  const columns: Column<WorkTask>[] = [
    { key: "subject", header: "Task", sortable: true, cell: (task) => <div className="min-w-56 max-w-96 space-y-1"><Link href={`/tasks/${task.id}`} className="font-medium hover:text-primary">{task.subject}</Link><p className="text-xs text-muted-foreground">{task.code} · {projects.find((item) => item.id === task.projectId)?.name}</p><div className="flex flex-wrap gap-1"><TaskSignals state={state} task={task} now={now} /></div></div> },
    { key: "status", header: "Status", sortable: true, cell: (task) => <TaskStatusBadge status={task.status} /> },
    { key: "stageId", header: "Stage", cell: (task) => projects.find((item) => item.id === task.projectId)?.stages.find((stage) => stage.id === task.stageId)?.name },
    { key: "priority", header: "Priority", sortable: true, cell: (task) => <TaskPriorityBadge priority={task.priority} /> },
    { key: "assigneeIds", header: "Assignees", cell: (task) => <TaskAssignees state={state} ids={task.assigneeIds} /> },
    { key: "dueAt", header: "Due", sortable: true, cell: (task) => <TaskDue state={state} task={task} now={now} /> },
    { key: "progress", header: "Progress", sortable: true, cell: (task) => `${task.progress}%` },
  ];
  const openTask = state.tasks.find((task) => task.id === openId);
  return <div className="min-w-0 space-y-6">
    {!embedded && <PageHeader title={mine ? "My Tasks" : "All Tasks"} icon={ClipboardList} description={mine ? "Your work, priorities, and upcoming deadlines in one place." : "A shared view of every project, handoff, and next step."}><TaskLink href="/projects">Projects</TaskLink><Button variant="outline" onClick={() => { setQuickProject(filters.project || projects[0]?.id || ""); setQuick(true); }}><Plus className="size-4" /> Quick add</Button><TaskLink href={`/tasks/new${filters.project ? `?project=${filters.project}` : ""}`} variant="default"><Plus className="size-4" /> New task</TaskLink></PageHeader>}
    {!embedded && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Active tasks" value={active.length} icon={ClipboardList} color="blue" /><StatCard label="Due today" value={active.filter((task) => task.dueAt && dayKey(task.dueAt, state.timezone) === today).length} icon={Clock} color="amber" /><StatCard label="Overdue" value={active.filter((task) => isOverdue(task, now)).length} icon={AlertCircle} color="rose" /><StatCard label="Pending review" value={active.filter((task) => task.status === "Pending Review").length} icon={CheckCheck} color="emerald" /></div>}
    {mine && <div className="flex flex-wrap gap-2">{["All my work", "Due today", "Overdue", "Upcoming", "Pending Review"].map((label) => <Button key={label} size="sm" variant={(label === "Pending Review" ? filters.status === label : label === "All my work" ? !filters.due && !filters.status : filters.due === label) ? "default" : "outline"} onClick={() => { setFilters({ ...filters, due: ["All my work", "Pending Review"].includes(label) ? "" : label, status: label === "Pending Review" ? label : "" }); setSelected(new Set()); }}>{label}</Button>)}</div>}
    <Card><CardContent className="space-y-4 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="relative min-w-48 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" aria-label="Search tasks" placeholder="Search by task, ID, or tag…" value={query} onChange={(event) => { setQuery(event.target.value); setSelected(new Set()); }} /></div><Tabs value={view} onValueChange={(value) => { setView(String(value)); setSelected(new Set()); }}><TabsList><TabsTrigger value="list"><List className="size-4" /> List</TabsTrigger><TabsTrigger value="board"><Kanban className="size-4" /> Kanban</TabsTrigger></TabsList></Tabs></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!embedded && <SearchSelect value={filters.project} options={projects.map((item) => ({ value: item.id, label: item.name }))} placeholder="All projects" onChange={(value) => setFilter("project", value)} />}
        <SearchSelect value={filters.status} options={TASK_STATUSES} placeholder="All statuses" onChange={(value) => setFilter("status", value)} />
        <SearchSelect value={filters.stage} disabled={!project} options={project?.stages.map((stage) => ({ value: stage.id, label: stage.name })) ?? []} placeholder={project ? "All stages" : "Select a project for stages"} onChange={(value) => setFilter("stage", value)} />
        <SearchSelect value={filters.assignee} options={[{ value: "unassigned", label: "Unassigned" }, ...personOptions(state, project?.memberIds)]} placeholder="All assignees" onChange={(value) => setFilter("assignee", value)} />
        <SearchSelect value={filters.priority} options={TASK_PRIORITIES} placeholder="All priorities" onChange={(value) => setFilter("priority", value)} />
        <SearchSelect value={filters.tag} options={[...new Set(base.flatMap((task) => task.tags))]} placeholder="All tags" onChange={(value) => setFilter("tag", value)} />
        <SearchSelect value={filters.due} options={["Due today", "Overdue", "Upcoming", "No date", "Blocked"]} placeholder="Any due date" onChange={(value) => setFilter("due", value)} />
        <SearchSelect value={filters.scope} options={["Active", "All tasks", "Archived"]} placeholder="Task visibility" onChange={(value) => setFilter("scope", value || "Active")} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{rows.length} tasks · {state.timezone}</span><Button variant="ghost" size="sm" onClick={() => { setFilters({ project: embedded ? initialProjectId : "", status: "", stage: "", assignee: "", priority: "", tag: "", due: "", scope: "Active" }); setQuery(""); setSelected(new Set()); }}>Clear filters</Button></div>
    </CardContent></Card>
    {ids.length > 0 && view === "list" && <Card><CardContent className="flex flex-wrap items-center gap-3 py-3"><span className="text-sm font-medium">{ids.length} selected</span><div className="w-44"><SearchSelect value={bulkStatus} options={TASK_STATUSES} placeholder="Set status" onChange={setBulkStatus} /></div><Button size="sm" disabled={!bulkStatus} onClick={() => setConfirm({ kind: "transition", ids, status: bulkStatus as TaskStatus })}>Apply status</Button><div className="min-w-56 flex-1"><SearchSelect multiple value={bulkPeople} options={personOptions(state, members)} placeholder="Replace assignees" onChange={setBulkPeople} /></div><Button size="sm" variant="outline" onClick={() => setConfirm({ kind: "assign", ids, assigneeIds: bulkPeople })}>Assign selected</Button><Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear selection</Button></CardContent></Card>}
    {view === "board" ? <TaskBoard key={project?.id ?? "all"} state={state} tasks={rows} project={project} now={now} onOpen={setOpenId} /> : <DataTable columns={columns} rows={rows} selectable selectedIds={new Set(ids)} onSelectionChange={setSelected} emptyText="No tasks match these filters. Clear filters or create a new task." />}
    <Sheet open={!!openId} onOpenChange={(open) => !open && setOpenId("")}><SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-3xl"><SheetHeader className="pr-12"><SheetTitle>{openTask?.subject ?? "Task details"}</SheetTitle><SheetDescription>{openTask?.code} · Mock task workspace</SheetDescription></SheetHeader><div className="px-4 pb-6">{openId && <TaskDetail key={openId} state={state} id={openId} compact />}</div></SheetContent></Sheet>
    <Dialog open={quick} onOpenChange={setQuick}><DialogContent><DialogHeader><DialogTitle>Quick add task</DialogTitle><DialogDescription>Create an Open task. Add dates, assignees, and dependencies from its edit page.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const targetProject = projects.find((item) => item.id === quickProject); if (!targetProject) return; if (runTaskCommand({ kind: "save-task", id: crypto.randomUUID(), draft: { ...emptyTask(targetProject), subject: quickSubject } }, "Task created")) { setQuick(false); setQuickSubject(""); } }}><TaskField id="quick-project" label="Project"><SearchSelect id="quick-project" value={quickProject} options={projects.map((item) => ({ value: item.id, label: item.name }))} placeholder="Select project" onChange={setQuickProject} /></TaskField><TaskField id="quick-subject" label="Subject"><Input id="quick-subject" required maxLength={255} value={quickSubject} onChange={(event) => setQuickSubject(event.target.value)} placeholder="What needs to be done?" /></TaskField><DialogFooter><Button variant="outline" onClick={() => setQuick(false)}>Cancel</Button><Button type="submit" disabled={!quickProject}>Create task</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>Update selected tasks?</DialogTitle><DialogDescription>{confirm?.kind === "assign" ? `Replace all assignees on ${confirm.ids.length} tasks${!confirm.assigneeIds.length ? " with no assignees" : ""}?` : confirm?.kind === "transition" ? `Move ${confirm.ids.length} tasks to ${confirm.status}?` : ""} If any task fails validation, none of the changes will be saved.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button><Button onClick={() => { if (confirm && runTaskCommand(confirm, "Selected tasks updated")) { setConfirm(null); setSelected(new Set()); } }}>Confirm update</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
