"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  GitBranch,
  Hash,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  Tag,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { blockedBy, canEditTask, emptyTask, formatTaskDate, isClosed, personName } from "@/lib/tasks/domain";
import {
  canManageNode,
  canSeeList,
  canWriteWorkspace,
  fieldsFor,
  listArchived,
  preferencesFor,
  scopeLists,
  statusesFor,
  taskDraft,
} from "@/lib/tasks/workspace-model";
import { TASK_PRIORITIES, TASK_TYPES, type TaskDraft } from "@/lib/tasks/types";
import type {
  ChecklistItem,
  FieldValue,
  WorkField,
  WorkScope,
  WorkspaceState,
  WorkspaceTask,
} from "@/lib/tasks/workspace-types";
import { WorkEmpty, WorkLabel, WorkMenu, WorkModal, WorkPeople, WorkStatusBadge, OrderButtons } from "./common";
import { TaskDateInput } from "../task-shared";
import { cn } from "@/lib/utils";

export function CustomFieldInput({
  field,
  value,
  onChange,
  disabled = false,
}: {
  field: WorkField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  if (field.type === "checkbox") {
    return (
      <div className="flex h-9 items-center">
        <Checkbox
          aria-label={field.name}
          checked={value === true}
          disabled={disabled}
          onCheckedChange={(v) => onChange(!!v)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <SearchSelect
        disabled={disabled}
        value={String(value ?? "")}
        options={field.options.map((o) => ({ value: o.id, label: o.label }))}
        onChange={onChange}
        placeholder={`Select ${field.name}`}
      />
    );
  }

  return (
    <Input
      disabled={disabled}
      aria-label={field.name}
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      defaultValue={String(value ?? "")}
      key={`${field.id}-${value}`}
      onBlur={(e) => {
        const v = e.target.value;
        const next = field.type === "number" ? (v === "" ? null : Number(v)) : v;
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="text-xs"
    />
  );
}

export function QuickTask({
  state,
  scope,
  onClose,
  onCreated,
  listId = "",
  parentId = "",
  statusId = "",
  dueAt = null,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  onClose: () => void;
  onCreated: (id: string) => void;
  listId?: string;
  parentId?: string;
  statusId?: string;
  dueAt?: string | null;
}) {
  const lists = scopeLists(state, scope).filter((l) => canWriteWorkspace(state, l.workspaceId));
  const initialList =
    lists.find((l) => l.id === listId) ??
    (scope.kind === "list" ? lists[0] : lists.length === 1 ? lists[0] : undefined);

  const [draft, setDraft] = useState<TaskDraft>(() => ({
    ...emptyTask(initialList),
    parentId,
    dueAt,
  }));
  const [status, setStatus] = useState(statusId);
  const [id] = useState(() => crypto.randomUUID());
  const list = lists.find((l) => l.id === draft.projectId);
  const work = state.workspaces.find((w) => w.id === scope.workspaceId)!;

  const change = (patch: Partial<TaskDraft>) => setDraft({ ...draft, ...patch });

  return (
    <WorkModal
      title={parentId ? "Add Subtask" : "Create New Task"}
      description="Define the outcome and assign initial responsibility."
      onClose={() => {
        if (!draft.subject.trim() || window.confirm("Discard this new task?")) onClose();
      }}
    >
      {!lists.length ? (
        <WorkEmpty
          title="Create a list first"
          description="Tasks must belong to a team list inside a project space."
        />
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              runTaskCommand(
                { kind: "work-task", id, draft, statusId: status || undefined },
                "Task created"
              )
            ) {
              onClose();
              onCreated(id);
            }
          }}
        >
          <WorkLabel label="Destination List">
            <SearchSelect
              value={draft.projectId}
              disabled={!!parentId}
              options={lists.map((l) => ({ value: l.id, label: l.name }))}
              placeholder="Choose destination list"
              onChange={(lid) => {
                const next = lists.find((l) => l.id === lid);
                setDraft({ ...emptyTask(next), subject: draft.subject, description: draft.description });
                setStatus("");
              }}
            />
          </WorkLabel>

          <WorkLabel label="Task Title">
            <Input
              aria-label="Task title"
              required
              autoFocus
              maxLength={255}
              className="text-sm font-semibold"
              placeholder="e.g. Prepare Quarterly Review Deck"
              value={draft.subject}
              onChange={(e) => change({ subject: e.target.value })}
            />
          </WorkLabel>

          <WorkLabel label="Description">
            <Textarea
              aria-label="Description"
              rows={3}
              placeholder="Add key context, requirements, or definition of done…"
              value={draft.description}
              onChange={(e) => change({ description: e.target.value })}
              className="text-xs resize-none"
            />
          </WorkLabel>

          <div className="grid gap-3 sm:grid-cols-2">
            <WorkLabel label="Status">
              <SearchSelect
                value={
                  status ||
                  statusesFor(state, draft.projectId).find((s) => s.category === "Open")?.id ||
                  ""
                }
                options={statusesFor(state, draft.projectId).map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                onChange={setStatus}
              />
            </WorkLabel>

            <WorkLabel label="Priority">
              <SearchSelect
                value={draft.priority}
                options={TASK_PRIORITIES}
                onChange={(v) => v && change({ priority: v as TaskDraft["priority"] })}
              />
            </WorkLabel>

            <WorkLabel label="Assignees">
              <SearchSelect
                multiple
                value={draft.assigneeIds}
                options={state.people
                  .filter((p) => list?.memberIds.includes(p.id))
                  .map((p) => ({ value: p.id, label: p.name }))}
                onChange={(assigneeIds) => change({ assigneeIds })}
                placeholder="Assign members"
              />
            </WorkLabel>

            <WorkLabel label={`Due Date (${work.timezone})`}>
              <TaskDateInput
                id="quick-task-due"
                value={draft.dueAt}
                timezone={work.timezone}
                onChange={(dueAt) => change({ dueAt })}
              />
            </WorkLabel>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!draft.subject.trim() || !list} className="gap-1.5">
              <Plus className="size-4" />
              <span>Create Task</span>
            </Button>
          </div>
        </form>
      )}
    </WorkModal>
  );
}

export function TaskMoveDialog({
  state,
  ids,
  onClose,
}: {
  state: WorkspaceState;
  ids: string[];
  onClose: () => void;
}) {
  const first = state.tasks.find((t) => t.id === ids[0])!;
  const workspaceId = state.lists.find((l) => l.id === first.listId)!.workspaceId;
  const [listId, setListId] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [assignees, setAssignees] = useState(first.assigneeIds);

  const selected = new Set(ids);
  let more = true;
  while (more) {
    more = false;
    for (const t of state.tasks) {
      if (selected.has(t.parentId) && !selected.has(t.id)) {
        selected.add(t.id);
        more = true;
      }
    }
  }

  const tasks = state.tasks.filter((t) => selected.has(t.id));
  const target = state.lists.find((l) => l.id === listId);
  const oldStatuses = [...new Set(tasks.map((t) => t.statusId))];

  return (
    <WorkModal
      title={`Move ${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
      description="Subtasks move alongside their parents. Map old statuses to the destination list."
      onClose={onClose}
    >
      <div className="space-y-4">
        <WorkLabel label="Destination List">
          <SearchSelect
            value={listId}
            options={state.lists
              .filter(
                (l) =>
                  l.workspaceId === workspaceId && !listArchived(state, l) && canManageNode(state, l)
              )
              .map((l) => ({ value: l.id, label: l.name }))}
            onChange={(id) => {
              setListId(id);
              setStatusMap({});
            }}
            placeholder="Select target list"
          />
        </WorkLabel>

        {target && (
          <>
            <WorkLabel label="Reassign to members in destination">
              <SearchSelect
                multiple
                value={assignees}
                options={state.people
                  .filter((p) => target.memberIds.includes(p.id))
                  .map((p) => ({ value: p.id, label: p.name }))}
                onChange={setAssignees}
              />
            </WorkLabel>

            {oldStatuses.map((id) => {
              const task = tasks.find((t) => t.statusId === id)!;
              const sourceStatus = statusesFor(state, task.listId).find((s) => s.id === id);

              return (
                <WorkLabel key={id} label={`Map status: "${sourceStatus?.name}"`}>
                  <SearchSelect
                    value={statusMap[id] ?? ""}
                    options={statusesFor(state, listId)
                      .filter((s) => s.category === task.status)
                      .map((s) => ({ value: s.id, label: s.name }))}
                    onChange={(value) => setStatusMap({ ...statusMap, [id]: value })}
                    placeholder="Choose matching status"
                  />
                </WorkLabel>
              );
            })}
          </>
        )}

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!target || oldStatuses.some((id) => !statusMap[id])}
            onClick={() => {
              if (
                runTaskCommand(
                  { kind: "work-move", ids, listId, statusMap, assigneeIds: assignees },
                  "Tasks moved"
                )
              ) {
                onClose();
              }
            }}
          >
            Confirm Move
          </Button>
        </div>
      </div>
    </WorkModal>
  );
}

export function WorkspaceTaskDetail({
  state,
  id,
  onOpen,
  onClose,
  fullPage = false,
}: {
  state: WorkspaceState;
  id: string;
  onOpen: (id: string) => void;
  onClose: () => void;
  fullPage?: boolean;
}) {
  const task = state.tasks.find((t) => t.id === id);
  const list = state.lists.find((l) => l.id === task?.listId);

  if (!task || !list || !canSeeList(state, list)) {
    return (
      <WorkEmpty
        title="Task unavailable"
        description="This task may have been removed, archived, or is outside your current member permissions."
        action={<Button variant="outline" onClick={onClose}>Go back</Button>}
      />
    );
  }

  return (
    <TaskContent
      key={`${id}-${state.actorId}`}
      state={state}
      task={task}
      onOpen={onOpen}
      onClose={onClose}
      fullPage={fullPage}
    />
  );
}

function TaskContent({
  state,
  task,
  onOpen,
  onClose,
  fullPage,
}: {
  state: WorkspaceState;
  task: WorkspaceTask;
  onOpen: (id: string) => void;
  onClose: () => void;
  fullPage: boolean;
}) {
  const list = state.lists.find((l) => l.id === task.listId)!;
  const space = state.spaces.find((s) => s.id === list.spaceId);
  const work = state.workspaces.find((w) => w.id === list.workspaceId)!;

  const [addSubtask, setAddSubtask] = useState(false);
  const [moving, setMoving] = useState(false);
  const [checkTitle, setCheckTitle] = useState("");
  const [resource, setResource] = useState({ name: "", url: "" });
  const [reply, setReply] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);

  const pref = preferencesFor(state, work.id);
  const draftKey = `task:${task.id}`;
  const commentKey = `comment:${task.id}`;

  let text = { subject: task.subject, description: task.description };
  try {
    if (pref.drafts[draftKey]) text = JSON.parse(pref.drafts[draftKey]);
  } catch {
    /* Ignore only malformed draft text; the task itself is unchanged. */
  }

  const comment = pref.drafts[commentKey] ?? "";
  const stash = (key: string, value: string) =>
    runTaskCommand({
      kind: "work-preferences",
      workspaceId: work.id,
      patch: { drafts: { ...pref.drafts, [key]: value } },
    });

  const editable =
    canEditTask(state, task) && !isClosed(task) && !task.archived && !listArchived(state, list);

  const save = (
    patch: Partial<TaskDraft>,
    extra: {
      checklist?: ChecklistItem[];
      fields?: WorkspaceTask["fields"];
      resources?: WorkspaceTask["resources"];
    } = {}
  ) =>
    runTaskCommand(
      { kind: "work-task", id: task.id, draft: { ...taskDraft(task), ...patch }, ...extra },
      "Task updated"
    );

  const children = state.tasks.filter((t) => t.parentId === task.id);
  const dependencies = blockedBy(state, task);
  const personOptions = state.people
    .filter((p) => list.memberIds.includes(p.id))
    .map((p) => ({ value: p.id, label: `${p.name} · ${p.employeeCode}` }));

  const comments = state.comments.filter((c) => c.taskId === task.id);
  const activity = state.activities
    .filter((a) => a.taskId === task.id)
    .slice(-20)
    .reverse();

  const dirty = text.subject !== task.subject || text.description !== task.description;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${location.origin}/workspaces/${work.id}/tasks/${task.id}`
      );
      toast.success("Task link copied");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const reorderCheck = (index: number, delta: number) => {
    const checklist = [...task.checklist];
    [checklist[index], checklist[index + delta]] = [checklist[index + delta], checklist[index]];
    save({}, { checklist });
  };

  const isFavorited = pref.favorites.includes(task.id);
  const isWatching = task.watcherIds.includes(state.actorId);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header bar: Breadcrumb & Actions */}
      <header className="flex shrink-0 items-center justify-between border-b bg-card px-5 py-3 sm:px-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <span className="truncate">{space?.name ?? "Space"}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          <Link
            href={`/workspaces/${work.id}/lists/${list.id}`}
            className="truncate font-medium text-foreground hover:text-primary transition-colors"
          >
            {list.name}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="font-mono text-[11px] font-semibold text-primary">{task.code}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy task link"
            onClick={copyLink}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Link2 className="size-4" />
          </Button>

          {!fullPage && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open task full page"
              nativeButton={false}
              render={<Link href={`/workspaces/${work.id}/tasks/${task.id}`} />}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowUpRight className="size-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close task"
            onClick={onClose}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main 2-column detail body */}
      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:overflow-hidden">
        {/* Left Column: Properties & Content */}
        <section className="min-w-0 space-y-7 p-5 sm:p-7 lg:overflow-y-auto">
          {/* Top Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5">
              {task.code}
            </Badge>

            {task.archived && (
              <Badge variant="secondary" className="text-xs">
                Archived
              </Badge>
            )}

            <WorkStatusBadge state={state} task={task} />

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant={isWatching ? "secondary" : "ghost"}
                size="sm"
                aria-label={isWatching ? "Stop watching" : "Watch task"}
                className={cn("h-7 gap-1 text-xs", isWatching && "text-primary font-medium")}
                onClick={() => runTaskCommand({ kind: "work-watch", id: task.id })}
              >
                <Eye className="size-3.5" />
                <span>{isWatching ? "Watching" : "Watch"}</span>
              </Button>

              <WorkMenu
                actions={[
                  {
                    label: isFavorited ? "Remove favorite" : "Add to favorites",
                    onClick: () =>
                      runTaskCommand({
                        kind: "work-preferences",
                        workspaceId: work.id,
                        patch: {
                          favorites: isFavorited
                            ? pref.favorites.filter((fid) => fid !== task.id)
                            : [...pref.favorites, task.id],
                        },
                      }),
                  },
                  {
                    label: "Move to another list",
                    disabled: !canManageNode(state, list),
                    onClick: () => setMoving(true),
                  },
                  {
                    label: "Duplicate with subtasks",
                    icon: <Copy className="size-3.5" />,
                    disabled: !canEditTask(state, task),
                    onClick: () =>
                      runTaskCommand({ kind: "work-duplicate", id: task.id }, "Task duplicated"),
                  },
                  {
                    label: task.archived ? "Restore task" : "Archive task",
                    danger: !task.archived,
                    disabled: !canManageNode(state, list),
                    onClick: () => {
                      if (
                        window.confirm(
                          `${task.archived ? "Restore" : "Archive"} this task? History will be preserved.`
                        )
                      ) {
                        runTaskCommand({
                          kind: "work-bulk",
                          ids: [task.id],
                          patch: {},
                          archived: !task.archived,
                        });
                      }
                    },
                  },
                ]}
              />
            </div>
          </div>

          {/* Task Title (Inline editable) */}
          <div className="space-y-1">
            <Input
              aria-label="Task title"
              disabled={!editable}
              value={text.subject}
              onChange={(e) =>
                stash(draftKey, JSON.stringify({ ...text, subject: e.target.value }))
              }
              className="h-auto border-0 bg-transparent px-0 py-1 text-2xl font-bold tracking-tight text-foreground shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 sm:text-3xl"
              placeholder="Task title…"
            />

            {task.parentId && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GitBranch className="size-3 text-muted-foreground" />
                <span>Subtask of:</span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs font-medium text-foreground hover:text-primary"
                  onClick={() => onOpen(task.parentId)}
                >
                  {state.tasks.find((t) => t.id === task.parentId)?.subject}
                </Button>
              </div>
            )}
          </div>

          {/* Blocked Alert Banner */}
          {dependencies.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
              <GitBranch className="size-4 shrink-0 text-amber-600" />
              <span>
                Blocked by <strong>{dependencies.length}</strong> unfinished{" "}
                {dependencies.length === 1 ? "dependency" : "dependencies"}.
              </span>
            </div>
          )}

          {/* Core Properties Grid */}
          <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Properties
            </h3>

            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <WorkLabel label="Status">
                <SearchSelect
                  value={task.statusId}
                  disabled={!canWriteWorkspace(state, work.id) || task.archived}
                  options={statusesFor(state, list.id).map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  onChange={(sid) => {
                    if (!sid) return;
                    const next = statusesFor(state, list.id).find((s) => s.id === sid);
                    if (
                      next?.category === "Cancelled" &&
                      !window.confirm("Cancel this task? Dependencies will treat it as resolved.")
                    ) {
                      return;
                    }
                    runTaskCommand(
                      { kind: "work-status", ids: [task.id], statusIds: { [task.id]: sid } },
                      "Status updated"
                    );
                  }}
                />
              </WorkLabel>

              <WorkLabel label="Assignees">
                <SearchSelect
                  multiple
                  disabled={!editable}
                  value={task.assigneeIds}
                  options={personOptions}
                  placeholder="Assign people"
                  onChange={(assigneeIds) => save({ assigneeIds })}
                />
              </WorkLabel>

              <WorkLabel label="Priority">
                <SearchSelect
                  disabled={!editable}
                  value={task.priority}
                  options={TASK_PRIORITIES}
                  onChange={(value) =>
                    value && save({ priority: value as TaskDraft["priority"] })
                  }
                />
              </WorkLabel>

              <WorkLabel label="Type">
                <SearchSelect
                  disabled={!editable}
                  value={task.type}
                  options={TASK_TYPES}
                  onChange={(type) => type && save({ type })}
                />
              </WorkLabel>

              <WorkLabel label={`Start Date (${work.timezone})`}>
                <fieldset disabled={!editable}>
                  <TaskDateInput
                    id={`start-${task.id}`}
                    value={task.startAt}
                    timezone={work.timezone}
                    onChange={(startAt) => save({ startAt })}
                  />
                </fieldset>
              </WorkLabel>

              <WorkLabel label={`Due Date (${work.timezone})`}>
                <fieldset disabled={!editable}>
                  <TaskDateInput
                    id={`due-${task.id}`}
                    value={task.dueAt}
                    timezone={work.timezone}
                    onChange={(dueAt) => save({ dueAt })}
                  />
                </fieldset>
              </WorkLabel>

              <WorkLabel label="Estimated Hours">
                <Input
                  disabled={!editable}
                  type="number"
                  min={0}
                  step={0.5}
                  defaultValue={task.estimateHours}
                  key={`estimate-${task.estimateHours}`}
                  onBlur={(e) =>
                    Number(e.target.value) !== task.estimateHours &&
                    save({ estimateHours: Number(e.target.value) })
                  }
                  className="text-xs"
                />
              </WorkLabel>

              <WorkLabel label="Progress %">
                <div className="flex items-center gap-3">
                  <Progress value={task.progress} className="h-2 flex-1" />
                  <Input
                    aria-label="Progress percent"
                    className="w-20 text-xs text-right font-mono"
                    disabled={!editable}
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={task.progress}
                    key={`progress-${task.progress}`}
                    onBlur={(e) =>
                      Number(e.target.value) !== task.progress &&
                      save({ progress: Number(e.target.value) })
                    }
                  />
                </div>
              </WorkLabel>

              <WorkLabel label="Reviewer">
                <SearchSelect
                  disabled={!editable}
                  value={task.reviewerId}
                  options={personOptions}
                  placeholder="Select reviewer"
                  onChange={(reviewerId) => save({ reviewerId })}
                />
              </WorkLabel>

              <WorkLabel label="Approval Requirement">
                <div className="flex h-9 items-center">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                    <Checkbox
                      checked={task.reviewRequired}
                      disabled={!editable}
                      onCheckedChange={(v) => save({ reviewRequired: !!v })}
                    />
                    <span>Review required before completion</span>
                  </label>
                </div>
              </WorkLabel>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <Textarea
              disabled={!editable}
              value={text.description}
              rows={5}
              placeholder="Add key objectives, specifications, or reference details…"
              onChange={(e) =>
                stash(draftKey, JSON.stringify({ ...text, description: e.target.value }))
              }
              className="resize-y rounded-xl border bg-muted/20 p-3 text-sm leading-relaxed"
            />
            {dirty && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => {
                    if (save(text)) stash(draftKey, "");
                  }}
                  className="text-xs font-semibold"
                >
                  Save changes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => stash(draftKey, "")}
                  className="text-xs"
                >
                  Discard
                </Button>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Draft saved locally
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tags
            </h3>
            <Input
              disabled={!editable}
              defaultValue={task.tags.join(", ")}
              key={`tags-${task.tags.join()}`}
              placeholder="e.g. frontend, high-impact, bugfix (comma-separated)"
              onBlur={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                if (tags.join() !== task.tags.join()) save({ tags });
              }}
              className="text-xs rounded-xl"
            />
          </div>

          {/* Custom Fields (if configured on list) */}
          {!!fieldsFor(state, list.id).length && (
            <div className="space-y-3 rounded-2xl border bg-muted/20 p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Custom Fields
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {fieldsFor(state, list.id).map((f) => (
                  <WorkLabel key={f.id} label={f.name}>
                    <CustomFieldInput
                      field={f}
                      value={task.fields[f.id] ?? null}
                      disabled={!editable}
                      onChange={(value) =>
                        save({}, { fields: { ...task.fields, [f.id]: value } })
                      }
                    />
                  </WorkLabel>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          <section className="space-y-3 rounded-2xl border p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
                <Badge variant="secondary" className="font-mono text-xs">
                  {children.length}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!editable}
                onClick={() => setAddSubtask(true)}
                className="h-7 text-xs gap-1"
              >
                <Plus className="size-3.5" />
                <span>Add Subtask</span>
              </Button>
            </div>

            {children.length > 0 ? (
              <div className="divide-y divide-border/50">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center gap-3 py-2.5">
                    <WorkStatusBadge state={state} task={child} />
                    <Button
                      variant="link"
                      className="h-auto flex-1 justify-start p-0 text-left text-xs font-medium text-foreground hover:text-primary whitespace-normal"
                      onClick={() => onOpen(child.id)}
                    >
                      {child.subject}
                    </Button>
                    <WorkPeople state={state} ids={child.assigneeIds} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-xs text-muted-foreground">
                Break this outcome into smaller deliverables.
              </p>
            )}
          </section>

          {/* Checklist Section */}
          <section className="space-y-3 rounded-2xl border p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Checklist</h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {task.checklist.filter((i) => i.done).length}/{task.checklist.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {task.checklist.map((item, index) => (
                <div key={item.id} className="space-y-1.5 rounded-xl border bg-muted/20 p-2.5">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      aria-label={`Complete ${item.title}`}
                      disabled={!editable}
                      checked={item.done}
                      onCheckedChange={(done) =>
                        save(
                          {},
                          {
                            checklist: task.checklist.map((i) =>
                              i.id === item.id ? { ...i, done: !!done } : i
                            ),
                          }
                        )
                      }
                    />
                    <Input
                      disabled={!editable}
                      className={cn(
                        "h-7 flex-1 border-0 bg-transparent px-1 text-xs font-medium focus-visible:ring-0",
                        item.done && "text-muted-foreground line-through"
                      )}
                      defaultValue={item.title}
                      key={`${item.id}-${item.title}`}
                      aria-label="Checklist item"
                      onBlur={(e) =>
                        e.target.value !== item.title &&
                        save(
                          {},
                          {
                            checklist: task.checklist.map((i) =>
                              i.id === item.id ? { ...i, title: e.target.value } : i
                            ),
                          }
                        )
                      }
                    />
                    <OrderButtons
                      first={!editable || index === 0}
                      last={!editable || index === task.checklist.length - 1}
                      up={() => reorderCheck(index, -1)}
                      down={() => reorderCheck(index, 1)}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!editable}
                      aria-label="Remove checklist item"
                      onClick={() =>
                        save(
                          {},
                          { checklist: task.checklist.filter((i) => i.id !== item.id) }
                        )
                      }
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>

                  <div className="ml-6 max-w-56">
                    <SearchSelect
                      disabled={!editable}
                      value={item.assigneeId}
                      options={personOptions}
                      placeholder="Assign item"
                      onChange={(assigneeId) =>
                        save(
                          {},
                          {
                            checklist: task.checklist.map((i) =>
                              i.id === item.id ? { ...i, assigneeId } : i
                            ),
                          }
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              {editable && (
                <form
                  className="flex gap-2 pt-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      checkTitle.trim() &&
                      save(
                        {},
                        {
                          checklist: [
                            ...task.checklist,
                            {
                              id: crypto.randomUUID(),
                              title: checkTitle.trim(),
                              done: false,
                              assigneeId: "",
                            },
                          ],
                        }
                      )
                    ) {
                      setCheckTitle("");
                    }
                  }}
                >
                  <Input
                    value={checkTitle}
                    onChange={(e) => setCheckTitle(e.target.value)}
                    placeholder="Add checklist item…"
                    aria-label="New checklist item"
                    className="h-8 text-xs rounded-lg"
                  />
                  <Button
                    variant="outline"
                    type="submit"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Add</span>
                  </Button>
                </form>
              )}
            </div>
          </section>

          {/* Dependencies Section */}
          <section className="space-y-3 rounded-2xl border p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dependencies
            </h3>
            <SearchSelect
              multiple
              value={task.dependencyIds}
              disabled={!editable}
              options={state.tasks
                .filter(
                  (t) =>
                    t.id !== task.id &&
                    state.lists.some(
                      (l) => l.id === t.listId && l.workspaceId === work.id && canSeeList(state, l)
                    )
                )
                .map((t) => ({ value: t.id, label: `${t.code} · ${t.subject}` }))}
              onChange={(dependencyIds) => save({ dependencyIds })}
              placeholder="Waiting on tasks…"
            />

            {state.tasks
              .filter(
                (t) =>
                  t.dependencyIds.includes(task.id) &&
                  state.lists.some((l) => l.id === t.listId && canSeeList(state, l))
              )
              .map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Unblocks:</span>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs font-medium text-foreground hover:text-primary"
                    onClick={() => onOpen(t.id)}
                  >
                    {t.subject} ({t.code})
                  </Button>
                </div>
              ))}
          </section>

          {/* Linked Resources */}
          <section className="space-y-3 rounded-2xl border p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Linked Resources
            </h3>

            {task.resources.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border bg-muted/20 p-2.5 text-xs"
              >
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  <span>{r.name}</span>
                </a>
                <Button
                  disabled={!editable}
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${r.name}`}
                  onClick={() =>
                    save(
                      {},
                      { resources: task.resources.filter((item) => item.id !== r.id) }
                    )
                  }
                  className="size-6 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}

            {editable && (
              <form
                className="flex flex-wrap gap-2 pt-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    save(
                      {},
                      { resources: [...task.resources, { id: crypto.randomUUID(), ...resource }] }
                    )
                  ) {
                    setResource({ name: "", url: "" });
                  }
                }}
              >
                <Input
                  aria-label="Resource name"
                  className="min-w-28 flex-1 h-8 text-xs"
                  required
                  placeholder="Doc / Spec title"
                  value={resource.name}
                  onChange={(e) => setResource({ ...resource, name: e.target.value })}
                />
                <Input
                  aria-label="Resource URL"
                  className="min-w-40 flex-1 h-8 text-xs"
                  type="url"
                  required
                  placeholder="https://…"
                  value={resource.url}
                  onChange={(e) => setResource({ ...resource, url: e.target.value })}
                />
                <Button variant="outline" size="sm" type="submit" className="h-8 text-xs">
                  Add link
                </Button>
              </form>
            )}
          </section>

          {/* Audit Metadata Footer */}
          <div className="pt-2 text-[11px] text-muted-foreground/80 space-y-1">
            <p>
              Created by <span className="font-semibold">{personName(state, task.createdBy)}</span>{" "}
              on {formatTaskDate(task.createdAt, work.timezone, true)}
            </p>
            {task.completedAt && (
              <p>
                Completed on {formatTaskDate(task.completedAt, work.timezone, true)}
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Activity & Comments Thread */}
        <aside className="flex min-h-96 flex-col border-t bg-muted/20 lg:min-h-0 lg:border-t-0 lg:border-l">
          <div className="flex items-center justify-between border-b bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Activity & Comments
              </h3>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {comments.length}
            </Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {comments.map((c) => (
              <article
                key={c.id}
                className={cn(
                  "space-y-2 rounded-xl border bg-card p-3 shadow-2xs",
                  c.parentId && "ml-4 border-l-2 border-primary/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <WorkPeople state={state} ids={[c.actorId]} />
                  <span className="text-xs font-semibold text-foreground">
                    {personName(state, c.actorId)}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {formatTaskDate(c.at, work.timezone)}
                  </span>
                </div>

                {c.parentId && (
                  <p className="truncate text-[10px] text-muted-foreground">
                    Replying to {personName(state, comments.find((item) => item.id === c.parentId)?.actorId ?? "")}
                  </p>
                )}

                <p
                  className={cn(
                    "whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground",
                    c.deleted && "italic text-muted-foreground"
                  )}
                >
                  {c.body}
                </p>

                {!!c.mentions?.length && (
                  <div className="flex flex-wrap gap-1">
                    {c.mentions.map((mid) => (
                      <Badge key={mid} variant="secondary" className="text-[10px] font-medium text-primary">
                        @{personName(state, mid)}
                      </Badge>
                    ))}
                  </div>
                )}

                {!c.deleted && canWriteWorkspace(state, work.id) && (
                  <div className="flex items-center gap-3 border-t pt-2 text-[11px]">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setReply(c.id);
                        setEditingComment("");
                      }}
                    >
                      Reply
                    </Button>
                    {c.actorId === state.actorId && (
                      <>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-[11px] text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingComment(c.id);
                            stash(commentKey, c.body);
                            setMentions(c.mentions ?? []);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-[11px] text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (window.confirm("Remove your comment?")) {
                              runTaskCommand({
                                kind: "work-comment",
                                taskId: task.id,
                                id: c.id,
                                body: "",
                                mentions: [],
                                deleted: true,
                              });
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </article>
            ))}

            {/* Audit log timeline */}
            {activity.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Activity Timeline
                </p>
                <div className="space-y-2.5">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 text-[11px] text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      <div>
                        <span className="font-semibold text-foreground">
                          {personName(state, a.actorId)}
                        </span>{" "}
                        <span>{a.message}</span>
                        <span className="block font-mono text-[9px] text-muted-foreground/70">
                          {formatTaskDate(a.at, work.timezone, true)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Comment composer */}
          {canWriteWorkspace(state, work.id) && (
            <form
              className="space-y-2 border-t bg-card p-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  runTaskCommand(
                    {
                      kind: "work-comment",
                      taskId: task.id,
                      id: editingComment || undefined,
                      body: comment,
                      parentId: reply || undefined,
                      mentions,
                    },
                    "Comment saved"
                  )
                ) {
                  stash(commentKey, "");
                  setReply("");
                  setEditingComment("");
                  setMentions([]);
                }
              }}
            >
              {(reply || editingComment) && (
                <div className="flex items-center justify-between text-xs text-primary font-medium">
                  <span>{editingComment ? "Editing your comment" : "Replying to comment"}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Cancel reply"
                    onClick={() => {
                      setReply("");
                      setEditingComment("");
                    }}
                    className="size-5"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              )}

              <Textarea
                value={comment}
                onChange={(e) => stash(commentKey, e.target.value)}
                placeholder="Write an update or comment…"
                aria-label="Comment"
                rows={3}
                className="text-xs resize-none rounded-xl"
              />

              <SearchSelect
                multiple
                value={mentions}
                options={personOptions}
                onChange={setMentions}
                placeholder="Mention teammates (@)"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">Drafts auto-saved</span>
                <Button size="sm" type="submit" disabled={!comment.trim()} className="gap-1.5 text-xs">
                  <Send className="size-3" />
                  <span>{editingComment ? "Save" : "Post"}</span>
                </Button>
              </div>
            </form>
          )}
        </aside>
      </div>

      {addSubtask && (
        <QuickTask
          state={state}
          scope={{ kind: "list", id: list.id, workspaceId: work.id }}
          listId={list.id}
          parentId={task.id}
          onClose={() => setAddSubtask(false)}
          onCreated={onOpen}
        />
      )}

      {moving && <TaskMoveDialog state={state} ids={[task.id]} onClose={() => setMoving(false)} />}
    </div>
  );
}
