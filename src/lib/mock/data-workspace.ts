import { createTaskDemo } from "./data-tasks";
import { addDefaultViews, defaultPreferences, migrateWorkspace, preferenceKey, statusesFor, validateWorkState } from "../tasks/workspace-model";
import { emptyTask, newProjectDraft } from "../tasks/domain";
import type { WorkList, WorkSpace, WorkspaceState, WorkspaceTask } from "../tasks/workspace-types";

const workstreams = [
  ["Hiring pipeline", "Screen the product designer shortlist", "Publish the engineering role", "Prepare interview scorecards", "Coordinate the panel interviews", "Review offer compensation", "Collect candidate feedback", "Send the final offer", "Update the hiring dashboard"],
  ["People experience", "Plan the quarterly team gathering", "Refresh the recognition program", "Publish the pulse survey", "Review employee feedback themes", "Draft the wellbeing calendar", "Coordinate learning sessions", "Share the people newsletter", "Book the team offsite venue"],
  ["Platform delivery", "Finalize the dashboard information architecture", "Build reusable navigation components", "Review permission boundaries", "Document the release checklist", "Improve mobile table layouts", "Prepare the staging environment", "Review the empty state copy", "Optimize employee search"],
  ["Office operations", "Review the office supplies inventory", "Collect vendor proposals", "Schedule the facilities inspection", "Renew the office equipment contracts", "Update the emergency contacts", "Approve the workspace seating plan", "Prepare monthly spend summary", "Document the procurement process"],
  ["Company launch", "Approve the launch communication brief", "Prepare the stakeholder presentation", "Review the brand asset library", "Coordinate department launch owners", "Publish the internal launch guide", "Collect launch readiness updates", "Finalize the launch day schedule", "Capture the retrospective actions"],
];
export function createWorkspaceDemo(now = new Date()): WorkspaceState {
  const state = migrateWorkspace(createTaskDemo(now));
  const w = state.workspaces[0];
  w.name = "Acme workspace";
  const members = state.people.map((p) => p.id);
  state.spaces[0].name = "People Operations";
  state.spaces[1].name = "Engineering";
  const operations: WorkSpace = { ...state.spaces[0], id: "space-operations", name: "Operations", description: "Keep the company running smoothly, every day.", color: "#f59e0b", position: 2, memberIds: members };
  state.spaces.push(operations);
  state.spaces.forEach((s) => { s.memberIds = members; });
  const folders = [
    { id: "folder-onboarding", name: "Employee onboarding", spaceId: state.spaces[0].id, color: "#3b82f6" },
    { id: "folder-people", name: "People & culture", spaceId: state.spaces[0].id, color: "#f43f5e" },
    { id: "folder-portal", name: "Employee portal", spaceId: state.spaces[1].id, color: "#8b5cf6" },
    { id: "folder-launch", name: "Company initiatives", spaceId: operations.id, color: "#f59e0b" },
  ];
  state.folders = folders.map((f, i) => ({ ...operations, ...f, kind: "folder", description: "One place for the plan, the people, and the work.", position: i, managerId: state.actorId }));
  state.lists[0].folderId = folders[0].id;
  state.lists[0].name = "New joiner experience";
  state.lists[1].folderId = folders[2].id;
  state.lists[2].folderId = folders[1].id;
  for (const list of state.lists) list.memberIds = members;
  workstreams.forEach(([name, ...subjects], i) => {
    const space = state.spaces[i < 2 ? 0 : i === 2 ? 1 : 2];
    const id = `list-stream-${i}`;
    const list: WorkList = { ...newProjectDraft(state.actorId, () => `${id}-stage-${Math.random().toString(36).slice(2, 7)}`), id, name, description: ["Find great people and give every candidate a thoughtful experience.", "Build a workplace where people do their best work.", "Ship thoughtful improvements to the employee experience.", "Reliable operations, clear ownership, fewer surprises.", "Bring every team together around the next company milestone."][i], kind: "list", workspaceId: w.id, spaceId: space.id, folderId: i === 0 ? "" : i === 1 ? folders[1].id : i === 2 ? folders[2].id : i === 4 ? folders[3].id : "", memberIds: members, department: space.name, managerId: state.actorId, workflowId: "", color: space.color, position: i + 3, archived: false, health: i === 2 ? "At risk" : "On track", createdAt: now.toISOString() };
    state.lists.push(list);
    addDefaultViews(state, { kind: "list", id, workspaceId: w.id });
    subjects.forEach((subject, j) => {
      const number = state.nextTaskNumber++;
      const category = (["Open", "Working", "Working", "Pending Review", "Completed", "Open", "Working", "Open"] as const)[j];
      const person = members[(i * 3 + j) % members.length];
      const createdAt = new Date(now.getTime() - (j + 3) * 86400000).toISOString();
      const task: WorkspaceTask = { ...emptyTask(list), id: `work-task-${number}`, code: `TASK-${String(number).padStart(4, "0")}`, subject, description: `Coordinate with the ${space.name.toLowerCase()} team to ${subject.toLowerCase()}.\n\nKeep the scope clear, share progress here, and flag anything that needs a decision. The deliverable should be ready for the next team review.`, listId: id, statusId: statusesFor(state, id).find((s) => s.category === category)!.id, status: category, priority: (["High", "Medium", "Urgent", "Medium", "Low", "High", "Medium", "Low"] as const)[j], assigneeIds: j === 7 ? [] : j % 3 === 0 ? [state.actorId, person].filter((p, k, a) => a.indexOf(p) === k) : [person], reviewerId: state.actorId, reviewRequired: category === "Pending Review", tags: [i === 2 ? "Product" : i < 2 ? "People" : "Operations", j % 2 ? "Planning" : "This week"], startAt: null, dueAt: j === 7 ? null : new Date(now.getTime() + (j - 1) * 86400000).toISOString(), estimateHours: [3, 5, 8, 2, 4, 6, 2, 1][j], progress: category === "Completed" ? 100 : category === "Working" ? 45 : category === "Pending Review" ? 90 : 0, createdBy: state.actorId, createdAt, updatedAt: createdAt, completedAt: category === "Completed" ? now.toISOString() : null, completedBy: category === "Completed" ? state.actorId : null, archived: false, position: j, checklist: [{ id: `${number}-check-1`, title: "Confirm scope and acceptance criteria", done: j % 2 === 0, assigneeId: person }, { id: `${number}-check-2`, title: "Share the outcome with the team", done: category === "Completed", assigneeId: "" }], watcherIds: [state.actorId], fields: {}, resources: [] };
      state.tasks.push(task);
      state.activities.push({ id: `work-activity-${number}`, taskId: task.id, actorId: state.actorId, message: "Created task", at: createdAt });
      if (j < 3) state.comments.push({ id: `work-comment-${number}`, taskId: task.id, actorId: person, body: ["I've added the first pass. Would love your thoughts before our next check-in.", "The scope looks good. I'll coordinate the next steps with the team.", "A quick update: we're on track. I'll share the final details here."][j], at: new Date(now.getTime() - j * 3600000).toISOString(), mentions: [] });
    });
  });
  for (const folder of state.folders) addDefaultViews(state, { kind: "folder", id: folder.id, workspaceId: w.id });
  addDefaultViews(state, { kind: "space", id: operations.id, workspaceId: w.id });
  state.fields.push({ id: "field-effort", workspaceId: w.id, scopeId: state.spaces[1].id, name: "Effort", type: "select", archived: false, options: [{ id: "small", label: "Small", color: "#10b981" }, { id: "medium", label: "Medium", color: "#f59e0b" }, { id: "large", label: "Large", color: "#f43f5e" }] });
  for (const task of state.tasks) if (state.lists.find((l) => l.id === task.listId)?.spaceId === state.spaces[1].id) task.fields["field-effort"] = ["small", "medium", "large"][task.position % 3];
  state.preferences[preferenceKey(state.actorId, w.id)] = { ...defaultPreferences(), lastWorkspaceId: w.id, expanded: [...state.spaces.map((s) => s.id), ...folders.map((f) => f.id)], favorites: [state.lists[1].id, "list-stream-0"] };
  state.projects = state.lists;
  validateWorkState(state);
  return state;
}
