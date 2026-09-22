"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { type ProjectTemplate, type TaskWorkspace } from "@/lib/tasks/types";
import { personOptions, TaskBoundary, TaskDateInput, TaskField, TaskLink } from "./task-shared";

export function ProjectTemplatesPage() { return <TaskBoundary>{(state) => <ProjectTemplates state={state} />}</TaskBoundary>; }
function ProjectTemplates({ state }: { state: TaskWorkspace }) {
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  return <div className="space-y-6"><PageHeader title="Project templates" icon={Layers} description="Start with a proven checklist, then make it yours." backHref="/projects"><TaskLink href="/projects/new">Start from scratch</TaskLink></PageHeader>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{state.templates.map((item) => <Card key={item.id}><CardHeader><div className="mb-3 flex items-center justify-between"><div className="chip bg-primary/10 p-3 text-primary"><Copy className="size-5" /></div><Badge variant="outline">{item.category}</Badge></div><CardTitle>{item.name}</CardTitle><p className="text-sm text-muted-foreground">{item.description}</p></CardHeader><CardContent className="space-y-5"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{item.tasks.length} tasks</Badge><Badge variant="secondary">{item.roles.length} roles</Badge><Badge variant="secondary">{item.stages.length} stages</Badge></div><ol className="space-y-2">{item.tasks.slice(0, 3).map((task) => <li key={task.key} className="text-xs text-muted-foreground">✓ {task.subject}</li>)}{item.tasks.length > 3 && <li className="text-xs text-muted-foreground">+ {item.tasks.length - 3} more tasks</li>}</ol><Button className="w-full" variant="outline" onClick={() => setTemplate(item)}>Preview & use template <ArrowRight className="size-4" /></Button></CardContent></Card>)}</div>
    <p className="text-xs text-muted-foreground">Templates create independent demo projects. They do not submit onboarding or separation records. Dates use elapsed calendar-day offsets; holidays are not scheduled automatically.</p>
    {template && <TemplateDialog key={template.id} state={state} template={template} onClose={() => setTemplate(null)} />}
  </div>;
}
function TemplateDialog({ state, template, onClose }: { state: TaskWorkspace; template: ProjectTemplate; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(`${template.name} project`);
  const [start, setStart] = useState<string | null>(new Date().toISOString());
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{template.name}</DialogTitle><DialogDescription>Preview the work and choose who fills each role. All copied tasks start Open with fresh IDs.</DialogDescription></DialogHeader>
    <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Role</TableHead><TableHead>Schedule</TableHead><TableHead>Depends on</TableHead></TableRow></TableHeader><TableBody>{template.tasks.map((task) => <TableRow key={task.key}><TableCell className="min-w-48 text-xs">{task.parentKey && "↳ "}{task.subject}{task.isGroup && <Badge variant="outline" className="ml-2">Group</Badge>}</TableCell><TableCell className="text-xs">{task.role}</TableCell><TableCell className="whitespace-nowrap text-xs">Day {task.startDay}–{task.startDay + task.durationDays}</TableCell><TableCell className="text-xs">{task.dependencyKeys.map((key) => template.tasks.find((item) => item.key === key)?.subject).join(", ") || "—"}</TableCell></TableRow>)}</TableBody></Table></div>
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!start || created) return; const projectId = crypto.randomUUID(); if (runTaskCommand({ kind: "create-from-template", templateId: template.id, projectId, name, startAt: start, roleMembers: roles }, "Project created from template")) { setCreated(true); router.push(`/projects/${projectId}`); } else setError("The project was not created. Check role assignments and the validation message."); }}>
      <div className="grid gap-4 sm:grid-cols-2"><TaskField id="template-project-name" label="Project name *"><Input id="template-project-name" required value={name} onChange={(event) => setName(event.target.value)} /></TaskField><TaskField id="template-project-start" label={`Start · ${state.timezone}`}><TaskDateInput id="template-project-start" value={start} timezone={state.timezone} onChange={setStart} /></TaskField></div>
      {template.roles.map((role, index) => <TaskField key={role} id={`template-role-${index}`} label={`${role} *`}><SearchSelect id={`template-role-${index}`} multiple value={roles[role] ?? []} options={personOptions(state)} placeholder={`Assign ${role}`} onChange={(value) => setRoles({ ...roles, [role]: value })} /></TaskField>)}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={created || !start || template.roles.some((role) => !roles[role]?.length)}>Create project</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}
