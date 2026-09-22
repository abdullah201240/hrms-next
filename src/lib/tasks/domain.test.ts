import { describe, expect, it } from "vitest";
import { createTaskDemo } from "../mock/data-tasks";
import { applyTaskCommand, blockedBy, dayKey, emptyTask, fromLocalInput, isOverdue, projectProgress, toLocalInput, validateWorkspace } from "./domain";
import { parseTaskSnapshot } from "./persistence";
import type { TaskCommand, TaskWorkspace } from "./types";

const now = new Date("2026-09-22T06:00:00Z");
let counter = 0;
const ctx = { now: now.toISOString(), newId: () => `new-${++counter}` };
const command = (state: TaskWorkspace, cmd: TaskCommand) => applyTaskCommand(state, cmd, ctx);
const demo = () => createTaskDemo(now);

describe("task demo domain", () => {
  it("seeds valid data and round-trips its versioned snapshot", () => {
    const state = demo();
    expect(() => validateWorkspace(state)).not.toThrow();
    expect(parseTaskSnapshot(JSON.stringify(state))).toEqual(state);
    expect(state.tasks).toHaveLength(16);
  });
  it("creates, assigns, edits, moves, reviews, completes, and reopens", () => {
    let state = demo();
    const project = state.projects[0];
    const draft = { ...emptyTask(project), subject: "New task", assigneeIds: ["e3", "e5"], reviewRequired: true, reviewerId: "e5" };
    state = command(state, { kind: "save-task", id: "test-task", draft });
    expect(state.notifications.some((n) => n.recipientId === "e3" && n.href === "/tasks/test-task")).toBe(true);
    state = command(state, { kind: "assign", ids: ["test-task"], assigneeIds: ["e3"] });
    state = command(state, { kind: "save-task", id: "test-task", draft: { ...draft, subject: "Edited task" } });
    state = command(state, { kind: "move", id: "test-task", stageId: project.stages[4].id });
    expect(state.tasks.at(-1)?.status).toBe("Open");
    state = command(state, { kind: "transition", ids: ["test-task"], status: "Working" });
    expect(() => command(state, { kind: "transition", ids: ["test-task"], status: "Completed" })).toThrow(/approval/);
    state = command(state, { kind: "transition", ids: ["test-task"], status: "Pending Review" });
    state = command(state, { kind: "transition", ids: ["test-task"], status: "Completed" });
    expect(state.tasks.at(-1)).toMatchObject({ progress: 100, completedBy: "e5" });
    state = command(state, { kind: "transition", ids: ["test-task"], status: "Open" });
    expect(state.tasks.at(-1)).toMatchObject({ progress: 0, completedAt: null, completedBy: null });
  });
  it("blocks start and completion until dependencies resolve", () => {
    let state = demo();
    expect(blockedBy(state, state.tasks[3]).map((task) => task.id)).toEqual(["task-3"]);
    expect(() => command(state, { kind: "transition", ids: ["task-4"], status: "Working" })).toThrow(/dependencies/);
    state = command(state, { kind: "transition", ids: ["task-3"], status: "Completed" });
    expect(() => command(state, { kind: "transition", ids: ["task-4"], status: "Working" })).not.toThrow();
  });
  it("rejects parent completion with unfinished children", () => {
    expect(() => command(demo(), { kind: "transition", ids: ["task-1"], status: "Completed" })).toThrow(/subtask/);
  });
  it("rejects cycles, self-links, cross-project links, and invalid parents", () => {
    const state = demo();
    const task = state.tasks[5];
    expect(() => command(state, { kind: "save-task", id: task.id, draft: { ...task, dependencyIds: [task.id] } })).toThrow(/Dependencies/);
    expect(() => command(state, { kind: "save-task", id: task.id, draft: { ...task, dependencyIds: ["task-7"] } })).toThrow(/same project/);
    expect(() => command(state, { kind: "save-task", id: task.id, draft: { ...task, parentId: "task-3" } })).toThrow(/group parent/);
    let cycle = command(state, { kind: "save-task", id: task.id, draft: { ...task, dependencyIds: ["task-4"] } });
    expect(() => command(cycle, { kind: "save-task", id: "task-4", draft: { ...cycle.tasks[3], dependencyIds: [task.id] } })).toThrow(/circular/);
    cycle = command(state, { kind: "save-task", id: "task-4", draft: { ...state.tasks[3], dependencyIds: ["task-1"] } });
    expect(cycle).toBeDefined();
  });
  it("rejects a child depending on its own parent", () => {
    const state = demo();
    expect(() => command(state, { kind: "save-task", id: "task-4", draft: { ...state.tasks[3], dependencyIds: ["task-1"] } })).toThrow(/circular/);
  });
  it("validates task/project date bounds, estimates, and progress", () => {
    const state = demo();
    const draft = { ...emptyTask(state.projects[0]), subject: "Test" };
    for (const invalid of [{ startAt: "2027-01-01T00:00:00Z" }, { estimateHours: -1 }, { progress: 101 }, { subject: " " }, { dueAt: "invalid" }, { assigneeIds: ["unknown"] }]) {
      expect(() => command(state, { kind: "save-task", id: "invalid", draft: { ...draft, ...invalid } })).toThrow();
    }
  });
  it("keeps bulk changes atomic and enforces demo roles", () => {
    const state = demo();
    const before = structuredClone(state);
    expect(() => command(state, { kind: "transition", ids: ["task-6", "task-4"], status: "Working" })).toThrow();
    expect(state).toEqual(before);
    const member = command(state, { kind: "actor", id: "e3" });
    expect(() => command(member, { kind: "transition", ids: ["task-3"], status: "Cancelled" })).toThrow(/manager/);
    expect(() => command(member, { kind: "transition", ids: ["task-5"], status: "Completed" })).toThrow();
  });
  it("counts leaf work without cancelled or group double counting", () => {
    const state = demo();
    expect(projectProgress(state, "prj-onboarding")).toEqual({ total: 5, completed: 1, cancelled: 0, percent: 20 });
    expect(projectProgress(state, "prj-portal")).toEqual({ total: 6, completed: 1, cancelled: 1, percent: 20 });
    expect(projectProgress(state, "empty").percent).toBe(0);
  });
  it("supports stage ordering without status changes", () => {
    const state = demo();
    const stageId = state.tasks[2].stageId;
    const next = command(state, { kind: "move", id: "task-6", stageId, beforeId: "task-3" });
    expect(next.tasks[5].status).toBe("Open");
    expect(next.tasks[5].position).toBeLessThan(next.tasks[2].position);
  });
  it.each(["tpl-onboarding", "tpl-offboarding", "tpl-project"])("clones %s with fresh relationships and role assignment", (templateId) => {
    const state = demo();
    const template = state.templates.find((item) => item.id === templateId)!;
    const next = command(state, { kind: "create-from-template", templateId, projectId: "new-project", name: "Template project", startAt: now.toISOString(), roleMembers: Object.fromEntries(template.roles.map((role) => [role, ["e3"]])) });
    const tasks = next.tasks.filter((task) => task.projectId === "new-project");
    expect(tasks).toHaveLength(template.tasks.length);
    expect(tasks.every((task) => task.status === "Open" && task.completedAt === null && task.assigneeIds.includes("e3"))).toBe(true);
    expect(tasks.every((task) => task.dependencyIds.every((id) => tasks.some((item) => item.id === id)) && (!task.parentId || tasks.some((item) => item.id === task.parentId)))).toBe(true);
    expect(next.comments).toEqual(state.comments);
  });
  it("saves a project template that can create a new project", () => {
    let state = command(demo(), { kind: "save-template", projectId: "prj-onboarding", name: "Saved onboarding" });
    const template = state.templates.at(-1)!;
    state = command(state, { kind: "create-from-template", templateId: template.id, projectId: "saved-copy", name: "Saved copy", startAt: now.toISOString(), roleMembers: { "Project team": ["e5"] } });
    expect(state.tasks.filter((task) => task.projectId === "saved-copy")).toHaveLength(6);
  });
  it("archives closed tasks without losing relationships or history", () => {
    const state = demo();
    expect(() => command(state, { kind: "archive", id: "task-3", archived: true })).toThrow(/completed or cancelled/);
    const next = command(state, { kind: "archive", id: "task-2", archived: true });
    expect(next.tasks[2].dependencyIds).toEqual(["task-2"]);
    expect(next.activities.length).toBe(state.activities.length + 1);
  });
  it("shares notification read state and keeps plain-text comments", () => {
    let state = demo();
    state = command(state, { kind: "read-notifications", ids: ["task-notification-1"] });
    expect(state.notifications[0].read).toBe(true);
    state = command(state, { kind: "comment", taskId: "task-5", body: "<script>not executed</script>" });
    expect(state.comments.at(-1)?.body).toBe("<script>not executed</script>");
    expect(state.notifications.some((item) => item.recipientId === "e6" && item.title === "New task comment")).toBe(true);
  });
});

describe("dates and persistence validation", () => {
  it("round-trips dates in explicit timezones and rejects nonexistent DST times", () => {
    expect(toLocalInput(now.toISOString(), "Asia/Dhaka")).toBe("2026-09-22T12:00");
    expect(fromLocalInput("2026-09-22T12:00", "Asia/Dhaka")).toBe(now.toISOString());
    expect(dayKey("2026-09-22T23:00:00Z", "Asia/Dhaka")).toBe("2026-09-23");
    expect(() => fromLocalInput("2026-03-08T02:30", "America/Los_Angeles")).toThrow(/daylight/);
    const state = demo();
    expect(isOverdue(state.tasks[7], now)).toBe(true);
    expect(isOverdue(state.tasks[1], now)).toBe(false);
  });
  it("rejects corrupt, unsupported, duplicate, and unsafe snapshots", () => {
    expect(() => parseTaskSnapshot("broken")).toThrow();
    expect(() => parseTaskSnapshot(JSON.stringify({ ...demo(), version: 2 }))).toThrow();
    const state = demo();
    state.tasks.push(state.tasks[0]);
    expect(() => parseTaskSnapshot(JSON.stringify(state))).toThrow();
    const unsafe = demo();
    unsafe.notifications[0].href = "javascript:alert(1)";
    expect(() => parseTaskSnapshot(JSON.stringify(unsafe))).toThrow();
  });
});
