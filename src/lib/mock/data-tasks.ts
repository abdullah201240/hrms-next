import { employees, currentUser } from "./data";
import { notifications } from "./data-4";
import { emptyTask } from "../tasks/domain";
import { DEFAULT_STAGES, type ProjectTemplate, type TaskProject, type TaskWorkspace, type TemplateTask, type WorkTask } from "../tasks/types";

const templateTask = (key: string, subject: string, role: string, startDay: number, durationDays: number, extra: Partial<TemplateTask> = {}): TemplateTask => ({ key, subject, role, startDay, durationDays, description: "", priority: "Medium", estimateHours: 2, stageIndex: 0, isGroup: false, parentKey: "", dependencyKeys: [], ...extra });
export const taskTemplates: ProjectTemplate[] = [
  { id: "tpl-onboarding", name: "Employee onboarding", description: "A thoughtful first week: paperwork, equipment, access, and a warm welcome.", category: "People operations", roles: ["HR partner", "IT partner", "Buddy"], stages: [...DEFAULT_STAGES], tasks: [
    templateTask("welcome", "Prepare the welcome experience", "HR partner", 0, 7, { isGroup: true, estimateHours: 0 }),
    templateTask("documents", "Collect joining documents", "HR partner", 0, 1, { parentKey: "welcome" }),
    templateTask("equipment", "Prepare laptop and workspace", "IT partner", 1, 2, { parentKey: "welcome", dependencyKeys: ["documents"], priority: "High" }),
    templateTask("access", "Set up accounts and access", "IT partner", 3, 1, { parentKey: "welcome", dependencyKeys: ["equipment"] }),
    templateTask("orientation", "Run team orientation", "Buddy", 4, 1, { parentKey: "welcome", dependencyKeys: ["access"] }),
  ] },
  { id: "tpl-offboarding", name: "Employee offboarding", description: "Coordinate handover, recover equipment, and complete a respectful exit.", category: "People operations", roles: ["HR partner", "Team lead", "IT partner"], stages: [...DEFAULT_STAGES], tasks: [
    templateTask("handover", "Complete knowledge handover", "Team lead", 0, 3, { priority: "High", estimateHours: 6 }),
    templateTask("assets", "Collect company equipment", "IT partner", 3, 1, { dependencyKeys: ["handover"] }),
    templateTask("exit", "Conduct the exit interview", "HR partner", 2, 1),
    templateTask("access", "Review and revoke access", "IT partner", 4, 1, { dependencyKeys: ["assets"], priority: "Urgent" }),
  ] },
  { id: "tpl-project", name: "Team project launch", description: "Turn a brief into a plan, deliver the work, and close with a team review.", category: "Team delivery", roles: ["Project lead", "Delivery team", "Reviewer"], stages: [...DEFAULT_STAGES], tasks: [
    templateTask("brief", "Agree on the project brief", "Project lead", 0, 1),
    templateTask("plan", "Define deliverables and owners", "Project lead", 1, 2, { dependencyKeys: ["brief"] }),
    templateTask("deliver", "Deliver the first milestone", "Delivery team", 3, 4, { dependencyKeys: ["plan"], estimateHours: 16 }),
    templateTask("review", "Review results and capture learnings", "Reviewer", 7, 1, { dependencyKeys: ["deliver"] }),
  ] },
];

/** Dates are relative to first use, so the demo always includes overdue and upcoming work. */
export function createTaskDemo(now = new Date()): TaskWorkspace {
  const at = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();
  const people = employees.filter((p) => p.status !== "Inactive").map((p) => ({ id: p.id, name: p.name, employeeCode: p.employeeId, department: p.department, admin: p.role === "admin" || p.role === "hr" }));
  const project = (id: string, name: string, description: string, department: string, managerId: string, memberIds: string[]): TaskProject => ({ id, name, description, department, managerId, memberIds: [...new Set([managerId, ...memberIds])], status: "Open", startAt: at(-14), dueAt: at(30), createdAt: at(-14), stages: DEFAULT_STAGES.map((name, index) => ({ id: `${id}-stage-${index}`, name, folded: false })) });
  const projects = [
    project("prj-onboarding", "October onboarding", "Make every new teammate feel ready, supported, and part of the team.", "Human Resources", "e5", ["e1", "e3", "e4", "e6", "e10"]),
    project("prj-portal", "Employee portal refresh", "A clearer, friendlier self-service experience for everyone at Acme.", "Engineering", "e1", ["e2", "e3", "e5", "e6", "e10", "e12"]),
    project("prj-review", "Quarterly people review", "Bring together feedback, development goals, and next quarter’s priorities.", "Human Resources", "e5", ["e1", "e2", "e7", "e9"]),
  ];
  let number = 1;
  const task = (projectIndex: number, subject: string, status: WorkTask["status"], stageIndex: number, days: number | null, assigneeIds: string[], extra: Partial<WorkTask> = {}): WorkTask => {
    const p = projects[projectIndex];
    const n = number++;
    return { ...emptyTask(p), id: `task-${n}`, code: `TASK-${String(n).padStart(4, "0")}`, subject, description: "Keep the team informed as you work. Add a comment if you need input, and request review when the deliverable is ready.", projectId: p.id, stageId: p.stages[stageIndex].id, status, priority: "Medium", assigneeIds, startAt: at(-5), dueAt: days === null ? null : at(days), estimateHours: 4, progress: status === "Completed" ? 100 : status === "Working" ? 40 : status === "Pending Review" ? 85 : 0, createdBy: p.managerId, createdAt: at(-10), updatedAt: at(-1), completedAt: status === "Completed" ? at(-1) : null, completedBy: status === "Completed" ? p.managerId : null, archived: false, position: n, ...extra };
  };
  const tasks = [
    task(0, "Prepare the first-week experience", "Working", 2, 10, ["e5"], { isGroup: true, estimateHours: 0, type: "HR Operations", tags: ["Onboarding"] }),
    task(0, "Confirm joining documents", "Completed", 4, -3, ["e5"], { parentId: "task-1", tags: ["Onboarding", "Documents"] }),
    task(0, "Set up laptops for new joiners", "Working", 2, 2, ["e3", "e10"], { parentId: "task-1", dependencyIds: ["task-2"], priority: "High", type: "Development", tags: ["IT setup"] }),
    task(0, "Create accounts and access checklist", "Open", 1, 4, ["e4"], { parentId: "task-1", dependencyIds: ["task-3"], tags: ["IT setup"] }),
    task(0, "Review the welcome handbook", "Pending Review", 3, 1, ["e5", "e6"], { parentId: "task-1", reviewRequired: true, reviewerId: "e5", type: "Documentation", tags: ["Onboarding"] }),
    task(0, "Schedule buddy introductions", "Open", 0, null, [], { tags: ["People"] }),
    task(1, "Audit employee self-service navigation", "Completed", 4, -2, ["e6"], { type: "Design", tags: ["Experience"] }),
    task(1, "Design the leave request flow", "Working", 2, -1, ["e6", "e12"], { dependencyIds: ["task-7"], priority: "Urgent", type: "Design", tags: ["Experience", "Leave"], estimateHours: 12 }),
    task(1, "Build the profile summary cards", "Working", 2, 3, ["e3", "e10"], { type: "Development", priority: "High", tags: ["Frontend"], estimateHours: 8 }),
    task(1, "Review accessibility checklist", "Pending Review", 3, 2, ["e12"], { reviewerId: "e6", reviewRequired: true, type: "Review", tags: ["Accessibility"] }),
    task(1, "Write the employee help guide", "Open", 1, 7, ["e5"], { dependencyIds: ["task-8"], type: "Documentation", tags: ["Content"] }),
    task(1, "Explore an alternate navigation concept", "Cancelled", 0, null, ["e6"], { priority: "Low", tags: ["Experience"] }),
    task(2, "Collect department feedback", "Working", 2, -2, ["e5", "e9"], { priority: "High", tags: ["Feedback"], estimateHours: 6 }),
    task(2, "Review the learning budget", "Pending Review", 3, 0.2, ["e7"], { reviewRequired: true, reviewerId: "e5", tags: ["Development"] }),
    task(2, "Prepare the people review agenda", "Open", 1, 5, ["e5", "e2"], { dependencyIds: ["task-13"], tags: ["Planning"] }),
    task(2, "Document next-quarter goals", "Open", 0, 9, [], { priority: "Low", tags: ["Planning"] }),
  ];
  return { version: 1, timezone: "Asia/Dhaka", actorId: currentUser.id, nextTaskNumber: number, people, projects, tasks,
    activities: tasks.map((t) => ({ id: `activity-${t.id}`, taskId: t.id, actorId: t.createdBy, message: "Created task", at: t.createdAt })),
    comments: [{ id: "comment-welcome", taskId: "task-5", actorId: "e6", body: "The revised handbook is ready. Please check the first-day schedule before we share it with the new joiners.", at: at(-0.5) }],
    notifications: [
      { id: "task-notification-1", recipientId: currentUser.id, title: "Welcome handbook is ready for review", body: "TASK-0005 · Review the welcome handbook", from: "Elena Vox", docType: "Task", when: at(-0.5), read: false, href: "/tasks/task-5" },
      ...notifications.map((n) => ({ ...n, recipientId: currentUser.id, href: n.docType === "Salary Slip" ? "/payroll/slips" : n.docType === "Leave Application" ? "/my-leave" : "/notifications" })),
    ], templates: structuredClone(taskTemplates) };
}
