"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Layers,
  Pencil,
  Plus,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchSelect } from "@/components/shared/search-select";
import { canEditTask, formatTaskDate, isClosed, isOverdue } from "@/lib/tasks/domain";
import {
  fieldsFor,
  groupsFor,
  scopeLists,
  statusesFor,
  taskDraft,
  taskGroup,
} from "@/lib/tasks/workspace-model";
import { TASK_PRIORITIES, type TaskDraft } from "@/lib/tasks/types";
import type {
  WorkScope,
  WorkView,
  WorkspaceCommand,
  WorkspaceState,
  WorkspaceTask,
} from "@/lib/tasks/workspace-types";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { WorkEmpty, WorkLabel, WorkModal, WorkPeople, WorkPriority, WorkStatusBadge } from "./common";
import { CustomFieldInput, TaskMoveDialog } from "./task-panel";
import { TaskDateInput } from "../task-shared";
import { cn } from "@/lib/utils";

export const BASE_FIELDS = [
  { value: "status", label: "Status" },
  { value: "assignee", label: "Assignee" },
  { value: "priority", label: "Priority" },
  { value: "due", label: "Due Date" },
  { value: "start", label: "Start Date" },
  { value: "estimate", label: "Estimate" },
  { value: "progress", label: "Progress" },
  { value: "list", label: "List" },
  { value: "tags", label: "Tags" },
];

export function WorkspaceTable({
  state,
  scope,
  view,
  tasks,
  selected,
  onSelect,
  onOpen,
  onView,
  onCreate,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  view: WorkView;
  tasks: WorkspaceTask[];
  selected: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onOpen: (id: string) => void;
  onView: (view: WorkView) => void;
  onCreate: (listId?: string, statusId?: string) => void;
}) {
  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);
  const [foldedTasks, setFoldedTasks] = useState<string[]>([]);
  const groups =
    view.type === "table"
      ? [{ id: "all", name: "All Tasks", color: "#64748b" }]
      : groupsFor(state, scope, view.groupBy);

  const nested = view.type === "list" && view.subtasks === "nested";
  const roots = nested ? tasks.filter((t) => !tasks.some((p) => p.id === t.parentId)) : tasks;
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect(next);
  };

  const label = (field: string) =>
    BASE_FIELDS.find((f) => f.value === field)?.label ??
    state.fields.find((f) => `field:${f.id}` === field)?.name ??
    field;

  const cellValue = (task: WorkspaceTask, field: string) => {
    if (field === "status") return <WorkStatusBadge state={state} task={task} />;
    if (field === "assignee") return <WorkPeople state={state} ids={task.assigneeIds} />;
    if (field === "priority") return <WorkPriority value={task.priority} label />;
    if (field === "due" || field === "start") {
      const dt = field === "due" ? task.dueAt : task.startAt;
      const overdue = field === "due" && isOverdue(task, new Date());
      return (
        <span
          className={cn(
            "text-xs font-mono font-medium",
            overdue ? "text-rose-500 dark:text-rose-400" : "text-muted-foreground"
          )}
        >
          {formatTaskDate(dt, timezone) || "—"}
        </span>
      );
    }
    if (field === "estimate") {
      return (
        <span className="text-xs font-mono text-muted-foreground">
          {task.estimateHours ? `${task.estimateHours}h` : "—"}
        </span>
      );
    }
    if (field === "progress") {
      return (
        <div className="flex items-center gap-2 w-full">
          <Progress value={task.progress} className="h-1.5 flex-1" />
          <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">
            {task.progress}%
          </span>
        </div>
      );
    }
    if (field === "list") {
      return (
        <span className="text-xs font-medium text-foreground truncate">
          {state.lists.find((l) => l.id === task.listId)?.name}
        </span>
      );
    }
    if (field === "tags") {
      return task.tags.length ? (
        <div className="flex flex-wrap gap-1 truncate">
          {task.tags.map((t) => (
            <Badge key={t} variant="secondary" className="px-1 py-0 text-[9px] font-normal">
              {t}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    }

    const f = state.fields.find((item) => `field:${item.id}` === field);
    const value = f && task.fields[f.id];
    return (
      <span className="text-xs text-foreground truncate">
        {f?.options.find((o) => o.id === value)?.label ??
          (value == null || value === ""
            ? "—"
            : typeof value === "boolean"
              ? value
                ? "Yes"
                : "No"
              : String(value))}
      </span>
    );
  };

  const row = (task: WorkspaceTask, depth = 0): React.ReactNode => {
    const children = nested ? tasks.filter((t) => t.parentId === task.id) : [];
    const folded = foldedTasks.includes(task.id);

    return (
      <FragmentRows
        key={task.id}
        rows={
          <>
            <TableRow
              data-state={selected.has(task.id) ? "selected" : undefined}
              className={cn(
                "group transition-colors hover:bg-muted/30",
                selected.has(task.id) && "bg-primary/5"
              )}
            >
              <TableCell className="w-10 px-3">
                <Checkbox
                  checked={selected.has(task.id)}
                  aria-label={`Select ${task.subject}`}
                  onCheckedChange={() => toggle(task.id)}
                />
              </TableCell>

              <TableCell className="min-w-80 px-3">
                <div
                  className="flex items-center gap-2"
                  style={{ paddingLeft: depth * 20 }}
                >
                  {!!children.length && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`${folded ? "Expand" : "Collapse"} subtasks`}
                      onClick={() =>
                        setFoldedTasks(
                          folded
                            ? foldedTasks.filter((id) => id !== task.id)
                            : [...foldedTasks, task.id]
                        )
                      }
                      className="size-5 text-muted-foreground hover:text-foreground"
                    >
                      {folded ? (
                        <ChevronRight className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="link"
                    className={cn(
                      "h-auto min-w-0 flex-1 justify-start p-0 text-left text-xs font-semibold text-foreground hover:text-primary hover:no-underline whitespace-normal",
                      view.density === "compact" ? "py-1" : "py-2.5"
                    )}
                    onClick={() => onOpen(task.id)}
                  >
                    <span className="line-clamp-1">{task.subject}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="size-6 shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                    size="icon-sm"
                    aria-label={`Rename ${task.subject}`}
                    disabled={!canEditTask(state, task) || isClosed(task)}
                    onClick={() => setEditing({ id: task.id, field: "name" })}
                  >
                    <Pencil className="size-3 text-muted-foreground" />
                  </Button>

                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {task.code}
                  </span>
                </div>
              </TableCell>

              {view.fields.map((field) => (
                <TableCell
                  key={field}
                  style={{
                    minWidth: view.widths[field] ?? 145,
                    maxWidth: view.widths[field] ?? 220,
                  }}
                  className="px-3"
                >
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start overflow-hidden px-1.5 py-1 text-left text-xs font-normal hover:bg-muted/50 rounded-lg"
                    disabled={
                      field === "list" ||
                      (field !== "status" && (!canEditTask(state, task) || isClosed(task))) ||
                      (field.startsWith("field:") &&
                        !fieldsFor(state, task.listId).some((f) => `field:${f.id}` === field))
                    }
                    aria-label={`Edit ${label(field)} for ${task.subject}`}
                    onClick={() => setEditing({ id: task.id, field })}
                  >
                    {cellValue(task, field)}
                  </Button>
                </TableCell>
              ))}
            </TableRow>

            {!folded && children.map((child) => row(child, depth + 1))}
          </>
        }
      />
    );
  };

  const editingTask = editing && state.tasks.find((t) => t.id === editing.id);

  return (
    <div className="h-full overflow-auto p-5 sm:p-6 space-y-6">
      {!tasks.length && (
        <WorkEmpty
          title="No tasks found"
          description="Adjust your view filters or add the next piece of work to this list."
          action={
            <Button size="sm" onClick={() => onCreate()} className="gap-1.5">
              <Plus className="size-3.5" />
              <span>Add task</span>
            </Button>
          }
        />
      )}

      {groups.map((group) => {
        const items =
          view.type === "table"
            ? roots
            : roots.filter((t) => taskGroup(t, view.groupBy, groups) === group.id);
        const folded = view.folded.includes(group.id);

        return (
          <section key={group.id} className="rounded-2xl border bg-card/60 shadow-2xs overflow-hidden">
            {view.type !== "table" && (
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      onView({
                        ...view,
                        folded: folded
                          ? view.folded.filter((id) => id !== group.id)
                          : [...view.folded, group.id],
                      })
                    }
                    aria-label={`Toggle ${group.name}`}
                    className="size-6"
                  >
                    {folded ? (
                      <ChevronRight className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: group.color || "var(--primary)" }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {group.name}
                    </span>
                  </div>

                  <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                    {items.length}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                  onClick={() =>
                    onCreate(
                      scope.kind === "list" ? scope.id : undefined,
                      view.groupBy === "status" &&
                        statusesFor(state, scope.id).some((s) => s.id === group.id)
                        ? group.id
                        : undefined
                    )
                  }
                >
                  <Plus className="size-3" />
                  <span>Add Task</span>
                </Button>
              </div>
            )}

            {!folded && (
              <>
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="w-10 px-3">
                        <Checkbox
                          aria-label={`Select ${group.name}`}
                          checked={
                            items.length > 0 && items.every((t) => selected.has(t.id))
                          }
                          onCheckedChange={(checked) => {
                            const next = new Set(selected);
                            items.forEach((t) => (checked ? next.add(t.id) : next.delete(t.id)));
                            onSelect(next);
                          }}
                        />
                      </TableHead>
                      <TableHead className="px-3 text-xs font-semibold">Task Name</TableHead>
                      {view.fields.map((field) => (
                        <TableHead key={field} className="px-3 text-xs font-semibold">
                          {label(field)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/40">
                    {items.map((t) => row(t))}
                  </TableBody>
                </Table>

                <div className="border-t bg-muted/10 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl"
                    onClick={() =>
                      onCreate(
                        scope.kind === "list" ? scope.id : undefined,
                        view.groupBy === "status" &&
                          statusesFor(state, scope.id).some((s) => s.id === group.id)
                          ? group.id
                          : undefined
                      )
                    }
                  >
                    <Plus className="size-3.5" />
                    <span>Add Task</span>
                  </Button>
                </div>
              </>
            )}
          </section>
        );
      })}

      {editing && editingTask && (
        <InlineEditor
          key={`${editing.id}-${editing.field}`}
          state={state}
          task={editingTask}
          field={editing.field}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function FragmentRows({ rows }: { rows: React.ReactNode }) {
  return <>{rows}</>;
}

function InlineEditor({
  state,
  task,
  field,
  onClose,
}: {
  state: WorkspaceState;
  task: WorkspaceTask;
  field: string;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(taskDraft(task));
  const [status, setStatus] = useState(task.statusId);
  const [fields, setFields] = useState(task.fields);
  const list = state.lists.find((l) => l.id === task.listId)!;
  const timezone = state.workspaces.find((w) => w.id === list.workspaceId)!.timezone;
  const custom = state.fields.find((f) => `field:${f.id}` === field);

  return (
    <WorkModal title={`Edit ${custom?.name ?? BASE_FIELDS.find((b) => b.value === field)?.label ?? field}`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            field === "status" &&
            statusesFor(state, list.id).find((s) => s.id === status)?.category === "Cancelled" &&
            !window.confirm("Cancel this task?")
          ) {
            return;
          }
          if (
            runTaskCommand(
              field === "status"
                ? { kind: "work-status", ids: [task.id], statusIds: { [task.id]: status } }
                : { kind: "work-task", id: task.id, draft, fields },
              "Task updated"
            )
          ) {
            onClose();
          }
        }}
      >
        {field === "name" && (
          <WorkLabel label="Task Name">
            <Input
              autoFocus
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              aria-label="Task name"
            />
          </WorkLabel>
        )}

        {field === "status" && (
          <WorkLabel label="Status">
            <SearchSelect
              value={status}
              options={statusesFor(state, task.listId).map((s) => ({ value: s.id, label: s.name }))}
              onChange={(v) => v && setStatus(v)}
            />
          </WorkLabel>
        )}

        {field === "assignee" && (
          <WorkLabel label="Assignees">
            <SearchSelect
              multiple
              value={draft.assigneeIds}
              options={state.people
                .filter((p) => list.memberIds.includes(p.id))
                .map((p) => ({ value: p.id, label: p.name }))}
              onChange={(assigneeIds) => setDraft({ ...draft, assigneeIds })}
            />
          </WorkLabel>
        )}

        {field === "priority" && (
          <WorkLabel label="Priority">
            <SearchSelect
              value={draft.priority}
              options={TASK_PRIORITIES}
              onChange={(priority) =>
                priority && setDraft({ ...draft, priority: priority as TaskDraft["priority"] })
              }
            />
          </WorkLabel>
        )}

        {(field === "due" || field === "start") && (
          <WorkLabel label={field === "due" ? "Due Date" : "Start Date"}>
            <TaskDateInput
              id="inline-date"
              timezone={timezone}
              value={field === "due" ? draft.dueAt : draft.startAt}
              onChange={(value) =>
                setDraft({ ...draft, [field === "due" ? "dueAt" : "startAt"]: value })
              }
            />
          </WorkLabel>
        )}

        {(field === "estimate" || field === "progress") && (
          <WorkLabel label={field === "estimate" ? "Estimate (Hours)" : "Progress %"}>
            <Input
              type="number"
              min={0}
              max={field === "progress" ? 100 : undefined}
              aria-label={field}
              value={field === "estimate" ? draft.estimateHours : draft.progress}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [field === "estimate" ? "estimateHours" : "progress"]: Number(e.target.value),
                })
              }
            />
          </WorkLabel>
        )}

        {field === "tags" && (
          <WorkLabel label="Tags">
            <Input
              value={draft.tags.join(",")}
              aria-label="Tags separated by commas"
              onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",") })}
              placeholder="e.g. urgent, backend"
            />
          </WorkLabel>
        )}

        {custom && (
          <WorkLabel label={custom.name}>
            <CustomFieldInput
              field={custom}
              value={fields[custom.id] ?? null}
              onChange={(v) => setFields({ ...fields, [custom.id]: v })}
            />
          </WorkLabel>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </WorkModal>
  );
}

export function BulkEditor({
  state,
  scope,
  ids,
  onClose,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  ids: string[];
  onClose: () => void;
}) {
  const [action, setAction] = useState("priority");
  const [value, setValue] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [dates, setDates] = useState<{ startAt: string | null; dueAt: string | null }>({
    startAt: null,
    dueAt: null,
  });
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const tasks = state.tasks.filter((t) => ids.includes(t.id));
  const members = state.people.filter((p) =>
    tasks.every((t) => state.lists.find((l) => l.id === t.listId)?.memberIds.includes(p.id))
  );
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;

  if (action === "move") return <TaskMoveDialog state={state} ids={ids} onClose={onClose} />;

  const submit = () => {
    let command: WorkspaceCommand;
    if (action === "status") {
      command = { kind: "work-status", ids, statusIds: statuses };
    } else {
      command = {
        kind: "work-bulk",
        ids,
        ...(action === "archive" ? { archived: true } : {}),
        patch:
          action === "priority"
            ? { priority: value as TaskDraft["priority"] }
            : action === "assignee"
              ? { assigneeIds: people }
              : action === "tags"
                ? { tags: value.split(",").map((s) => s.trim()).filter(Boolean) }
                : action === "dates"
                  ? dates
                  : {},
      };
    }

    if (
      (action === "archive" ||
        (action === "status" &&
          tasks.some(
            (t) =>
              statusesFor(state, t.listId).find((s) => s.id === statuses[t.id])?.category ===
              "Cancelled"
          ))) &&
      !window.confirm(`Confirm ${action} for ${ids.length} selected tasks?`)
    ) {
      return;
    }

    if (runTaskCommand(command, `${ids.length} tasks updated`)) onClose();
  };

  return (
    <WorkModal
      title={`Batch Update (${ids.length} tasks)`}
      description="Apply bulk updates across all selected tasks simultaneously."
      onClose={onClose}
    >
      <div className="space-y-4">
        <WorkLabel label="Action to perform">
          <SearchSelect
            value={action}
            options={[
              { value: "priority", label: "Change Priority" },
              { value: "status", label: "Change Status" },
              { value: "assignee", label: "Replace Assignments" },
              { value: "tags", label: "Replace Tags" },
              { value: "dates", label: "Set Dates" },
              { value: "move", label: "Move to Another List" },
              { value: "archive", label: "Archive Tasks" },
            ]}
            onChange={(v) => v && setAction(v)}
          />
        </WorkLabel>

        {action === "priority" && (
          <WorkLabel label="New Priority">
            <SearchSelect value={value} options={TASK_PRIORITIES} onChange={setValue} />
          </WorkLabel>
        )}

        {action === "tags" && (
          <WorkLabel label="New Tags (comma-separated)">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. backend, q3"
            />
          </WorkLabel>
        )}

        {action === "assignee" && (
          <WorkLabel label="New Assignees">
            <SearchSelect
              multiple
              value={people}
              options={members.map((p) => ({ value: p.id, label: p.name }))}
              onChange={setPeople}
              placeholder="Select members"
            />
          </WorkLabel>
        )}

        {action === "dates" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <WorkLabel label="Start Date">
              <TaskDateInput
                id="bulk-start"
                timezone={timezone}
                value={dates.startAt}
                onChange={(startAt) => setDates({ ...dates, startAt })}
              />
            </WorkLabel>
            <WorkLabel label="Due Date">
              <TaskDateInput
                id="bulk-due"
                timezone={timezone}
                value={dates.dueAt}
                onChange={(dueAt) => setDates({ ...dates, dueAt })}
              />
            </WorkLabel>
          </div>
        )}

        {action === "status" && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {tasks.map((t) => (
              <WorkLabel key={t.id} label={t.subject}>
                <SearchSelect
                  value={statuses[t.id] ?? ""}
                  options={statusesFor(state, t.listId).map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  onChange={(v) => setStatuses({ ...statuses, [t.id]: v })}
                  placeholder="Select status"
                />
              </WorkLabel>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={
              (action === "priority" && !value) ||
              (action === "status" && ids.some((id) => !statuses[id]))
            }
          >
            Apply to Selected
          </Button>
        </div>
      </div>
    </WorkModal>
  );
}
