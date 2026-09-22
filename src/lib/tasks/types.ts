export const TASK_STATUSES = ["Open", "Working", "Pending Review", "Completed", "Cancelled"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const PROJECT_STATUSES = ["Open", "On hold", "Completed", "Cancelled"] as const;
export const TASK_TYPES = ["General", "HR Operations", "Design", "Development", "Review", "Documentation"] as const;
export const DEFAULT_STAGES = ["Backlog", "Planned", "Execution", "Review", "Delivery"] as const;
export const WORKSPACE_TIMEZONES = ["Asia/Dhaka", "UTC", "America/Los_Angeles", "Europe/London"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface TaskPerson {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
  admin: boolean;
}
export interface TaskStage { id: string; name: string; folded: boolean }
export interface TaskProject {
  id: string;
  name: string;
  description: string;
  department: string;
  managerId: string;
  memberIds: string[];
  status: ProjectStatus;
  startAt: string | null;
  dueAt: string | null;
  stages: TaskStage[];
  createdAt: string;
  templateId?: string;
}
export interface WorkTask {
  id: string;
  code: string;
  subject: string;
  description: string;
  projectId: string;
  stageId: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: string;
  assigneeIds: string[];
  reviewerId: string;
  reviewRequired: boolean;
  tags: string[];
  startAt: string | null;
  dueAt: string | null;
  estimateHours: number;
  progress: number;
  isGroup: boolean;
  parentId: string;
  dependencyIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  completedBy: string | null;
  archived: boolean;
  position: number;
}
export type TaskDraft = Pick<WorkTask, "subject" | "description" | "projectId" | "stageId" | "priority" | "type" | "assigneeIds" | "reviewerId" | "reviewRequired" | "tags" | "startAt" | "dueAt" | "estimateHours" | "progress" | "isGroup" | "parentId" | "dependencyIds">;
export type ProjectDraft = Omit<TaskProject, "id" | "createdAt" | "templateId">;
export interface TaskActivity { id: string; taskId: string; actorId: string; message: string; at: string }
export interface TaskComment { id: string; taskId: string; actorId: string; body: string; at: string }
export interface WorkspaceNotification {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  from: string;
  docType: string;
  when: string;
  read: boolean;
  href: string;
}
export interface TemplateTask {
  key: string;
  subject: string;
  description: string;
  role: string;
  priority: TaskPriority;
  estimateHours: number;
  startDay: number;
  durationDays: number;
  stageIndex: number;
  isGroup: boolean;
  parentKey: string;
  dependencyKeys: string[];
}
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: string[];
  stages: string[];
  tasks: TemplateTask[];
}
export interface TaskWorkspace {
  version: 1;
  timezone: string;
  actorId: string;
  nextTaskNumber: number;
  people: TaskPerson[];
  projects: TaskProject[];
  tasks: WorkTask[];
  activities: TaskActivity[];
  comments: TaskComment[];
  notifications: WorkspaceNotification[];
  templates: ProjectTemplate[];
}
export type TaskCommand =
  | { kind: "save-task"; id: string; draft: TaskDraft }
  | { kind: "transition"; ids: string[]; status: TaskStatus }
  | { kind: "assign"; ids: string[]; assigneeIds: string[] }
  | { kind: "move"; id: string; stageId: string; beforeId?: string }
  | { kind: "archive"; id: string; archived: boolean }
  | { kind: "comment"; taskId: string; body: string }
  | { kind: "save-project"; id: string; draft: ProjectDraft }
  | { kind: "save-template"; projectId: string; name: string }
  | { kind: "create-from-template"; templateId: string; projectId: string; name: string; startAt: string; roleMembers: Record<string, string[]> }
  | { kind: "actor"; id: string }
  | { kind: "timezone"; timezone: string }
  | { kind: "read-notifications"; ids: string[] };
export interface CommandContext { now: string; newId: () => string }
export interface TaskRepository {
  getSnapshot: () => TaskWorkspace | null;
  subscribe: (listener: () => void) => () => void;
  execute: (command: TaskCommand) => void;
}
