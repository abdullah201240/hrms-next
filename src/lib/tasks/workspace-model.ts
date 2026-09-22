import { dayKey, emptyTask, isClosed, validateWorkspace } from "./domain";
import type { TaskWorkspace, TaskStatus, TaskDraft } from "./types";
import { CATEGORY_LABELS, STATUS_CATEGORIES, type WorkList, type WorkNode, type WorkOrganization, type WorkPreferences, type WorkScope, type WorkStatus, type WorkView, type WorkspaceState, type WorkspaceTask, type GroupKind, type ViewFilter } from "./workspace-types";

export const WORK_STORAGE_KEY = "hrms-task-workspace-v2";
export const defaultPreferences = (): WorkPreferences => ({ favorites: [], expanded: [], recent: [], lastWorkspaceId: "", dashboard: ["status", "overdue", "progress", "workload", "trend"], drafts: {}, sidebarWidth: 272 });
export const preferenceKey = (actorId: string, workspaceId: string) => `${actorId}:${workspaceId}`;
export const preferencesFor = (state: WorkspaceState, workspaceId: string) => state.preferences[preferenceKey(state.actorId, workspaceId)] ?? defaultPreferences();
export function organizationFor(state: WorkspaceState, id: string) { return state.workspaces.find((w) => w.id === id); }
export function isWorkspaceAdmin(state: WorkspaceState, id: string) { return ["Owner", "Admin"].includes(organizationFor(state, id)?.members[state.actorId] ?? ""); }
export function canWriteWorkspace(state: WorkspaceState, id: string) { const role = organizationFor(state, id)?.members[state.actorId]; return !!role && role !== "Viewer"; }
export function canManageNode(state: WorkspaceState, node: WorkNode) { return canWriteWorkspace(state, node.workspaceId) && (isWorkspaceAdmin(state, node.workspaceId) || node.managerId === state.actorId); }
export function canSeeList(state: WorkspaceState, list: WorkList) { return !!organizationFor(state, list.workspaceId)?.members[state.actorId] && (isWorkspaceAdmin(state, list.workspaceId) || list.memberIds.includes(state.actorId) || list.managerId === state.actorId); }
export function listArchived(state: WorkspaceState, list: WorkList) { return list.archived || state.spaces.find((s) => s.id === list.spaceId)?.archived || state.folders.find((f) => f.id === list.folderId)?.archived || organizationFor(state, list.workspaceId)?.archived; }
export function scopeLists(state: WorkspaceState, scope: WorkScope, archived = false) {
  return state.lists.filter((l) => l.workspaceId === scope.workspaceId && canSeeList(state, l) && (archived || !listArchived(state, l)) && (scope.kind === "workspace" || scope.kind === "space" && l.spaceId === scope.id || scope.kind === "folder" && l.folderId === scope.id || scope.kind === "list" && l.id === scope.id));
}
export const nodeById = (state: WorkspaceState, id: string): WorkNode | undefined => [...state.spaces, ...state.folders, ...state.lists].find((n) => n.id === id);
export const nodeHref = (node: WorkNode) => `/workspaces/${node.workspaceId}/${node.kind}s/${node.id}`;
export const scopeHref = (scope: WorkScope) => scope.kind === "workspace" ? `/workspaces/${scope.workspaceId}/everything` : `/workspaces/${scope.workspaceId}/${scope.kind}s/${scope.id}`;
export function workflowFor(state: WorkspaceState, list: WorkList) {
  const folder = state.folders.find((f) => f.id === list.folderId);
  const space = state.spaces.find((s) => s.id === list.spaceId);
  const id = list.workflowId || folder?.workflowId || space?.workflowId || organizationFor(state, list.workspaceId)?.workflowId;
  const workflow = state.workflows.find((w) => w.id === id && w.workspaceId === list.workspaceId);
  if (!workflow) throw new Error("The List's workflow is missing.");
  return workflow;
}
export function statusesFor(state: WorkspaceState, listId: string): WorkStatus[] {
  const list = state.lists.find((l) => l.id === listId);
  return list ? workflowFor(state, list).statuses : [];
}
export function taskStatus(state: WorkspaceState, task: WorkspaceTask) { return statusesFor(state, task.listId).find((s) => s.id === task.statusId); }
export function taskDraft(task: WorkspaceTask): TaskDraft { const draft = emptyTask(); for (const key of Object.keys(draft) as (keyof TaskDraft)[]) Object.assign(draft, { [key]: task[key] }); return draft; }
export function fieldsFor(state: WorkspaceState, listId: string) { const list = state.lists.find((l) => l.id === listId); return state.fields.filter((f) => !f.archived && (f.scopeId === listId || f.scopeId === list?.spaceId)); }
export function newView(id: string, scope: WorkScope, actorId: string, type: WorkView["type"] = "list"): WorkView {
  return { id, workspaceId: scope.workspaceId, scopeId: scope.id, name: type[0].toUpperCase() + type.slice(1), type, creatorId: actorId, personal: false, position: ["list", "board", "table", "calendar", "timeline"].indexOf(type), isDefault: type === "board", groupBy: "status", swimlane: "none", sort: "manual", filters: [], match: "all", showClosed: true, subtasks: "nested", density: "comfortable", fields: ["status", "assignee", "priority", "due", "estimate"], widths: {}, folded: [], columnOrder: [], ranks: {}, wip: {} };
}
export function addDefaultViews(state: WorkspaceState, scope: WorkScope) {
  for (const type of ["list", "board", "table", "calendar", "timeline"] as const) state.views.push(newView(`${scope.id}-${type}`, scope, state.actorId, type));
}
export function migrateWorkspace(legacy: TaskWorkspace): WorkspaceState {
  const old = structuredClone(legacy);
  const workspaceId = "acme-workspace";
  const workflowId = `${workspaceId}-workflow`;
  const work: WorkOrganization = { id: workspaceId, name: "Acme workspace", color: "#3b82f6", timezone: old.timezone, workflowId, members: Object.fromEntries(old.people.map((p) => [p.id, p.id === old.actorId ? "Owner" : p.admin ? "Admin" : "Member"])), archived: false, createdAt: new Date().toISOString() };
  const state: WorkspaceState = { ...old, version: 2, activeWorkspaceId: workspaceId, workspaces: [work], spaces: [], folders: [], lists: [], projects: [], tasks: [], workflows: [{ id: workflowId, workspaceId, name: "Team workflow", statuses: STATUS_CATEGORIES.map((category, i) => ({ id: `${workflowId}-${i}`, name: CATEGORY_LABELS[category], category, color: ["#64748b", "#3b82f6", "#8b5cf6", "#10b981", "#f43f5e"][i] })) }], views: [], fields: [], preferences: {} };
  for (const project of old.projects) {
    let space = state.spaces.find((s) => s.name === (project.department || "General"));
    if (!space) {
      space = { id: `space-${state.spaces.length + 1}`, kind: "space", workspaceId, name: project.department || "General", description: "A shared home for the team's projects and work.", color: state.spaces.length ? "#8b5cf6" : "#3b82f6", managerId: project.managerId, memberIds: [...project.memberIds], workflowId: "", position: state.spaces.length, archived: false, startAt: null, dueAt: null, health: "On track" };
      state.spaces.push(space);
    } else space.memberIds = [...new Set([...space.memberIds, ...project.memberIds])];
    const list: WorkList = { ...project, kind: "list", workspaceId, spaceId: space.id, folderId: "", color: space.color, workflowId: "", position: state.lists.length, archived: false, health: "On track" };
    state.lists.push(list);
    const fieldId = `${list.id}-legacy-stage`;
    state.fields.push({ id: fieldId, workspaceId, scopeId: list.id, name: "Workflow stage", type: "select", archived: false, options: list.stages.map((s) => ({ id: s.id, label: s.name, color: "#64748b" })) });
    const scope: WorkScope = { kind: "list", id: list.id, workspaceId };
    addDefaultViews(state, scope);
    state.views.push({ ...newView(`${list.id}-legacy`, scope, state.actorId, "board"), name: "Legacy stages", isDefault: false, position: 5, groupBy: `field:${fieldId}` });
  }
  state.tasks = old.tasks.map((task) => ({ ...task, listId: task.projectId, statusId: `${workflowId}-${STATUS_CATEGORIES.indexOf(task.status)}`, checklist: [], watcherIds: [...task.assigneeIds], fields: { [`${task.projectId}-legacy-stage`]: task.stageId }, resources: [] }));
  for (const n of state.notifications) if (n.docType === "Task") { n.workspaceId = workspaceId; n.category = n.title.toLowerCase().includes("review") ? "review" : "activity"; }
  addDefaultViews(state, { kind: "workspace", id: workspaceId, workspaceId });
  for (const space of state.spaces) addDefaultViews(state, { kind: "space", id: space.id, workspaceId });
  state.projects = state.lists;
  state.preferences[preferenceKey(state.actorId, workspaceId)] = { ...defaultPreferences(), expanded: state.spaces.map((s) => s.id), lastWorkspaceId: workspaceId, favorites: state.lists.slice(0, 2).map((l) => l.id) };
  return state;
}

export function serializeWorkspace(state: WorkspaceState) {
  // Lists are persisted once; old components receive the alias after hydration.
  return JSON.stringify({ ...state, projects: undefined });
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export function parseWorkspace(raw: string): WorkspaceState {
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.version !== 2) throw new Error("Unsupported workspace snapshot.");
  for (const key of ["people", "workspaces", "spaces", "folders", "lists", "workflows", "tasks", "views", "fields", "comments", "activities", "notifications", "templates"]) {
    const collection = value[key];
    if (!Array.isArray(collection) || collection.some((item) => !object(item) || typeof item.id !== "string") || new Set(collection.map((item) => item.id)).size !== collection.length) throw new Error(`Invalid ${key} collection.`);
  }
  if (!object(value.preferences)) throw new Error("Invalid workspace preferences.");
  const state = value as unknown as WorkspaceState;
  state.projects = state.lists;
  validateWorkState(state);
  return state;
}
export function validateWorkState(state: WorkspaceState) {
  validateWorkspace(state);
  if (!state.workspaces.some((w) => w.id === state.activeWorkspaceId)) throw new Error("Missing active workspace.");
  const ids = new Set(state.people.map((p) => p.id));
  for (const w of state.workspaces) {
    if (!w.name.trim() || !object(w.members) || !Object.values(w.members).includes("Owner") || Object.entries(w.members).some(([id, role]) => !ids.has(id) || !["Owner", "Admin", "Member", "Viewer"].includes(role))) throw new Error("A workspace needs a name, valid members, and an owner.");
    new Intl.DateTimeFormat("en-US", { timeZone: w.timezone });
    if (!state.workflows.some((flow) => flow.id === w.workflowId && flow.workspaceId === w.id)) throw new Error("Missing workspace workflow.");
  }
  for (const workflow of state.workflows) {
    if (!workflow.name.trim() || !organizationFor(state, workflow.workspaceId) || !Array.isArray(workflow.statuses) || STATUS_CATEGORIES.some((c) => !workflow.statuses.some((s) => s.category === c)) || new Set(workflow.statuses.map((s) => s.id)).size !== workflow.statuses.length || workflow.statuses.some((s) => !s.id || !s.name.trim() || !STATUS_CATEGORIES.includes(s.category) || !/^#[0-9a-f]{6}$/i.test(s.color))) throw new Error("Workflows need unique, named statuses in every category.");
  }
  for (const node of [...state.spaces, ...state.folders, ...state.lists]) {
    const w = organizationFor(state, node.workspaceId);
    if (!w || !node.name.trim() || !Array.isArray(node.memberIds) || !node.memberIds.includes(node.managerId) || node.memberIds.some((id) => !w.members[id]) || !Number.isFinite(node.position) || typeof node.archived !== "boolean") throw new Error("Invalid hierarchy membership or details.");
    if (node.kind !== "space" && !state.spaces.some((s) => s.id === node.spaceId && s.workspaceId === node.workspaceId)) throw new Error("Choose a Space in this workspace.");
    if (node.kind === "list" && node.folderId && !state.folders.some((f) => f.id === node.folderId && f.spaceId === node.spaceId)) throw new Error("The Folder must belong to the List's Space.");
    if (node.workflowId && !state.workflows.some((f) => f.id === node.workflowId && f.workspaceId === node.workspaceId)) throw new Error("Choose a workflow in this workspace.");
  }
  for (const task of state.tasks) {
    const status = taskStatus(state, task);
    if (task.listId !== task.projectId || !status || status.category !== task.status || !Array.isArray(task.checklist) || !Array.isArray(task.watcherIds) || !object(task.fields) || !Array.isArray(task.resources)) throw new Error("Invalid task workspace details.");
    const list = state.lists.find((l) => l.id === task.listId)!;
    if (task.checklist.some((i) => !i.id || !i.title.trim() || typeof i.done !== "boolean" || i.assigneeId && !list.memberIds.includes(i.assigneeId)) || new Set(task.checklist.map((i) => i.id)).size !== task.checklist.length) throw new Error("Checklist items need unique IDs, names, and valid assignees.");
    if (task.resources.some((r) => !r.name.trim() || !/^https?:\/\//i.test(r.url))) throw new Error("Resources need a name and an HTTP(S) URL.");
    for (const [id, value] of Object.entries(task.fields)) {
      const f = state.fields.find((field) => field.id === id);
      if (!f || f.workspaceId !== list.workspaceId || (f.scopeId !== list.id && f.scopeId !== list.spaceId)) throw new Error("A custom field does not belong to this List.");
      if (value === null || value === "") continue;
      if (f.type === "number" ? typeof value !== "number" || !Number.isFinite(value) : f.type === "checkbox" ? typeof value !== "boolean" : typeof value !== "string") throw new Error(`Invalid value for ${f.name}.`);
      if (f.type === "select" && !f.options.some((o) => o.id === value)) throw new Error(`Choose an option for ${f.name}.`);
      if (f.type === "date" && !Number.isFinite(Date.parse(String(value)))) throw new Error(`Invalid date for ${f.name}.`);
    }
  }
  for (const f of state.fields) if (!f.name.trim() || !["text", "number", "date", "select", "checkbox"].includes(f.type) || !nodeById(state, f.scopeId) || !Array.isArray(f.options) || new Set(f.options.map((o) => o.id)).size !== f.options.length) throw new Error("Invalid custom field definition.");
  for (const v of state.views) if (!v.name.trim() || !["list", "board", "table", "calendar", "timeline"].includes(v.type) || !Array.isArray(v.filters) || !Array.isArray(v.fields) || !Array.isArray(v.folded) || !Array.isArray(v.columnOrder) || !object(v.ranks) || !object(v.wip) || !object(v.widths) || !organizationFor(state, v.workspaceId)) throw new Error("Invalid saved view.");
  for (const n of state.notifications) if (typeof n.href !== "string" || !n.href.startsWith("/") || n.href.startsWith("//") || typeof n.read !== "boolean") throw new Error("Invalid notification.");
  for (const p of Object.values(state.preferences)) if (!object(p) || !Array.isArray(p.favorites) || !Array.isArray(p.expanded) || !Array.isArray(p.recent) || !Array.isArray(p.dashboard) || !object(p.drafts) || !Number.isFinite(p.sidebarWidth)) throw new Error("Invalid preferences.");
}

function matches(state: WorkspaceState, task: WorkspaceTask, f: ViewFilter, now: Date, timezone: string) {
  const raw = f.field === "status" ? task.statusId : f.field === "category" ? task.status : f.field === "assignee" ? task.assigneeIds.length ? task.assigneeIds : ["unassigned"] : f.field === "tag" ? task.tags : f.field === "priority" ? task.priority : f.field === "list" ? task.listId : f.field === "space" ? state.lists.find((l) => l.id === task.listId)?.spaceId : f.field === "due" ? task.dueAt : f.field === "start" ? task.startAt : f.field === "blocked" ? String(task.dependencyIds.some((id) => state.tasks.some((t) => t.id === id && !isClosed(t)))) : f.field === "review" ? String(task.reviewRequired) : f.field.startsWith("field:") ? task.fields[f.field.slice(6)] : task.subject;
  if (f.field === "due" && ["overdue", "today", "upcoming", "none"].includes(f.value)) {
    const due = task.dueAt;
    return f.value === "none" ? !due : !!due && !isClosed(task) && (f.value === "overdue" ? Date.parse(due) < now.getTime() : f.value === "today" ? dayKey(due, timezone) === dayKey(now, timezone) : Date.parse(due) > now.getTime());
  }
  const values = (Array.isArray(raw) ? raw : [raw ?? ""]).map(String);
  if (f.operator === "is-not") return !values.includes(f.value);
  if (f.operator === "contains") return values.some((v) => v.toLowerCase().includes(f.value.toLowerCase()));
  if (f.operator === "before" || f.operator === "after") return !!raw && (f.operator === "before" ? String(raw).slice(0, 10) <= f.value : String(raw).slice(0, 10) >= f.value);
  return values.includes(f.value);
}
export function selectTasks(state: WorkspaceState, scope: WorkScope, view?: WorkView, query = "", now = new Date()) {
  const listIds = new Set(scopeLists(state, scope).map((l) => l.id));
  const timezone = organizationFor(state, scope.workspaceId)?.timezone ?? state.timezone;
  const tasks = state.tasks.filter((t) => listIds.has(t.listId) && !t.archived && (!view || (view.showClosed || !isClosed(t)) && (view.subtasks !== "hidden" || !t.parentId)) && `${t.code} ${t.subject} ${t.description} ${t.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (!view?.filters.length || (view.match === "all" ? view.filters.every((f) => matches(state, t, f, now, timezone)) : view.filters.some((f) => matches(state, t, f, now, timezone)))));
  return tasks.sort((a, b) => view?.sort === "name" ? a.subject.localeCompare(b.subject) : view?.sort === "due" ? (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999") : view?.sort === "priority" ? ["Urgent", "High", "Medium", "Low"].indexOf(a.priority) - ["Urgent", "High", "Medium", "Low"].indexOf(b.priority) : (view?.ranks[a.id] ?? a.position) - (view?.ranks[b.id] ?? b.position));
}
export interface TaskGroup { id: string; name: string; color: string }
export function groupsFor(state: WorkspaceState, scope: WorkScope, groupBy: GroupKind): TaskGroup[] {
  const lists = scopeLists(state, scope);
  if (groupBy === "priority") return ["Urgent", "High", "Medium", "Low"].map((name, i) => ({ id: name, name, color: ["#f43f5e", "#f59e0b", "#3b82f6", "#64748b"][i] }));
  if (groupBy === "assignee") return [{ id: "unassigned", name: "Unassigned", color: "#64748b" }, ...state.people.filter((p) => lists.some((l) => l.memberIds.includes(p.id))).map((p) => ({ id: p.id, name: p.name, color: "#8b5cf6" }))];
  if (groupBy === "list") return lists.map((l) => ({ id: l.id, name: l.name, color: l.color }));
  if (groupBy.startsWith("field:")) return [{ id: "unset", name: "No value", color: "#64748b" }, ...(state.fields.find((f) => f.id === groupBy.slice(6))?.options.map((o) => ({ id: o.id, name: o.label, color: o.color })) ?? [])];
  const workflows = [...new Set(lists.map((l) => workflowFor(state, l).id))];
  return workflows.length === 1 ? state.workflows.find((w) => w.id === workflows[0])!.statuses.map((s) => ({ id: s.id, name: s.name, color: s.color })) : STATUS_CATEGORIES.map((c, i) => ({ id: c, name: CATEGORY_LABELS[c], color: ["#64748b", "#3b82f6", "#8b5cf6", "#10b981", "#f43f5e"][i] }));
}
export function taskGroup(task: WorkspaceTask, groupBy: GroupKind, groups: TaskGroup[]) { return groupBy === "priority" ? task.priority : groupBy === "assignee" ? task.assigneeIds[0] ?? "unassigned" : groupBy === "list" ? task.listId : groupBy.startsWith("field:") ? String(task.fields[groupBy.slice(6)] || "unset") : groups.some((g) => g.id === task.statusId) ? task.statusId : task.status; }
export function workProgress(tasks: WorkspaceTask[]) { const leaves = tasks.filter((t) => !t.archived && t.status !== "Cancelled" && !t.isGroup && !tasks.some((child) => child.parentId === t.id)); const done = leaves.filter((t) => t.status === "Completed").length; return { total: leaves.length, done, percent: leaves.length ? Math.round(done / leaves.length * 100) : 0 }; }
