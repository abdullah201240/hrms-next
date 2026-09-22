import type { TaskWorkspace, TaskProject, WorkTask, TaskComment, TaskCommand, TaskStatus, TaskDraft } from "./types";

export const STATUS_CATEGORIES = ["Open", "Working", "Pending Review", "Completed", "Cancelled"] as const;
export const CATEGORY_LABELS: Record<TaskStatus, string> = { Open: "To do", Working: "In progress", "Pending Review": "In review", Completed: "Done", Cancelled: "Cancelled" };
export const WORK_COLORS = ["#64748b", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"] as const;
export type WorkspaceRole = "Owner" | "Admin" | "Member" | "Viewer";
export type ViewKind = "list" | "board" | "table" | "calendar" | "timeline";
export type ScopeKind = "workspace" | "space" | "folder" | "list";
export type GroupKind = "status" | "priority" | "assignee" | "list" | `field:${string}`;
export type FieldValue = string | number | boolean | null;
export interface WorkScope { kind: ScopeKind; id: string; workspaceId: string }
export interface WorkOrganization {
  id: string; name: string; color: string; timezone: string; workflowId: string;
  members: Record<string, WorkspaceRole>; archived: boolean; createdAt: string;
}
export interface HierarchyNode {
  id: string; workspaceId: string; name: string; description: string; color: string;
  managerId: string; memberIds: string[]; workflowId: string; position: number;
  archived: boolean; startAt: string | null; dueAt: string | null;
  health: "On track" | "At risk" | "Off track";
}
export interface WorkSpace extends HierarchyNode { kind: "space" }
export interface WorkFolder extends HierarchyNode { kind: "folder"; spaceId: string }
/** Lists are the authoritative projects. The projects array is an in-memory legacy adapter only. */
export interface WorkList extends TaskProject, HierarchyNode { kind: "list"; spaceId: string; folderId: string }
export type WorkNode = WorkSpace | WorkFolder | WorkList;
export interface WorkStatus { id: string; name: string; color: string; category: TaskStatus }
export interface WorkWorkflow { id: string; workspaceId: string; name: string; statuses: WorkStatus[] }
export interface ChecklistItem { id: string; title: string; done: boolean; assigneeId: string }
export interface TaskResource { id: string; name: string; url: string }
export interface WorkspaceTask extends WorkTask {
  listId: string; statusId: string; checklist: ChecklistItem[]; watcherIds: string[];
  fields: Record<string, FieldValue>; resources: TaskResource[];
}
export interface WorkComment extends TaskComment { parentId?: string; mentions?: string[]; editedAt?: string; deleted?: boolean }
export interface WorkField {
  id: string; workspaceId: string; scopeId: string; name: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  options: { id: string; label: string; color: string }[]; archived: boolean;
}
export interface ViewFilter { id: string; field: string; operator: "is" | "is-not" | "contains" | "before" | "after"; value: string }
export interface WorkView {
  id: string; workspaceId: string; scopeId: string; name: string; type: ViewKind;
  creatorId: string; personal: boolean; position: number; isDefault: boolean;
  groupBy: GroupKind; swimlane: "none" | "list" | "priority"; sort: string;
  filters: ViewFilter[]; match: "all" | "any"; showClosed: boolean;
  subtasks: "nested" | "separate" | "hidden"; density: "comfortable" | "compact";
  fields: string[]; widths: Record<string, number>; folded: string[];
  columnOrder: string[]; ranks: Record<string, number>; wip: Record<string, number>;
}
export interface WorkPreferences {
  favorites: string[]; expanded: string[]; recent: string[]; lastWorkspaceId: string;
  dashboard: string[]; drafts: Record<string, string>; sidebarWidth: number;
}
export interface WorkspaceState extends Omit<TaskWorkspace, "version" | "projects" | "tasks" | "comments"> {
  version: 2; activeWorkspaceId: string; workspaces: WorkOrganization[];
  spaces: WorkSpace[]; folders: WorkFolder[]; lists: WorkList[];
  projects: WorkList[]; tasks: WorkspaceTask[]; comments: WorkComment[];
  workflows: WorkWorkflow[]; views: WorkView[]; fields: WorkField[];
  preferences: Record<string, WorkPreferences>;
}
export type WorkspaceCommand = TaskCommand
  | { kind: "work-batch"; commands: WorkspaceCommand[] }
  | { kind: "work-create"; name: string; sample?: boolean }
  | { kind: "work-settings"; workspaceId: string; name: string; color: string; timezone: string; members: Record<string, WorkspaceRole> }
  | { kind: "work-switch"; workspaceId: string }
  | { kind: "work-node"; node: WorkNode; statusMap?: Record<string, string> }
  | { kind: "work-workflow"; workflow: WorkWorkflow; statusMap: Record<string, string> }
  | { kind: "work-view"; view: WorkView }
  | { kind: "work-remove-view"; id: string }
  | { kind: "work-preferences"; workspaceId: string; patch: Partial<WorkPreferences> }
  | { kind: "work-field"; field: WorkField }
  | { kind: "work-task"; id: string; draft: TaskDraft; statusId?: string; checklist?: ChecklistItem[]; fields?: Record<string, FieldValue>; resources?: TaskResource[] }
  | { kind: "work-status"; ids: string[]; statusIds: Record<string, string> }
  | { kind: "work-bulk"; ids: string[]; patch: Partial<Pick<TaskDraft, "priority" | "assigneeIds" | "tags" | "startAt" | "dueAt">>; archived?: boolean }
  | { kind: "work-move"; ids: string[]; listId: string; statusMap: Record<string, string>; assigneeIds: string[] }
  | { kind: "work-duplicate"; id: string }
  | { kind: "work-watch"; id: string }
  | { kind: "work-comment"; taskId: string; id?: string; body: string; parentId?: string; mentions: string[]; deleted?: boolean }
  | { kind: "work-notifications"; ids: string[]; read?: boolean; archived?: boolean };
