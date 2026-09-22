import { DEFAULT_STAGES, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES, WORKSPACE_TIMEZONES, type CommandContext, type ProjectDraft, type TaskCommand, type TaskDraft, type TaskProject, type TaskStatus, type TaskWorkspace, type WorkTask } from "./types";

export class TaskRuleError extends Error {}
function fail(message: string): never { throw new TaskRuleError(message); }
export const isClosed = (task: Pick<WorkTask, "status">) => task.status === "Completed" || task.status === "Cancelled";
export const personName = (state: TaskWorkspace, id: string) => state.people.find((p) => p.id === id)?.name ?? "Unassigned";
export const canManage = (state: TaskWorkspace, project: TaskProject) => state.people.find((p) => p.id === state.actorId)?.admin === true || project.managerId === state.actorId;
export const canViewProject = (state: TaskWorkspace, project: TaskProject) => canManage(state, project) || project.memberIds.includes(state.actorId);
export const canEditTask = (state: TaskWorkspace, task: WorkTask) => {
  const project = state.projects.find((p) => p.id === task.projectId);
  return !!project && canViewProject(state, project) && (canManage(state, project) || task.createdBy === state.actorId || task.assigneeIds.includes(state.actorId));
};
export const blockedBy = (state: TaskWorkspace, task: WorkTask) => state.tasks.filter((t) => task.dependencyIds.includes(t.id) && !isClosed(t));
export const isOverdue = (task: WorkTask, now: Date) => !isClosed(task) && !task.archived && !!task.dueAt && new Date(task.dueAt).getTime() < now.getTime();
export function dayKey(value: string | Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  return ["year", "month", "day"].map((key) => parts.find((p) => p.type === key)?.value).join("-");
}
export function formatTaskDate(value: string | null, timezone: string, time = false) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } as const : {}) }).format(new Date(value));
}
/** datetime-local values are explicitly in the workspace timezone, not the browser timezone. */
export function toLocalInput(value: string | null, timezone: string) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
  const part = (key: string) => parts.find((p) => p.type === key)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
export function fromLocalInput(value: string, timezone: string): string | null {
  if (!value) return null;
  const target = Date.parse(`${value}:00Z`);
  if (!Number.isFinite(target)) fail("Enter a valid date and time.");
  let utc = target;
  for (let i = 0; i < 4; i++) {
    const displayed = Date.parse(`${toLocalInput(new Date(utc).toISOString(), timezone)}:00Z`);
    const correction = target - displayed;
    if (correction === 0) return new Date(utc).toISOString();
    utc += correction;
  }
  return fail("This local time does not exist because of a daylight-saving change. Choose another time.");
}
export function projectProgress(state: TaskWorkspace, projectId: string) {
  const tasks = state.tasks.filter((t) => t.projectId === projectId && !t.isGroup);
  const eligible = tasks.filter((t) => t.status !== "Cancelled");
  const completed = eligible.filter((t) => t.status === "Completed").length;
  return { total: tasks.length, completed, cancelled: tasks.length - eligible.length, percent: eligible.length ? Math.round(completed / eligible.length * 100) : 0 };
}
export function emptyTask(project?: TaskProject): TaskDraft {
  return { subject: "", description: "", projectId: project?.id ?? "", stageId: project?.stages[0]?.id ?? "", priority: "Medium", type: "General", assigneeIds: [], reviewerId: project?.managerId ?? "", reviewRequired: false, tags: [], startAt: null, dueAt: null, estimateHours: 0, progress: 0, isGroup: false, parentId: "", dependencyIds: [] };
}
function validDate(value: string | null) { return value === null || (typeof value === "string" && Number.isFinite(Date.parse(value))); }
function dateRange(start: string | null, end: string | null, label: string) {
  if (!validDate(start) || !validDate(end)) fail(`${label}: invalid date.`);
  if (start && end && Date.parse(start) > Date.parse(end)) fail(`${label}: start must not be after the due date.`);
}
function assertGraph(state: TaskWorkspace) {
  const edges = new Map(state.tasks.map((t) => [t.id, [...t.dependencyIds, ...state.tasks.filter((child) => child.parentId === t.id).map((child) => child.id)]]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) fail("This relationship creates a circular dependency or parent hierarchy.");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of edges.get(id) ?? []) visit(next);
    visiting.delete(id);
    visited.add(id);
  }
  for (const task of state.tasks) visit(task.id);
}
export function validateWorkspace(state: TaskWorkspace) {
  if (!state.people.some((p) => p.id === state.actorId)) fail("Choose a valid demo employee.");
  if (!(WORKSPACE_TIMEZONES as readonly string[]).includes(state.timezone)) fail("Choose a supported timezone.");
  for (const project of state.projects) {
    if (!project.name.trim()) fail("Project name is required.");
    if (!PROJECT_STATUSES.includes(project.status)) fail("Invalid project status.");
    if (!project.stages.length || project.stages.some((s) => !s.name.trim())) fail("A project needs at least one named stage.");
    if (new Set(project.stages.map((s) => s.id)).size !== project.stages.length) fail("Stage IDs must be unique.");
    if (!project.memberIds.includes(project.managerId)) fail("The project manager must be a member.");
    if (project.memberIds.some((id) => !state.people.some((p) => p.id === id))) fail("Unknown project member.");
    dateRange(project.startAt, project.dueAt, project.name);
  }
  for (const task of state.tasks) {
    const project = state.projects.find((p) => p.id === task.projectId);
    if (!project) fail("Choose an existing project.");
    if (!task.subject.trim() || task.subject.length > 255) fail("Task subject is required and must be 255 characters or fewer.");
    if (!TASK_STATUSES.includes(task.status) || !TASK_PRIORITIES.includes(task.priority)) fail("Invalid task status or priority.");
    if (!project.stages.some((s) => s.id === task.stageId)) fail("Choose a stage belonging to this project.");
    if (!Number.isFinite(task.estimateHours) || task.estimateHours < 0) fail("Estimated hours must be zero or more.");
    if (!Number.isFinite(task.progress) || task.progress < 0 || task.progress > 100) fail("Progress must be between 0 and 100.");
    if (task.status === "Completed" && task.progress !== 100) fail("Completed tasks must have 100% progress.");
    if (task.assigneeIds.some((id) => !project.memberIds.includes(id))) fail("Assignees must be members of the selected project.");
    if (task.reviewerId && !project.memberIds.includes(task.reviewerId)) fail("The reviewer must be a project member.");
    if (task.reviewRequired && !task.reviewerId) fail("Select a reviewer when review is required.");
    dateRange(task.startAt, task.dueAt, task.subject);
    for (const date of [task.startAt, task.dueAt]) {
      if (date && project.startAt && Date.parse(date) < Date.parse(project.startAt)) fail("Task dates cannot precede the project start.");
      if (date && project.dueAt && Date.parse(date) > Date.parse(project.dueAt)) fail("Task dates cannot exceed the project due date.");
    }
    if (task.parentId) {
      const parent = state.tasks.find((t) => t.id === task.parentId);
      if (!parent || !parent.isGroup || parent.projectId !== task.projectId || parent.id === task.id) fail("Choose a group parent in the same project.");
      if (task.dueAt && parent.dueAt && Date.parse(task.dueAt) > Date.parse(parent.dueAt)) fail("A subtask cannot be due after its parent.");
      if (task.startAt && parent.startAt && Date.parse(task.startAt) < Date.parse(parent.startAt)) fail("A subtask cannot start before its parent.");
      if (parent.status === "Completed" && !isClosed(task)) fail("Reopen the parent before adding or reopening an unfinished subtask.");
    }
    for (const id of task.dependencyIds) {
      const dependency = state.tasks.find((t) => t.id === id);
      if (!dependency || dependency.id === task.id || dependency.projectId !== task.projectId) fail("Dependencies must be other tasks in the same project.");
    }
    if (["Working", "Pending Review", "Completed"].includes(task.status) && blockedBy(state, task).length) fail(`Resolve the dependencies of “${task.subject}” before starting or completing it.`);
  }
  assertGraph(state);
}
function taskById(state: TaskWorkspace, id: string) { return state.tasks.find((t) => t.id === id) ?? fail("Task not found."); }
function projectById(state: TaskWorkspace, id: string) { return state.projects.find((p) => p.id === id) ?? fail("Project not found."); }
function assertAccess(state: TaskWorkspace, task: WorkTask) {
  if (!canViewProject(state, projectById(state, task.projectId))) fail("This demo employee is not a member of this project.");
}
function assertEdit(state: TaskWorkspace, task: WorkTask) {
  assertAccess(state, task);
  if (!canEditTask(state, task)) fail("Only the task creator, an assignee, or the project manager can edit this task.");
  if (isClosed(task) || task.archived) fail("Reopen the task before editing it.");
}
function activity(state: TaskWorkspace, task: WorkTask, message: string, ctx: CommandContext) {
  task.updatedAt = ctx.now;
  state.activities.push({ id: ctx.newId(), taskId: task.id, actorId: state.actorId, message, at: ctx.now });
}
function notify(state: TaskWorkspace, task: WorkTask, recipients: string[], title: string, ctx: CommandContext) {
  for (const recipientId of new Set(recipients.filter((id) => id && id !== state.actorId))) {
    state.notifications.unshift({ id: ctx.newId(), recipientId, title, body: `${task.code} · ${task.subject}`, from: personName(state, state.actorId), docType: "Task", when: ctx.now, read: false, href: `/tasks/${task.id}` });
  }
}
function transition(state: TaskWorkspace, task: WorkTask, status: TaskStatus, ctx: CommandContext) {
  assertAccess(state, task);
  if (task.archived) fail("Unarchive the task first.");
  if (task.status === status) return;
  const project = projectById(state, task.projectId);
  const manager = canManage(state, project);
  const reviewer = task.reviewerId === state.actorId || manager;
  if (isClosed(task)) {
    if (!manager || status !== "Open") fail("Only a manager can reopen a closed task to Open.");
    task.completedAt = null;
    task.completedBy = null;
    task.progress = 0;
  } else if (status === "Cancelled") {
    if (!manager) fail("Only the project manager can cancel a task.");
  } else {
    if (!canEditTask(state, task) && !(task.status === "Pending Review" && reviewer)) fail("This demo employee cannot change this task's status.");
    const allowed: Record<string, TaskStatus[]> = { Open: ["Working", "Completed"], Working: ["Open", "Pending Review", "Completed"], "Pending Review": ["Working", "Completed"] };
    if (!allowed[task.status]?.includes(status)) fail(`Cannot move directly from ${task.status} to ${status}.`);
    if (task.status === "Pending Review" && !reviewer) fail("Only the reviewer or manager can finish review or request changes.");
    if (status === "Pending Review" && !task.reviewerId) fail("Select a reviewer before requesting review.");
    if (status === "Completed") {
      if (task.reviewRequired && (task.status !== "Pending Review" || !reviewer)) fail("This task requires approval from its reviewer or manager.");
      if (state.tasks.some((child) => child.parentId === task.id && !isClosed(child))) fail("Complete or cancel every subtask first.");
      task.progress = 100;
      task.completedAt = ctx.now;
      task.completedBy = state.actorId;
    }
  }
  const previous = task.status;
  task.status = status;
  activity(state, task, `${previous} → ${status}`, ctx);
  notify(state, task, status === "Pending Review" ? [task.reviewerId, project.managerId] : task.assigneeIds, status === "Pending Review" ? "Task ready for review" : `Task ${status.toLowerCase()}`, ctx);
}
function insertTask(state: TaskWorkspace, id: string, draft: TaskDraft, ctx: CommandContext) {
  const task: WorkTask = { ...draft, id, code: `TASK-${String(state.nextTaskNumber++).padStart(4, "0")}`, status: "Open", createdBy: state.actorId, createdAt: ctx.now, updatedAt: ctx.now, completedAt: null, completedBy: null, archived: false, position: state.tasks.length };
  state.tasks.push(task);
  activity(state, task, "Created task", ctx);
  notify(state, task, task.assigneeIds, "You were assigned a task", ctx);
  return task;
}
/** Pure, atomic demo commands. No network calls, database writes, or authentication. */
export function applyTaskCommand(source: TaskWorkspace, command: TaskCommand, ctx: CommandContext): TaskWorkspace {
  const state = structuredClone(source);
  switch (command.kind) {
    case "actor": state.actorId = command.id; break;
    case "timezone": state.timezone = command.timezone; break;
    case "read-notifications":
      state.notifications.forEach((n) => { if (command.ids.includes(n.id) && n.recipientId === state.actorId) n.read = true; });
      break;
    case "save-task": {
      const project = projectById(state, command.draft.projectId);
      if (!canViewProject(state, project)) fail("Join this project before creating a task.");
      const draft = { ...command.draft, subject: command.draft.subject.trim(), assigneeIds: [...new Set(command.draft.assigneeIds)], dependencyIds: [...new Set(command.draft.dependencyIds)], tags: [...new Set(command.draft.tags.map((t) => t.trim()).filter(Boolean))] };
      const existing = state.tasks.find((t) => t.id === command.id);
      if (existing) {
        assertEdit(state, existing);
        if (existing.projectId !== draft.projectId) fail("Existing tasks cannot be moved between projects.");
        if (!canManage(state, project) && (JSON.stringify([...existing.dependencyIds].sort()) !== JSON.stringify([...draft.dependencyIds].sort()) || existing.parentId !== draft.parentId)) fail("Only a manager can change task relationships.");
        const added = draft.assigneeIds.filter((id) => !existing.assigneeIds.includes(id));
        Object.assign(existing, draft);
        activity(state, existing, "Updated task details", ctx);
        notify(state, existing, added, "You were assigned a task", ctx);
      } else {
        if (!canManage(state, project) && (draft.dependencyIds.length || draft.parentId)) fail("Only a manager can set task relationships.");
        insertTask(state, command.id, draft, ctx);
      }
      break;
    }
    case "transition":
      for (const id of new Set(command.ids)) transition(state, taskById(state, id), command.status, ctx);
      break;
    case "assign":
      for (const id of new Set(command.ids)) {
        const task = taskById(state, id);
        assertEdit(state, task);
        const added = command.assigneeIds.filter((person) => !task.assigneeIds.includes(person));
        task.assigneeIds = [...new Set(command.assigneeIds)];
        activity(state, task, `Assigned to ${task.assigneeIds.map((person) => personName(state, person)).join(", ") || "nobody"}`, ctx);
        notify(state, task, added, "You were assigned a task", ctx);
      }
      break;
    case "move": {
      const task = taskById(state, command.id);
      assertEdit(state, task);
      const project = projectById(state, task.projectId);
      const stage = project.stages.find((s) => s.id === command.stageId) ?? fail("Stage not found.");
      const siblings = state.tasks.filter((t) => t.id !== task.id && t.projectId === project.id && t.stageId === stage.id).sort((a, b) => a.position - b.position);
      const index = command.beforeId ? siblings.findIndex((t) => t.id === command.beforeId) : -1;
      siblings.splice(index < 0 ? siblings.length : index, 0, task);
      siblings.forEach((t, position) => { t.position = position; });
      task.stageId = stage.id;
      activity(state, task, `Moved to ${stage.name}`, ctx);
      break;
    }
    case "archive": {
      const task = taskById(state, command.id);
      if (!canManage(state, projectById(state, task.projectId))) fail("Only a manager can archive tasks.");
      if (!isClosed(task)) fail("Only completed or cancelled tasks can be archived.");
      task.archived = command.archived;
      activity(state, task, command.archived ? "Archived task" : "Unarchived task", ctx);
      break;
    }
    case "comment": {
      const task = taskById(state, command.taskId);
      assertAccess(state, task);
      if (!command.body.trim() || command.body.length > 5000) fail("Comments must contain 1–5,000 characters.");
      state.comments.push({ id: ctx.newId(), taskId: task.id, actorId: state.actorId, body: command.body.trim(), at: ctx.now });
      notify(state, task, [...task.assigneeIds, task.createdBy], "New task comment", ctx);
      break;
    }
    case "save-project": {
      const existing = state.projects.find((p) => p.id === command.id);
      if (existing && !canManage(state, existing)) fail("Only the project manager can change project settings.");
      if (!existing && !state.people.find((p) => p.id === state.actorId)?.admin && command.draft.managerId !== state.actorId) fail("Choose yourself as the manager of your new project.");
      const draft: ProjectDraft = { ...command.draft, name: command.draft.name.trim(), memberIds: [...new Set([...command.draft.memberIds, command.draft.managerId])] };
      if (draft.status === "Completed" && state.tasks.some((t) => t.projectId === command.id && !isClosed(t))) fail("Finish or cancel this project's tasks before closing it.");
      if (existing) Object.assign(existing, draft);
      else state.projects.push({ ...draft, id: command.id, createdAt: ctx.now });
      break;
    }
    case "save-template": {
      const project = projectById(state, command.projectId);
      if (!canManage(state, project)) fail("Only the project manager can save a template.");
      if (!command.name.trim()) fail("Template name is required.");
      const tasks = state.tasks.filter((t) => t.projectId === project.id && !t.archived);
      if (tasks.some((t) => t.dependencyIds.some((id) => !tasks.some((other) => other.id === id)) || (t.parentId && !tasks.some((other) => other.id === t.parentId)))) fail("Unarchive referenced tasks before saving this template.");
      const base = Date.parse(project.startAt ?? ctx.now);
      state.templates.push({ id: ctx.newId(), name: command.name.trim(), description: project.description, category: "Saved project", roles: ["Project team"], stages: project.stages.map((s) => s.name), tasks: tasks.map((t) => ({ key: t.id, subject: t.subject, description: t.description, role: "Project team", priority: t.priority, estimateHours: t.estimateHours, startDay: Math.max(0, Math.round((Date.parse(t.startAt ?? project.startAt ?? ctx.now) - base) / 86400000)), durationDays: t.startAt && t.dueAt ? Math.max(0, Math.ceil((Date.parse(t.dueAt) - Date.parse(t.startAt)) / 86400000)) : 1, stageIndex: project.stages.findIndex((s) => s.id === t.stageId), isGroup: t.isGroup, parentKey: t.parentId, dependencyKeys: t.dependencyIds })) });
      break;
    }
    case "create-from-template": {
      const template = state.templates.find((t) => t.id === command.templateId) ?? fail("Template not found.");
      if (state.projects.some((p) => p.id === command.projectId)) fail("This project was already created.");
      if (!command.name.trim() || !validDate(command.startAt)) fail("Project name and valid start date are required.");
      if (template.roles.some((role) => !command.roleMembers[role]?.length)) fail("Select team members for every template role.");
      const stages = template.stages.map((name) => ({ id: ctx.newId(), name, folded: false }));
      const project: TaskProject = { id: command.projectId, name: command.name.trim(), description: template.description, department: state.people.find((p) => p.id === state.actorId)?.department ?? "", managerId: state.actorId, memberIds: [...new Set([state.actorId, ...Object.values(command.roleMembers).flat()])], status: "Open", startAt: command.startAt, dueAt: null, stages, templateId: template.id, createdAt: ctx.now };
      state.projects.push(project);
      const ids = new Map(template.tasks.map((t) => [t.key, ctx.newId()]));
      for (const item of template.tasks) {
        const startAt = new Date(Date.parse(command.startAt) + item.startDay * 86400000).toISOString();
        const dueAt = new Date(Date.parse(startAt) + item.durationDays * 86400000).toISOString();
        insertTask(state, ids.get(item.key)!, { ...emptyTask(project), subject: item.subject, description: item.description, priority: item.priority, estimateHours: item.estimateHours, stageId: stages[item.stageIndex]?.id ?? stages[0].id, assigneeIds: command.roleMembers[item.role] ?? [], startAt, dueAt, isGroup: item.isGroup, parentId: ids.get(item.parentKey) ?? "", dependencyIds: item.dependencyKeys.map((key) => ids.get(key) ?? fail("Template dependency is missing.")) }, ctx);
      }
      break;
    }
  }
  validateWorkspace(state);
  return state;
}
export function newProjectDraft(actorId: string, newId: () => string): ProjectDraft {
  return { name: "", description: "", department: "", managerId: actorId, memberIds: [actorId], status: "Open", startAt: null, dueAt: null, stages: DEFAULT_STAGES.map((name) => ({ id: newId(), name, folded: false })) };
}
