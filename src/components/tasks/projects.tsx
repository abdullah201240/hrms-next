"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CheckCheck, FolderKanban, LayoutGrid, List, Plus, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SearchSelect } from "@/components/shared/search-select";
import { StatCard } from "@/components/shared/stat-card";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { canManage, canViewProject, formatTaskDate, personName, projectProgress } from "@/lib/tasks/domain";
import { PROJECT_STATUSES, type TaskProject, type TaskWorkspace } from "@/lib/tasks/types";
import { TaskAssignees, TaskBoundary, TaskEmpty, TaskField, TaskLink, TaskStatusBadge } from "./task-shared";
import { TaskViews } from "./task-views";

export function ProjectsPage() { return <TaskBoundary>{(state) => <Projects state={state} />}</TaskBoundary>; }
function Projects({ state }: { state: TaskWorkspace }) {
  const [view, setView] = useState("cards");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const accessible = state.projects.filter((project) => canViewProject(state, project));
  const projects = accessible.filter((project) => (!status || project.status === status) && `${project.name} ${project.description} ${project.department}`.toLowerCase().includes(query.toLowerCase()));
  const columns: Column<TaskProject>[] = [
    { key: "name", header: "Project", sortable: true, cell: (project) => <Link className="font-medium hover:text-primary" href={`/projects/${project.id}`}>{project.name}</Link> },
    { key: "status", header: "Status", cell: (project) => <TaskStatusBadge status={project.status} /> },
    { key: "managerId", header: "Manager", cell: (project) => personName(state, project.managerId) },
    { key: "department", header: "Department", sortable: true },
    { key: "progress", header: "Progress", cell: (project) => `${projectProgress(state, project.id).percent}%` },
    { key: "dueAt", header: "Due", sortable: true, cell: (project) => formatTaskDate(project.dueAt, state.timezone) },
  ];
  return <div className="space-y-6"><PageHeader title="Projects" icon={FolderKanban} description="Bring people, plans, and progress together."><TaskLink href="/projects/templates">Browse templates</TaskLink><TaskLink href="/projects/new" variant="default"><Plus className="size-4" /> New project</TaskLink></PageHeader>
    <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Projects" value={accessible.length} icon={FolderKanban} color="blue" /><StatCard label="Open projects" value={accessible.filter((project) => project.status === "Open").length} icon={Users} color="amber" /><StatCard label="Completed projects" value={accessible.filter((project) => project.status === "Completed").length} icon={CheckCheck} color="emerald" /></div>
    <div className="flex flex-wrap gap-3"><Input className="min-w-48 flex-1" aria-label="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects…" /><div className="w-44"><SearchSelect value={status} options={PROJECT_STATUSES} placeholder="All project statuses" onChange={setStatus} /></div><Tabs value={view} onValueChange={(value) => setView(String(value))}><TabsList><TabsTrigger value="cards"><LayoutGrid className="size-4" /> Cards</TabsTrigger><TabsTrigger value="list"><List className="size-4" /> List</TabsTrigger></TabsList></Tabs></div>
    {view === "list" ? <DataTable columns={columns} rows={projects} /> : projects.length ? <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{projects.map((project) => { const progress = projectProgress(state, project.id); return <Card key={project.id}><CardHeader><div className="mb-3 flex items-center justify-between"><div className="chip bg-primary/10 p-3 text-primary"><FolderKanban className="size-5" /></div><TaskStatusBadge status={project.status} /></div><CardTitle><Link href={`/projects/${project.id}`} className="hover:text-primary">{project.name}</Link></CardTitle><p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description || "A shared space for your team's work."}</p></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-muted-foreground">{progress.completed} of {progress.total - progress.cancelled} tasks completed</span><span className="font-semibold">{progress.percent}%</span></div><Progress value={progress.percent} aria-label={`${project.name} progress`} /></div><div className="flex items-center justify-between"><TaskAssignees state={state} ids={project.memberIds} /><span className="text-xs text-muted-foreground">Due {formatTaskDate(project.dueAt, state.timezone)}</span></div><div className="flex items-center justify-between border-t pt-4"><p className="text-xs text-muted-foreground">{personName(state, project.managerId)}</p><TaskLink href={`/projects/${project.id}`} variant="ghost">Open project <ArrowUpRight className="size-4" /></TaskLink></div></CardContent></Card>; })}</div> : <TaskEmpty title="No projects found" description="Try a different search or create your first project."><TaskLink href="/projects/new">New project</TaskLink></TaskEmpty>}
  </div>;
}
export function ProjectDetailPage({ id }: { id: string }) { return <TaskBoundary>{(state) => <ProjectDetail state={state} id={id} />}</TaskBoundary>; }
function ProjectDetail({ state, id }: { state: TaskWorkspace; id: string }) {
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [name, setName] = useState("");
  const project = state.projects.find((item) => item.id === id);
  if (!project) return <TaskEmpty title="Project not found" description="This project is not in the current browser demo."><TaskLink href="/projects">All projects</TaskLink></TaskEmpty>;
  if (!canViewProject(state, project)) return <TaskEmpty title="Project access required" description="Switch to a demo project member or manager." />;
  const progress = projectProgress(state, id);
  const manager = canManage(state, project);
  return <div className="min-w-0 space-y-6"><PageHeader title={project.name} icon={FolderKanban} description={project.description} backHref="/projects"><TaskStatusBadge status={project.status} />{manager && <TaskLink href={`/projects/${id}/edit`}><Settings className="size-4" /> Settings</TaskLink>}<TaskLink href={`/tasks/new?project=${id}`} variant="default"><Plus className="size-4" /> New task</TaskLink></PageHeader>
    <Card><CardContent className="grid gap-5 py-5 sm:grid-cols-3"><div className="space-y-2"><div className="flex justify-between text-sm"><span>Project progress</span><strong>{progress.percent}%</strong></div><Progress value={progress.percent} aria-label="Project progress" /><p className="text-xs text-muted-foreground">{progress.completed} completed · {progress.cancelled} cancelled · Groups excluded</p></div><div className="space-y-2 text-sm"><p className="text-muted-foreground">Project manager</p><p>{personName(state, project.managerId)}</p></div><div className="space-y-2 text-sm"><p className="text-muted-foreground">Schedule · {state.timezone}</p><p>{formatTaskDate(project.startAt, state.timezone)} — {formatTaskDate(project.dueAt, state.timezone)}</p></div></CardContent></Card>
    <Tabs defaultValue="tasks"><TabsList><TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="team">Team & overview</TabsTrigger></TabsList><TabsContent value="tasks" className="pt-5"><TaskViews state={state} initialProjectId={id} embedded /></TabsContent><TabsContent value="team" className="space-y-5 pt-5"><Card><CardHeader><CardTitle>Project members ({project.memberIds.length})</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{state.people.filter((person) => project.memberIds.includes(person.id)).map((person) => <div key={person.id} className="flex items-center gap-3 border-b pb-4"><TaskAssignees state={state} ids={[person.id]} /><div><p className="text-sm font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{person.employeeCode} · {person.id === project.managerId ? "Project manager" : person.department}</p></div></div>)}</CardContent></Card><Card><CardContent className="space-y-4 py-5"><Badge variant="outline">{project.department || "Cross-functional"}</Badge><p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.description}</p><p className="text-xs text-muted-foreground">Progress counts completed non-group tasks, excluding cancelled tasks from the denominator. Archived records retain their contribution.</p>{manager && <Button variant="outline" onClick={() => { setName(`${project.name} template`); setSavingTemplate(true); }}>Save as template</Button>}</CardContent></Card></TabsContent></Tabs>
    <Dialog open={savingTemplate} onOpenChange={setSavingTemplate}><DialogContent><DialogHeader><DialogTitle>Save project as template</DialogTitle><DialogDescription>Copy stages, task definitions, estimates, and relationships. Comments and completion history are excluded. Assign the Project team role when creating a new project.</DialogDescription></DialogHeader><TaskField id="saved-template-name" label="Template name"><Input id="saved-template-name" value={name} onChange={(event) => setName(event.target.value)} /></TaskField><DialogFooter><Button variant="outline" onClick={() => setSavingTemplate(false)}>Cancel</Button><Button onClick={() => { if (runTaskCommand({ kind: "save-template", projectId: id, name }, "Project template saved")) setSavingTemplate(false); }}>Save template</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
