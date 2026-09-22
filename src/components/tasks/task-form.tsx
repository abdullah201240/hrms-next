"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/shared/search-select";
import { PageHeader } from "@/components/shared/page-header";
import { runTaskCommand, useUnsavedTaskForm } from "@/hooks/use-task-workspace";
import { canEditTask, canManage, canViewProject, emptyTask, isClosed } from "@/lib/tasks/domain";
import { TASK_PRIORITIES, TASK_TYPES, type TaskDraft, type TaskWorkspace } from "@/lib/tasks/types";
import { personOptions, TaskBoundary, TaskDateInput, TaskEmpty, TaskField, TaskLink } from "./task-shared";

export function TaskFormPage({ id, projectId, parentId }: { id?: string; projectId?: string; parentId?: string }) {
  return <TaskBoundary>{(state) => <TaskForm key={`${id ?? "new"}-${state.timezone}`} state={state} id={id} projectId={projectId} parentId={parentId} />}</TaskBoundary>;
}
function TaskForm({ state, id, projectId, parentId }: { state: TaskWorkspace; id?: string; projectId?: string; parentId?: string }) {
  const router = useRouter();
  const existing = state.tasks.find((task) => task.id === id);
  const projects = state.projects.filter((project) => canViewProject(state, project));
  const initialProject = projects.find((project) => project.id === (existing?.projectId ?? projectId)) ?? projects[0];
  const [initial] = useState<TaskDraft>(() => {
    const draft = emptyTask(initialProject);
    if (existing) for (const key of Object.keys(draft) as (keyof TaskDraft)[]) Object.assign(draft, { [key]: existing[key] });
    else if (parentId) draft.parentId = parentId;
    return draft;
  });
  const [draft, setDraft] = useState(initial);
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = !saved && (JSON.stringify(draft) !== JSON.stringify(initial) || tags !== initial.tags.join(", "));
  useUnsavedTaskForm(dirty);
  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft((previous) => ({ ...previous, [key]: value }));
  const project = projects.find((item) => item.id === draft.projectId);
  const manager = !!project && canManage(state, project);
  const related = state.tasks.filter((task) => task.projectId === project?.id && task.id !== id && !task.archived);
  if (id && !existing) return <TaskEmpty title="Task not found" description="This task is not in this browser's demo data."><TaskLink href="/tasks">All tasks</TaskLink></TaskEmpty>;
  if (existing && (!canEditTask(state, existing) || isClosed(existing) || existing.archived)) return <TaskEmpty title="Task is read-only" description="Choose an authorized demo employee, or reopen and unarchive this task before editing."><TaskLink href={`/tasks/${id}`}>View task</TaskLink></TaskEmpty>;
  if (!projects.length) return <TaskEmpty title="Create a project first" description="Tasks belong to projects. Create one or switch demo employees."><TaskLink href="/projects/new">New project</TaskLink></TaskEmpty>;
  return <form className="space-y-6" onSubmit={(event) => {
    event.preventDefault();
    const target = id ?? crypto.randomUUID();
    if (runTaskCommand({ kind: "save-task", id: target, draft: { ...draft, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) } }, id ? "Task updated" : "Task created")) { setSaved(true); router.push(`/tasks/${target}`); }
    else setError("The task was not saved. Check the validation message and try again.");
  }}>
    <PageHeader title={id ? "Edit task" : parentId ? "New subtask" : "New task"} icon={ClipboardList} description="Plan the work, assign your team, and keep everyone aligned." backHref={id ? `/tasks/${id}` : "/tasks"}>
      <Button type="submit"><Save className="size-4" /> {id ? "Save changes" : "Create task"}</Button>
    </PageHeader>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Task details</CardTitle></CardHeader><CardContent className="space-y-5">
          <TaskField id="task-subject" label="Subject *"><Input id="task-subject" required maxLength={255} placeholder="What needs to be done?" value={draft.subject} onChange={(event) => set("subject", event.target.value)} /></TaskField>
          <TaskField id="task-description" label="Description"><Textarea id="task-description" rows={6} placeholder="Add context, acceptance criteria, or helpful notes…" value={draft.description} onChange={(event) => set("description", event.target.value)} /></TaskField>
          <div className="grid gap-5 sm:grid-cols-2">
            <TaskField id="task-project" label="Project *"><SearchSelect id="task-project" disabled={!!id} value={draft.projectId} options={projects.map((item) => ({ value: item.id, label: item.name }))} placeholder="Select project" onChange={(value) => { const next = projects.find((item) => item.id === value); setDraft({ ...draft, projectId: value, stageId: next?.stages[0]?.id ?? "", assigneeIds: [], reviewerId: next?.managerId ?? "", parentId: "", dependencyIds: [] }); }} /></TaskField>
            <TaskField id="task-stage" label="Board stage *" hint="Stage changes never complete a task."><SearchSelect id="task-stage" value={draft.stageId} options={project?.stages.map((stage) => ({ value: stage.id, label: stage.name })) ?? []} placeholder="Select stage" onChange={(value) => set("stageId", value)} /></TaskField>
            <TaskField id="task-priority" label="Priority"><SearchSelect id="task-priority" value={draft.priority} options={TASK_PRIORITIES} placeholder="Select priority" onChange={(value) => value && set("priority", value as TaskDraft["priority"])} /></TaskField>
            <TaskField id="task-type" label="Task type"><SearchSelect id="task-type" value={draft.type} options={TASK_TYPES} placeholder="Select task type" onChange={(value) => set("type", value)} /></TaskField>
          </div>
          <TaskField id="task-tags" label="Tags" hint="Separate tags with commas."><Input id="task-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="onboarding, people, documentation" /></TaskField>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Relationships</CardTitle></CardHeader><CardContent className="space-y-5">
          <Label className="flex items-center gap-2"><Checkbox checked={draft.isGroup} disabled={!manager} onCheckedChange={(checked) => set("isGroup", !!checked)} /> Group task (can contain subtasks)</Label>
          <TaskField id="task-parent" label="Parent task" hint="Only group tasks in this project can be parents."><SearchSelect id="task-parent" disabled={!manager} value={draft.parentId} options={related.filter((task) => task.isGroup).map((task) => ({ value: task.id, label: `${task.code} · ${task.subject}` }))} placeholder="No parent" onChange={(value) => set("parentId", value)} /></TaskField>
          <TaskField id="task-dependencies" label="Depends on" hint="These tasks must be completed or cancelled before work can start. Managers control relationships."><SearchSelect id="task-dependencies" multiple disabled={!manager} value={draft.dependencyIds} options={related.map((task) => ({ value: task.id, label: `${task.code} · ${task.subject}` }))} placeholder="Search dependencies" onChange={(value) => set("dependencyIds", value)} /></TaskField>
        </CardContent></Card>
      </div>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>People & review</CardTitle></CardHeader><CardContent className="space-y-5">
          <TaskField id="task-assignees" label="Assignees" hint="Select one or more project members."><SearchSelect id="task-assignees" multiple value={draft.assigneeIds} options={personOptions(state, project?.memberIds ?? [])} placeholder="Search assignees" onChange={(value) => set("assigneeIds", value)} /></TaskField>
          <TaskField id="task-reviewer" label="Reviewer"><SearchSelect id="task-reviewer" value={draft.reviewerId} options={personOptions(state, project?.memberIds ?? [])} placeholder="Select reviewer" onChange={(value) => set("reviewerId", value)} /></TaskField>
          <Label className="flex items-center gap-2"><Checkbox checked={draft.reviewRequired} onCheckedChange={(checked) => set("reviewRequired", !!checked)} /> Require approval before completion</Label>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Schedule & effort</CardTitle><p className="text-xs text-muted-foreground">All dates use {state.timezone}.</p></CardHeader><CardContent className="space-y-5">
          <TaskField id="task-start" label="Starts"><TaskDateInput id="task-start" value={draft.startAt} timezone={state.timezone} onChange={(value) => set("startAt", value)} /></TaskField>
          <TaskField id="task-due" label="Due"><TaskDateInput id="task-due" value={draft.dueAt} timezone={state.timezone} onChange={(value) => set("dueAt", value)} /></TaskField>
          <TaskField id="task-estimate" label="Estimated hours"><Input id="task-estimate" type="number" min={0} step={0.25} value={draft.estimateHours} onChange={(event) => set("estimateHours", Number(event.target.value))} /></TaskField>
          <TaskField id="task-progress" label="Progress (%)" hint="Completion is a separate workflow action."><Input id="task-progress" type="number" min={0} max={100} value={draft.progress} onChange={(event) => set("progress", Number(event.target.value))} /></TaskField>
        </CardContent></Card>
      </div>
    </div>
  </form>;
}
