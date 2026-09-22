import { applyTaskCommand, canEditTask, canManage, emptyTask, isClosed, personName } from "./domain";
import { createWorkspaceDemo } from "../mock/data-workspace";
import { addDefaultViews, canManageNode, canSeeList, canWriteWorkspace, defaultPreferences, fieldsFor, isWorkspaceAdmin, listArchived, nodeById, organizationFor, preferenceKey, preferencesFor, statusesFor, taskDraft, validateWorkState, workflowFor } from "./workspace-model";
import { CATEGORY_LABELS, STATUS_CATEGORIES, type WorkList, type WorkNode, type WorkspaceCommand, type WorkspaceState, type WorkspaceTask } from "./workspace-types";
import type { CommandContext, TaskCommand } from "./types";

function fail(message: string): never { throw new Error(message); }
const taskById = (s: WorkspaceState, id: string) => s.tasks.find((t) => t.id === id) ?? fail("Task not found.");
function listById(s: WorkspaceState, id: string) { return s.lists.find((l) => l.id === id) ?? fail("List not found."); }
function writable(s: WorkspaceState, id: string) { if (!canWriteWorkspace(s, id)) fail("This demo member has read-only access."); }
function editable(s: WorkspaceState, t: WorkspaceTask, terminal = false) {
  const list = listById(s, t.listId);
  writable(s, list.workspaceId);
  if (!canEditTask(s, t) || listArchived(s, list)) fail("You cannot edit this task in the current demo role or archived location.");
  if (!terminal && (isClosed(t) || t.archived)) fail("Reopen or restore this task before editing it.");
}
function log(s: WorkspaceState, t: WorkspaceTask, message: string, ctx: CommandContext) { t.updatedAt = ctx.now; s.activities.push({ id: ctx.newId(), taskId: t.id, actorId: s.actorId, message, at: ctx.now }); }
function notify(s: WorkspaceState, t: WorkspaceTask, people: string[], title: string, category: "mention" | "activity", ctx: CommandContext) {
  const list = listById(s, t.listId);
  for (const id of new Set(people)) if (id !== s.actorId && list.memberIds.includes(id)) s.notifications.unshift({ id: ctx.newId(), recipientId: id, title, body: `${t.code} · ${t.subject}`, from: personName(s, s.actorId), docType: "Task", when: ctx.now, read: false, workspaceId: list.workspaceId, category, href: `/workspaces/${list.workspaceId}/tasks/${t.id}` });
}
function adaptLegacy(s: WorkspaceState, command: TaskCommand, ctx: CommandContext): WorkspaceState {
  const next = applyTaskCommand(s, command, ctx) as WorkspaceState;
  // Legacy commands preserve extension properties while operating on the List alias.
  next.lists = next.projects;
  for (const t of next.tasks) {
    t.listId = t.projectId;
    t.checklist ??= []; t.watcherIds ??= []; t.fields ??= {}; t.resources ??= [];
    const statuses = statusesFor(next, t.listId);
    if (!statuses.some((status) => status.id === t.statusId && status.category === t.status)) t.statusId = statuses.find((status) => status.category === t.status)?.id ?? "";
  }
  for (const n of next.notifications) if (n.docType === "Task" && !n.workspaceId) {
    const task = next.tasks.find((t) => n.href.endsWith(`/${t.id}`));
    if (task) { n.workspaceId = listById(next, task.listId).workspaceId; n.category = n.title.toLowerCase().includes("review") ? "review" : n.title.toLowerCase().includes("assigned") ? "assignment" : "activity"; }
  }
  return next;
}
function remapStatuses(before: WorkspaceState, next: WorkspaceState, map: Record<string, string>) {
  for (const t of next.tasks) {
    const current = statusesFor(next, t.listId);
    if (current.some((s) => s.id === t.statusId && s.category === t.status)) continue;
    const old = taskById(before, t.id);
    const target = current.find((s) => s.id === map[old.statusId] && s.category === old.status);
    if (!target) fail(`Map the ${CATEGORY_LABELS[t.status]} status for ${t.code} before changing workflows.`);
    t.statusId = target.id;
  }
}
/** One command (including a batch) is validated completely before the store publishes it. */
export function applyWorkspaceCommand(source: WorkspaceState, command: WorkspaceCommand, ctx: CommandContext): WorkspaceState {
  let s = structuredClone(source);
  s.projects = s.lists;
  if (command.kind === "work-batch") {
    for (const c of command.commands) s = applyWorkspaceCommand(s, c, ctx);
    return s;
  }
  switch (command.kind) {
    case "work-switch": {
      const w = organizationFor(s, command.workspaceId);
      if (!w?.members[s.actorId] || w.archived) fail("Choose an accessible workspace.");
      s.activeWorkspaceId = w.id; s.timezone = w.timezone;
      const key = preferenceKey(s.actorId, w.id);
      s.preferences[key] = { ...preferencesFor(s, w.id), lastWorkspaceId: w.id };
      break;
    }
    case "work-create": {
      if (!command.name.trim()) fail("Workspace name is required.");
      const id = ctx.newId();
      if (command.sample) {
        const sample = createWorkspaceDemo(new Date(ctx.now));
        const keys = ["workspaces", "spaces", "folders", "lists", "tasks", "workflows", "fields", "views", "comments", "activities"] as const;
        const map = new Map<string, string>();
        for (const key of keys) for (const item of sample[key]) map.set(item.id, ctx.newId());
        for (const w of sample.workflows) for (const status of w.statuses) map.set(status.id, ctx.newId());
        for (const f of sample.fields) for (const option of f.options) map.set(option.id, ctx.newId());
        map.set(sample.workspaces[0].id, id);
        const remap = (v: unknown): unknown => typeof v === "string" ? map.get(v) ?? (v.startsWith("field:") ? `field:${map.get(v.slice(6)) ?? v.slice(6)}` : v) : Array.isArray(v) ? v.map(remap) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, value]) => [map.get(k) ?? k, remap(value)])) : v;
        for (const key of keys) (s[key] as unknown[]).push(...remap(sample[key]) as unknown[]);
        const work = organizationFor(s, id)!; work.name = command.name.trim(); work.members[s.actorId] = "Owner";
        for (const t of s.tasks.filter((t) => listById(s, t.listId).workspaceId === id)) t.code = `TASK-${String(s.nextTaskNumber++).padStart(4, "0")}`;
      } else {
        const workflowId = ctx.newId();
        s.workspaces.push({ id, name: command.name.trim(), color: "#3b82f6", timezone: s.timezone, workflowId, members: { [s.actorId]: "Owner" }, archived: false, createdAt: ctx.now });
        s.workflows.push({ id: workflowId, workspaceId: id, name: "Team workflow", statuses: STATUS_CATEGORIES.map((category, i) => ({ id: ctx.newId(), category, name: CATEGORY_LABELS[category], color: ["#64748b", "#3b82f6", "#8b5cf6", "#10b981", "#f43f5e"][i] })) });
        addDefaultViews(s, { kind: "workspace", workspaceId: id, id });
      }
      s.activeWorkspaceId = id;
      s.preferences[preferenceKey(s.actorId, id)] = { ...defaultPreferences(), expanded: [...s.spaces, ...s.folders].filter((n) => n.workspaceId === id).map((n) => n.id), lastWorkspaceId: id };
      break;
    }
    case "work-settings": {
      if (!isWorkspaceAdmin(s, command.workspaceId)) fail("Only workspace owners or admins can change these settings.");
      const work = organizationFor(s, command.workspaceId)!;
      if (work.members[s.actorId] !== "Owner" && Object.entries(work.members).some(([id, role]) => role === "Owner" && command.members[id] !== "Owner")) fail("Only owners can change workspace ownership.");
      Object.assign(work, { name: command.name.trim(), color: command.color, timezone: command.timezone, members: command.members });
      if (s.activeWorkspaceId === work.id) s.timezone = work.timezone;
      break;
    }
    case "work-preferences": {
      if (!organizationFor(s, command.workspaceId)?.members[s.actorId]) fail("Workspace access required.");
      const key = preferenceKey(s.actorId, command.workspaceId);
      s.preferences[key] = { ...preferencesFor(s, command.workspaceId), ...command.patch };
      break;
    }
    case "work-node": {
      const node = structuredClone(command.node);
      const old = nodeById(s, node.id);
      writable(s, node.workspaceId);
      if (old && (!canManageNode(s, old) || old.kind !== node.kind || old.workspaceId !== node.workspaceId)) fail("Only a manager can change this location.");
      if (!old && node.kind === "space" && !isWorkspaceAdmin(s, node.workspaceId)) fail("Only workspace admins can create Spaces.");
      const parent = node.kind === "space" ? undefined : nodeById(s, node.kind === "list" && node.folderId ? node.folderId : node.spaceId);
      if (parent && !canManageNode(s, parent)) fail("Only a manager of the destination can move or create work there.");
      node.name = node.name.trim(); node.memberIds = [...new Set([...node.memberIds, node.managerId])];
      const collection = node.kind === "space" ? s.spaces : node.kind === "folder" ? s.folders : s.lists;
      const index = collection.findIndex((n) => n.id === node.id);
      if (index >= 0) (collection as WorkNode[])[index] = node; else (collection as WorkNode[]).push(node);
      if (node.kind === "folder") for (const list of s.lists.filter((l) => l.folderId === node.id)) list.spaceId = node.spaceId;
      s.projects = s.lists;
      remapStatuses(source, s, command.statusMap ?? {});
      if (!old) addDefaultViews(s, { kind: node.kind, id: node.id, workspaceId: node.workspaceId });
      break;
    }
    case "work-workflow": {
      if (!isWorkspaceAdmin(s, command.workflow.workspaceId)) fail("Only workspace admins can configure workflows.");
      const index = s.workflows.findIndex((w) => w.id === command.workflow.id);
      if (index >= 0) s.workflows[index] = command.workflow; else s.workflows.push(command.workflow);
      remapStatuses(source, s, command.statusMap);
      break;
    }
    case "work-view": {
      const v = structuredClone(command.view); writable(s, v.workspaceId);
      const existing = s.views.find((item) => item.id === v.id);
      if (existing && existing.creatorId !== s.actorId && !isWorkspaceAdmin(s, v.workspaceId)) fail("Duplicate this view to customize your own copy.");
      if (existing && (existing.workspaceId !== v.workspaceId || existing.scopeId !== v.scopeId || existing.creatorId !== v.creatorId)) fail("A saved view cannot change location or owner.");
      if (!existing) v.creatorId = s.actorId;
      if (existing?.type === "list" && v.type !== "list" && !s.views.some((item) => item.id !== v.id && item.scopeId === v.scopeId && item.type === "list")) fail("Keep at least one List view.");
      if (v.isDefault) for (const view of s.views.filter((item) => item.scopeId === v.scopeId && item.personal === v.personal && (!v.personal || item.creatorId === s.actorId))) view.isDefault = false;
      s.views = s.views.filter((item) => item.id !== v.id); s.views.push(v);
      break;
    }
    case "work-remove-view": {
      const v = s.views.find((item) => item.id === command.id) ?? fail("View not found."); writable(s, v.workspaceId);
      if (v.creatorId !== s.actorId && !isWorkspaceAdmin(s, v.workspaceId)) fail("Only the creator or admin can remove this view.");
      if (v.type === "list" && !s.views.some((item) => item.id !== v.id && item.scopeId === v.scopeId && item.type === "list")) fail("Keep at least one List view.");
      s.views = s.views.filter((item) => item.id !== v.id);
      break;
    }
    case "work-field": {
      const f = command.field; const node = nodeById(s, f.scopeId);
      if (!node || !canManageNode(s, node)) fail("Only a location manager can configure custom fields.");
      const old = s.fields.find((field) => field.id === f.id);
      if (old && (old.scopeId !== f.scopeId || old.workspaceId !== f.workspaceId)) fail("A field's location cannot change.");
      if (old?.type !== f.type && s.tasks.some((t) => t.fields[f.id] != null)) fail("A populated field's type cannot be changed.");
      s.fields = [...s.fields.filter((field) => field.id !== f.id), f];
      break;
    }
    case "work-task": {
      const list = listById(s, command.draft.projectId); writable(s, list.workspaceId);
      if (!canSeeList(s, list) || listArchived(s, list)) fail("Choose an accessible, active List.");
      const previous = s.tasks.find((t) => t.id === command.id);
      if (previous) editable(s, previous);
      for (const id of command.draft.dependencyIds) if (!canSeeList(s, listById(s, taskById(s, id).listId))) fail("Dependency access required.");
      s = adaptLegacy(s, { kind: "save-task", id: command.id, draft: command.draft }, ctx);
      const task = taskById(s, command.id);
      if (command.checklist) task.checklist = command.checklist;
      if (command.fields) task.fields = command.fields;
      if (command.resources) task.resources = command.resources;
      if (command.statusId && command.statusId !== task.statusId) s = applyWorkspaceCommand(s, { kind: "work-status", ids: [task.id], statusIds: { [task.id]: command.statusId } }, ctx);
      break;
    }
    case "work-status": {
      for (const id of new Set(command.ids)) {
        const task = taskById(s, id); const list = listById(s, task.listId); writable(s, list.workspaceId);
        if (listArchived(s, list)) fail("Restore the location before moving tasks.");
        const target = statusesFor(s, task.listId).find((status) => status.id === command.statusIds[id]) ?? fail("Choose a valid status for each task.");
        if (target.category === task.status) {
          editable(s, task, true); if (task.archived) fail("Restore this task first.");
          task.statusId = target.id; log(s, task, `Status changed to ${target.name}`, ctx);
        } else {
          s = adaptLegacy(s, { kind: "transition", ids: [id], status: target.category }, ctx);
          taskById(s, id).statusId = target.id;
        }
        notify(s, taskById(s, id), task.watcherIds.filter((p) => !task.assigneeIds.includes(p) && p !== task.reviewerId), `Task moved to ${target.name}`, "activity", ctx);
      }
      break;
    }
    case "work-bulk": {
      for (const id of new Set(command.ids)) {
        const task = taskById(s, id);
        if (command.archived !== undefined) {
          if (!canManage(s, listById(s, task.listId))) fail(`${task.code}: only a manager can archive work.`);
          task.archived = command.archived; log(s, task, command.archived ? "Archived task" : "Restored task", ctx);
        } else {
          editable(s, task);
          s = adaptLegacy(s, { kind: "save-task", id, draft: { ...taskDraft(task), ...command.patch } }, ctx);
        }
      }
      break;
    }
    case "work-move": {
      const target = listById(s, command.listId);
      if (!canManageNode(s, target) || listArchived(s, target)) fail("Choose an active List you manage.");
      const ids = new Set(command.ids);
      let changed = true;
      while (changed) { changed = false; for (const t of s.tasks) if (ids.has(t.parentId) && !ids.has(t.id)) { ids.add(t.id); changed = true; } }
      for (const id of ids) {
        const t = taskById(s, id); const old = listById(s, t.listId);
        if (!canManageNode(s, old) || old.workspaceId !== target.workspaceId) fail("Task moves require manager access in the same workspace.");
        const statuses = workflowFor(s, target).statuses;
        const status = statuses.find((st) => st.id === (command.statusMap[t.statusId] || t.statusId) && st.category === t.status) ?? fail(`Map the status for ${t.code}.`);
        t.listId = target.id; t.projectId = target.id; t.stageId = target.stages[0].id; t.statusId = status.id;
        t.assigneeIds = command.assigneeIds; if (!target.memberIds.includes(t.reviewerId)) t.reviewerId = target.managerId;
        if (t.parentId && !ids.has(t.parentId)) t.parentId = "";
        const validFields = new Set(fieldsFor(s, target.id).map((f) => f.id));
        if (Object.keys(t.fields).some((id) => !validFields.has(id) && t.fields[id] != null && t.fields[id] !== "")) fail("Move would lose List-specific custom fields. Clear or migrate those values first.");
        t.fields = Object.fromEntries(Object.entries(t.fields).filter(([id]) => validFields.has(id)));
        log(s, t, `Moved to ${target.name}`, ctx);
      }
      break;
    }
    case "work-duplicate": {
      const root = taskById(s, command.id); editable(s, root, true);
      const originals = [root];
      for (let i = 0; i < originals.length; i++) originals.push(...s.tasks.filter((t) => t.parentId === originals[i].id));
      const ids = new Map(originals.map((t) => [t.id, ctx.newId()]));
      for (const old of originals) {
        const t = structuredClone(old); t.id = ids.get(old.id)!; t.subject = old.id === root.id ? `${old.subject} (copy)` : old.subject;
        t.code = `TASK-${String(s.nextTaskNumber++).padStart(4, "0")}`; t.status = "Open"; t.statusId = statusesFor(s, t.listId).find((st) => st.category === "Open")!.id;
        t.parentId = ids.get(old.parentId) ?? ""; t.dependencyIds = old.dependencyIds.map((id) => ids.get(id) ?? id); t.progress = 0; t.completedAt = null; t.completedBy = null; t.archived = false; t.createdAt = ctx.now; t.updatedAt = ctx.now; t.createdBy = s.actorId; t.checklist = t.checklist.map((i) => ({ ...i, id: ctx.newId(), done: false }));
        s.tasks.push(t); log(s, t, `Duplicated from ${old.code}`, ctx);
      }
      break;
    }
    case "work-watch": {
      const task = taskById(s, command.id); if (!canSeeList(s, listById(s, task.listId))) fail("Task access required.");
      task.watcherIds = task.watcherIds.includes(s.actorId) ? task.watcherIds.filter((p) => p !== s.actorId) : [...task.watcherIds, s.actorId]; break;
    }
    case "work-comment": {
      const t = taskById(s, command.taskId); const list = listById(s, t.listId); writable(s, list.workspaceId);
      if (!canSeeList(s, list)) fail("Task access required.");
      if ((!command.deleted && !command.body.trim()) || command.body.length > 5000) fail("Comments need 1–5,000 characters.");
      if (command.mentions.some((id) => !list.memberIds.includes(id))) fail("Mention a member of this List.");
      const old = s.comments.find((c) => c.id === command.id);
      if (old) {
        if (old.actorId !== s.actorId || old.taskId !== t.id) fail("You can only edit your own comment.");
        Object.assign(old, { body: command.deleted ? "Comment removed" : command.body.trim(), mentions: command.mentions, deleted: !!command.deleted, editedAt: ctx.now });
      } else {
        if (command.parentId && !s.comments.some((c) => c.id === command.parentId && c.taskId === t.id)) fail("Reply target is missing.");
        s.comments.push({ id: ctx.newId(), taskId: t.id, actorId: s.actorId, body: command.body.trim(), parentId: command.parentId, mentions: command.mentions, at: ctx.now });
        notify(s, t, command.mentions, "You were mentioned", "mention", ctx);
        notify(s, t, [...t.assigneeIds, ...t.watcherIds, t.createdBy].filter((id) => !command.mentions.includes(id)), "New task comment", "activity", ctx);
      }
      log(s, t, old ? "Updated a comment" : "Added a comment", ctx); break;
    }
    case "work-notifications": {
      for (const n of s.notifications) if (n.recipientId === s.actorId && command.ids.includes(n.id)) { if (command.read !== undefined) n.read = command.read; if (command.archived !== undefined) n.archived = command.archived; }
      break;
    }
    default: {
      if (!["actor", "read-notifications"].includes(command.kind)) writable(s, s.activeWorkspaceId);
      s = adaptLegacy(s, command, ctx);
      break;
    }
  }
  s.projects = s.lists;
  validateWorkState(s);
  return s;
}
