import { validateWorkspace } from "./domain";
import type { TaskWorkspace } from "./types";

export const TASK_STORAGE_KEY = "hrms-task-workspace-v1";
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");
function shape(value: unknown, fields: string[], arrays: string[] = [], booleans: string[] = [], numbers: string[] = []) {
  if (!record(value) || fields.some((key) => typeof value[key] !== "string") || arrays.some((key) => !strings(value[key])) || booleans.some((key) => typeof value[key] !== "boolean") || numbers.some((key) => typeof value[key] !== "number" || !Number.isFinite(value[key]))) throw new Error("Invalid demo data.");
  return value;
}
/** Validate stored data before any component attempts to render it. Never discard a bad snapshot silently. */
export function parseTaskSnapshot(raw: string): TaskWorkspace {
  const value: unknown = JSON.parse(raw);
  if (!record(value) || value.version !== 1 || !Number.isInteger(value.nextTaskNumber)) throw new Error("Unsupported task demo version.");
  shape(value, ["actorId", "timezone"]);
  for (const key of ["people", "projects", "tasks", "comments", "activities", "notifications", "templates"]) {
    if (!Array.isArray(value[key])) throw new Error("Invalid demo collection.");
    const items = value[key] as unknown[];
    items.forEach((item) => shape(item, ["id"]));
    if (new Set(items.map((item) => (item as { id: string }).id)).size !== items.length) throw new Error("Duplicate demo IDs.");
  }
  const state = value as unknown as TaskWorkspace;
  state.people.forEach((p) => shape(p, ["id", "name", "employeeCode", "department"], [], ["admin"]));
  state.projects.forEach((p) => {
    shape(p, ["id", "name", "description", "department", "managerId", "status", "createdAt"], ["memberIds"]);
    if (!Array.isArray(p.stages)) throw new Error("Invalid project stages.");
    p.stages.forEach((s) => shape(s, ["id", "name"], [], ["folded"]));
  });
  state.tasks.forEach((t) => {
    shape(t, ["id", "code", "subject", "description", "projectId", "stageId", "status", "priority", "type", "reviewerId", "parentId", "createdBy", "createdAt", "updatedAt"], ["assigneeIds", "tags", "dependencyIds"], ["reviewRequired", "isGroup", "archived"], ["estimateHours", "progress", "position"]);
    if (t.completedAt !== null && (typeof t.completedAt !== "string" || !Number.isFinite(Date.parse(t.completedAt)))) throw new Error("Invalid completion date.");
  });
  state.comments.forEach((c) => shape(c, ["id", "taskId", "actorId", "body", "at"]));
  state.activities.forEach((a) => shape(a, ["id", "taskId", "actorId", "message", "at"]));
  state.notifications.forEach((n) => {
    shape(n, ["id", "recipientId", "title", "body", "from", "docType", "when", "href"], [], ["read"]);
    if (!n.href.startsWith("/") || n.href.startsWith("//")) throw new Error("Invalid notification link.");
  });
  state.templates.forEach((t) => {
    shape(t, ["id", "name", "description", "category"], ["roles", "stages"]);
    if (!t.stages.length || !Array.isArray(t.tasks)) throw new Error("Invalid template.");
    t.tasks.forEach((item) => shape(item, ["key", "subject", "description", "role", "priority", "parentKey"], ["dependencyKeys"], ["isGroup"], ["estimateHours", "startDay", "durationDays", "stageIndex"]));
  });
  validateWorkspace(state);
  return state;
}
