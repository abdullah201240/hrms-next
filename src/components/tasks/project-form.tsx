"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, FolderKanban, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { PageHeader } from "@/components/shared/page-header";
import { runTaskCommand, useUnsavedTaskForm } from "@/hooks/use-task-workspace";
import { canManage, newProjectDraft } from "@/lib/tasks/domain";
import { PROJECT_STATUSES, type ProjectDraft, type TaskWorkspace } from "@/lib/tasks/types";
import { personOptions, TaskBoundary, TaskDateInput, TaskEmpty, TaskField, TaskLink } from "./task-shared";

export function ProjectFormPage({ id }: { id?: string }) {
  return <TaskBoundary>{(state) => <ProjectForm key={id ?? "new"} state={state} id={id} />}</TaskBoundary>;
}
function ProjectForm({ state, id }: { state: TaskWorkspace; id?: string }) {
  const router = useRouter();
  const existing = state.projects.find((project) => project.id === id);
  const [initial] = useState<ProjectDraft>(() => existing ? structuredClone(existing) : newProjectDraft(state.actorId, () => crypto.randomUUID()));
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(false);
  useUnsavedTaskForm(!saved && JSON.stringify(draft) !== JSON.stringify(initial));
  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => setDraft((previous) => ({ ...previous, [key]: value }));
  if (id && !existing) return <TaskEmpty title="Project not found" description="This project is not in the current browser demo."><TaskLink href="/projects">All projects</TaskLink></TaskEmpty>;
  if (existing && !canManage(state, existing)) return <TaskEmpty title="Manager access required" description="Switch to this project's demo manager to change its settings." />;
  const reorder = (index: number, offset: number) => { const stages = [...draft.stages]; [stages[index], stages[index + offset]] = [stages[index + offset], stages[index]]; set("stages", stages); };
  return <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); const target = id ?? crypto.randomUUID(); if (runTaskCommand({ kind: "save-project", id: target, draft }, id ? "Project updated" : "Project created")) { setSaved(true); router.push(`/projects/${target}`); } }}>
    <PageHeader title={id ? "Project settings" : "New project"} icon={FolderKanban} description="Give your team a shared space and a clear way to work." backHref={id ? `/projects/${id}` : "/projects"}><Button type="submit"><Save className="size-4" /> {id ? "Save changes" : "Create project"}</Button></PageHeader>
    <div className="grid gap-6 xl:grid-cols-2"><div className="space-y-6">
      <Card><CardHeader><CardTitle>Project details</CardTitle></CardHeader><CardContent className="space-y-5">
        <TaskField id="project-name" label="Project name *"><Input id="project-name" required maxLength={255} value={draft.name} onChange={(event) => set("name", event.target.value)} placeholder="e.g. New employee onboarding" /></TaskField>
        <TaskField id="project-description" label="Description"><Textarea id="project-description" rows={4} value={draft.description} onChange={(event) => set("description", event.target.value)} placeholder="What does success look like?" /></TaskField>
        <div className="grid gap-5 sm:grid-cols-2"><TaskField id="project-department" label="Department"><SearchSelect id="project-department" value={draft.department} options={[...new Set(state.people.map((person) => person.department))]} placeholder="Select department" onChange={(value) => set("department", value)} /></TaskField><TaskField id="project-status" label="Status"><SearchSelect id="project-status" value={draft.status} options={PROJECT_STATUSES} placeholder="Project status" onChange={(value) => value && set("status", value as ProjectDraft["status"])} /></TaskField></div>
        <div className="grid gap-5 sm:grid-cols-2"><TaskField id="project-start" label="Starts"><TaskDateInput id="project-start" value={draft.startAt} timezone={state.timezone} onChange={(value) => set("startAt", value)} /></TaskField><TaskField id="project-due" label="Due"><TaskDateInput id="project-due" value={draft.dueAt} timezone={state.timezone} onChange={(value) => set("dueAt", value)} /></TaskField></div><p className="text-xs text-muted-foreground">Dates use {state.timezone}. Task dates must fit within this range.</p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Project team</CardTitle></CardHeader><CardContent className="space-y-5"><TaskField id="project-manager" label="Project manager *"><SearchSelect id="project-manager" value={draft.managerId} options={personOptions(state)} placeholder="Select manager" onChange={(value) => setDraft({ ...draft, managerId: value, memberIds: [...new Set([...draft.memberIds, value].filter(Boolean))] })} /></TaskField><TaskField id="project-members" label="Members" hint="The manager stays a member. Reassign a member's tasks before removing them."><SearchSelect id="project-members" multiple value={draft.memberIds} options={personOptions(state)} placeholder="Search project members" onChange={(value) => set("memberIds", [...new Set([...value, draft.managerId].filter(Boolean))])} /></TaskField></CardContent></Card>
    </div>
    <Card className="h-fit"><CardHeader><CardTitle>Board stages</CardTitle><p className="text-sm text-muted-foreground">Customize the flow without changing lifecycle statuses. Folded stages start collapsed on the board.</p></CardHeader><CardContent className="space-y-4">
      {draft.stages.map((stage, index) => <div key={stage.id} className="space-y-2 border-b pb-4"><div className="flex items-center gap-2"><span className="w-5 text-xs text-muted-foreground">{index + 1}</span><Input required aria-label={`Stage ${index + 1} name`} value={stage.name} onChange={(event) => set("stages", draft.stages.map((item) => item.id === stage.id ? { ...item, name: event.target.value } : item))} /><Button size="icon-sm" variant="outline" aria-label={`Move stage ${index + 1} up`} disabled={index === 0} onClick={() => reorder(index, -1)}><ArrowUp className="size-4" /></Button><Button size="icon-sm" variant="outline" aria-label={`Move stage ${index + 1} down`} disabled={index === draft.stages.length - 1} onClick={() => reorder(index, 1)}><ArrowDown className="size-4" /></Button></div><Label className="ml-7 flex items-center gap-2 text-xs"><Checkbox checked={stage.folded} onCheckedChange={(checked) => set("stages", draft.stages.map((item) => item.id === stage.id ? { ...item, folded: !!checked } : item))} /> Fold by default</Label></div>)}
      <Button variant="outline" onClick={() => set("stages", [...draft.stages, { id: crypto.randomUUID(), name: "New stage", folded: false }])}><Plus className="size-4" /> Add stage</Button>
    </CardContent></Card></div>
  </form>;
}
