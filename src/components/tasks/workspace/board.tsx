"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  GitBranch,
  GripVertical,
  Layers,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/shared/search-select";
import { canEditTask, formatTaskDate, isClosed, isOverdue } from "@/lib/tasks/domain";
import {
  groupsFor,
  selectTasks,
  statusesFor,
  taskDraft,
  taskGroup,
  type TaskGroup,
} from "@/lib/tasks/workspace-model";
import type {
  WorkScope,
  WorkView,
  WorkspaceCommand,
  WorkspaceState,
  WorkspaceTask,
} from "@/lib/tasks/workspace-types";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { WorkLabel, WorkMenu, WorkModal, WorkPeople, WorkPriority, WorkStatusBadge } from "./common";
import { TaskMoveDialog } from "./task-panel";
import { cn } from "@/lib/utils";

interface BoardProps {
  state: WorkspaceState;
  scope: WorkScope;
  view: WorkView;
  tasks: WorkspaceTask[];
  selected: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onView: (view: WorkView) => void;
  onOpen: (id: string) => void;
  onCreate: (listId?: string, statusId?: string) => void;
}

export function WorkspaceBoard(props: BoardProps) {
  const { state, scope, view, tasks, selected, onSelect, onView, onOpen, onCreate } = props;
  const [dragging, setDragging] = useState<string | null>(null);
  const [move, setMove] = useState<{ ids: string[]; target: string; before?: string } | null>(null);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [moveLists, setMoveLists] = useState<string[]>([]);
  const [wipGroup, setWipGroup] = useState("");
  const [limit, setLimit] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const groups = groupsFor(state, scope, view.groupBy).sort((a, b) => {
    const ia = view.columnOrder.indexOf(a.id);
    const ib = view.columnOrder.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });

  const visible =
    view.subtasks === "separate"
      ? tasks
      : tasks.filter((t) => !t.parentId || !tasks.some((p) => p.id === t.parentId));

  const base = selectTasks(state, scope, { ...view, filters: [], showClosed: true });

  const lanes =
    view.swimlane === "none"
      ? [{ id: "all", name: "" }]
      : view.swimlane === "priority"
        ? ["Urgent", "High", "Medium", "Low"].map((name) => ({ id: name, name }))
        : state.lists
            .filter((l) => visible.some((t) => t.listId === l.id))
            .map((l) => ({ id: l.id, name: l.name }));

  const inLane = (t: WorkspaceTask, lane: string) =>
    lane === "all" ||
    (view.swimlane === "priority" ? t.priority === lane : t.listId === lane);

  const executeMove = (
    ids: string[],
    target: string,
    before?: string,
    explicit: Record<string, string> = {}
  ) => {
    if (!target) return;
    const moving = state.tasks.filter((t) => ids.includes(t.id));
    if (view.groupBy === "list") {
      setMoveLists(ids);
      return;
    }

    const commands: WorkspaceCommand[] = [];

    if (view.groupBy === "status") {
      const statusIds: Record<string, string> = {};
      let needsChoice = false;
      for (const task of moving) {
        const options = statusesFor(state, task.listId).filter(
          (s) => s.id === target || s.category === target
        );
        const choice =
          options.find((s) => s.id === explicit[task.id]) ??
          (options.length === 1 ? options[0] : undefined);
        if (!choice) needsChoice = true;
        else statusIds[task.id] = choice.id;
      }
      if (needsChoice) {
        setMove({ ids, target, before });
        return;
      }
      if (
        moving.some(
          (t) =>
            statusesFor(state, t.listId).find((s) => s.id === statusIds[t.id])?.category ===
            "Cancelled"
        ) &&
        !window.confirm(
          `Cancel ${ids.length} task(s)? Their dependencies will be treated as resolved.`
        )
      ) {
        return;
      }
      commands.push({ kind: "work-status", ids, statusIds });
    } else if (view.groupBy === "priority") {
      commands.push({
        kind: "work-bulk",
        ids,
        patch: { priority: target as WorkspaceTask["priority"] },
      });
    } else if (view.groupBy === "assignee") {
      if (target === "unassigned" && !window.confirm("Clear all assignees from the selected tasks?")) {
        return;
      }
      for (const task of moving) {
        commands.push({
          kind: "work-bulk",
          ids: [task.id],
          patch: {
            assigneeIds:
              target === "unassigned"
                ? []
                : [target, ...task.assigneeIds.filter((p) => p !== target)],
          },
        });
      }
    } else if (view.groupBy.startsWith("field:")) {
      const fieldId = view.groupBy.slice(6);
      for (const task of moving) {
        commands.push({
          kind: "work-task",
          id: task.id,
          draft: taskDraft(task),
          fields: { ...task.fields, [fieldId]: target === "unset" ? null : target },
        });
      }
    }

    if (runTaskCommand({ kind: "work-batch", commands }, `${ids.length} task(s) moved`)) {
      if (view.sort === "manual") {
        const ordered = visible.filter((t) => !ids.includes(t.id)).map((t) => t.id);
        const index = before ? ordered.indexOf(before) : -1;
        ordered.splice(index < 0 ? ordered.length : index, 0, ...ids);
        onView({
          ...view,
          ranks: { ...view.ranks, ...Object.fromEntries(ordered.map((id, i) => [id, i])) },
        });
      }
      setMove(null);
      setChoices({});
    }
  };

  const drop = (e: DragEndEvent) => {
    setDragging(null);
    if (!e.over || e.active.id === e.over.id) return;
    const from = e.active.data.current;
    const to = e.over.data.current;

    if (from?.type === "column") {
      const target = to?.groupId;
      if (target) {
        onView({
          ...view,
          columnOrder: arrayMove(
            groups.map((g) => g.id),
            groups.findIndex((g) => g.id === from.groupId),
            groups.findIndex((g) => g.id === target)
          ),
        });
      }
      return;
    }

    if (from?.lane !== to?.lane) {
      toast.info("Use Move to another List or edit priority to change swimlanes.");
      return;
    }

    if (view.sort !== "manual" && from?.groupId === to?.groupId) {
      toast.info("Choose Manual sort to reorder cards.");
      return;
    }

    const ids = selected.has(String(e.active.id)) ? [...selected] : [String(e.active.id)];
    executeMove(ids, to?.groupId, to?.type === "task" ? String(e.over.id) : undefined);
  };

  const dragged = state.tasks.find((t) => t.id === dragging);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setDragging(String(e.active.id))}
        onDragEnd={drop}
        onDragCancel={() => setDragging(null)}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) =>
              `Picked up ${state.tasks.find((t) => t.id === active.id)?.subject ?? "column"}`,
            onDragOver: ({ over }) =>
              over
                ? `Over ${groups.find((g) => g.id === over.data.current?.groupId)?.name ?? "task"}`
                : "Outside a drop target",
            onDragCancel: () => "Move cancelled. No changes made.",
            onDragEnd: ({ over }) =>
              over ? "Move requested. Workflow rules apply." : "Move cancelled.",
          },
        }}
      >
        <div className="h-full min-h-0 overflow-auto p-5 sm:p-6">
          {lanes.map((lane) => (
            <section key={lane.id} className="mb-8">
              {lane.name && (
                <div className="sticky left-0 mb-3 flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {lane.name}
                  </h3>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {visible.filter((t) => inLane(t, lane.id)).length}
                  </Badge>
                </div>
              )}

              <div className="flex min-w-max items-start gap-4">
                <SortableContext
                  items={groups.map((g) => `column:${lane.id}:${g.id}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {groups.map((group) => {
                    const groupTasks = visible.filter(
                      (t) => inLane(t, lane.id) && taskGroup(t, view.groupBy, groups) === group.id
                    );
                    const groupTotal = base.filter(
                      (t) =>
                        !isClosed(t) &&
                        inLane(t, lane.id) &&
                        taskGroup(t, view.groupBy, groups) === group.id &&
                        (view.subtasks === "separate" || !t.parentId)
                    ).length;

                    return (
                      <BoardColumn
                        key={group.id}
                        group={group}
                        lane={lane.id}
                        view={view}
                        count={groupTasks.length}
                        total={groupTotal}
                        onFold={() =>
                          onView({
                            ...view,
                            folded: view.folded.includes(group.id)
                              ? view.folded.filter((id) => id !== group.id)
                              : [...view.folded, group.id],
                          })
                        }
                        onWip={() => {
                          setWipGroup(group.id);
                          setLimit(view.wip[group.id] ?? 0);
                        }}
                        onCreate={() =>
                          onCreate(
                            scope.kind === "list" ? scope.id : undefined,
                            view.groupBy === "status" &&
                              !["Open", "Working", "Pending Review", "Completed", "Cancelled"].includes(
                                group.id
                              )
                              ? group.id
                              : undefined
                          )
                        }
                      >
                        <SortableContext
                          items={groupTasks.map((t) => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {groupTasks.map((task, index, items) => (
                            <SortableCard
                              key={task.id}
                              task={task}
                              state={state}
                              view={view}
                              groupId={group.id}
                              lane={lane.id}
                              selected={selected.has(task.id)}
                              onSelect={() => {
                                const next = new Set(selected);
                                if (next.has(task.id)) next.delete(task.id);
                                else next.add(task.id);
                                onSelect(next);
                              }}
                              onOpen={() => onOpen(task.id)}
                              onMove={() =>
                                setMove({
                                  ids: selected.has(task.id) ? [...selected] : [task.id],
                                  target: "",
                                })
                              }
                              onUp={
                                index > 0 && view.sort === "manual"
                                  ? () => executeMove([task.id], group.id, items[index - 1].id)
                                  : undefined
                              }
                            />
                          ))}
                        </SortableContext>
                      </BoardColumn>
                    );
                  })}
                </SortableContext>
              </div>
            </section>
          ))}
        </div>

        {/* Dragging Overlay Preview */}
        <DragOverlay>
          {dragged ? (
            <Card className="w-72 rotate-2 border-primary/40 shadow-xl py-0">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">{dragged.code}</span>
                  <WorkPriority value={dragged.priority} />
                </div>
                <p className="text-xs font-semibold leading-snug">{dragged.subject}</p>
                {selected.has(dragged.id) && selected.size > 1 && (
                  <Badge variant="default" className="text-[10px]">
                    +{selected.size - 1} more selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Move Task Dialog */}
      {move && (
        <WorkModal
          title={`Move ${move.ids.length} task(s)`}
          description="Choose a destination column. Review and workflow rules apply automatically."
          onClose={() => {
            setMove(null);
            setChoices({});
          }}
        >
          <div className="space-y-4">
            <SearchSelect
              value={move.target}
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              onChange={(target) => {
                setMove({ ...move, target });
                setChoices({});
              }}
              placeholder="Destination column"
            />
            {view.groupBy === "status" &&
              move.target &&
              move.ids.map((id) => {
                const t = state.tasks.find((task) => task.id === id)!;
                const options = statusesFor(state, t.listId).filter(
                  (s) => s.id === move.target || s.category === move.target
                );
                return options.length !== 1 ? (
                  <WorkLabel label={t.subject} key={id}>
                    <SearchSelect
                      value={choices[id] ?? ""}
                      options={options.map((s) => ({ value: s.id, label: s.name }))}
                      onChange={(value) => setChoices({ ...choices, [id]: value })}
                      placeholder="Choose a status for this list"
                    />
                  </WorkLabel>
                ) : null;
              })}
            <Button
              className="w-full"
              disabled={!move.target}
              onClick={() => executeMove(move.ids, move.target, move.before, choices)}
            >
              Move tasks
            </Button>
          </div>
        </WorkModal>
      )}

      {!!moveLists.length && (
        <TaskMoveDialog state={state} ids={moveLists} onClose={() => setMoveLists([])} />
      )}

      {wipGroup && (
        <WorkModal
          title="Column WIP Limit"
          description="Set a maximum active card limit for this column. Enter 0 for unlimited."
          onClose={() => setWipGroup("")}
        >
          <div className="space-y-4">
            <Input
              type="number"
              min={0}
              aria-label="WIP limit"
              value={limit}
              onChange={(e) => setLimit(Math.max(0, Number(e.target.value)))}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWipGroup("")}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onView({ ...view, wip: { ...view.wip, [wipGroup]: limit } });
                  setWipGroup("");
                }}
              >
                Apply Limit
              </Button>
            </div>
          </div>
        </WorkModal>
      )}
    </>
  );
}

function BoardColumn({
  group,
  lane,
  view,
  count,
  total,
  children,
  onFold,
  onWip,
  onCreate,
}: {
  group: TaskGroup;
  lane: string;
  view: WorkView;
  count: number;
  total: number;
  children: React.ReactNode;
  onFold: () => void;
  onWip: () => void;
  onCreate: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isOver } = useSortable({
    id: `column:${lane}:${group.id}`,
    data: { type: "column", groupId: group.id, lane },
  });

  const folded = view.folded.includes(group.id);
  const overLimit = !!view.wip[group.id] && total > view.wip[group.id];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "shrink-0 rounded-2xl bg-muted/40 border transition-all",
        folded ? "w-14" : "w-[300px]",
        isOver && "ring-2 ring-primary/40 border-primary/50",
        overLimit && "border-rose-500/40 bg-rose-500/5"
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center gap-1.5 p-3 rounded-t-2xl bg-muted/70 backdrop-blur-xs border-b",
          folded && "flex-col py-4"
        )}
      >
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`${folded ? "Expand" : "Collapse"} ${group.name}`}
          onClick={onFold}
          className="size-6 text-muted-foreground hover:text-foreground"
        >
          {folded ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>

        {!folded ? (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: group.color || "var(--primary)" }}
              />
              <span className="truncate text-xs font-bold uppercase tracking-wider text-foreground">
                {group.name}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0",
                  overLimit && "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold"
                )}
              >
                {count}
                {view.wip[group.id] ? `/${view.wip[group.id]}` : ""}
              </Badge>
            </div>

            <Button
              {...attributes}
              {...listeners}
              size="icon-sm"
              variant="ghost"
              className="size-6 cursor-grab touch-none text-muted-foreground hover:text-foreground"
              aria-label={`Reorder ${group.name} column`}
            >
              <GripVertical className="size-3.5" />
            </Button>

            <WorkMenu
              label={`${group.name} options`}
              actions={[
                { label: "Set WIP limit", icon: <Sliders className="size-3.5" />, onClick: onWip },
                { label: "Collapse column", icon: <ChevronRight className="size-3.5" />, onClick: onFold },
                { label: "Add task here", icon: <Plus className="size-3.5" />, onClick: onCreate },
              ]}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: group.color || "var(--primary)" }}
            />
            <span className="text-xs font-bold tracking-wider [writing-mode:vertical-rl] text-foreground">
              {group.name}
            </span>
            <Badge variant="secondary" className="font-mono text-[10px] px-1 py-0.5">
              {count}
            </Badge>
          </div>
        )}
      </div>

      {/* Column Content */}
      {!folded && (
        <div className="p-2.5 space-y-2.5">
          {overLimit && (
            <div className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              WIP limit exceeded ({total} active cards)
            </div>
          )}

          <div className="min-h-16 space-y-2.5">
            {children}
            {!count && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-xs text-muted-foreground/70">
                <span>Drop tasks here</span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl"
            onClick={onCreate}
          >
            <Plus className="size-3.5" />
            <span>Add task</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function SortableCard({
  task,
  state,
  view,
  groupId,
  lane,
  selected,
  onSelect,
  onOpen,
  onMove,
  onUp,
}: {
  task: WorkspaceTask;
  state: WorkspaceState;
  view: WorkView;
  groupId: string;
  lane: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onMove: () => void;
  onUp?: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", groupId, lane },
    disabled: !canEditTask(state, task) || task.archived,
  });

  const comments = state.comments.filter((c) => c.taskId === task.id && !c.deleted).length;
  const children = state.tasks.filter((t) => t.parentId === task.id);
  const timezone =
    state.workspaces.find(
      (w) => w.id === state.lists.find((l) => l.id === task.listId)?.workspaceId
    )?.timezone ?? state.timezone;
  const overdue = isOverdue(task, new Date());
  const blocked = task.dependencyIds.some((id) =>
    state.tasks.some((t) => t.id === id && !isClosed(t))
  );

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative rounded-xl border bg-card/90 transition-all duration-150 hover:border-primary/40 hover:shadow-xs",
        isDragging && "opacity-30",
        selected && "border-primary bg-primary/5 ring-1 ring-primary"
      )}
    >
      <CardContent
        className={cn(
          "space-y-2.5 p-3.5",
          view.density === "compact" && "space-y-1.5 p-2.5"
        )}
      >
        {/* Card Header: Code, Priority, Grip, Menu */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Checkbox
              checked={selected}
              aria-label={`Select ${task.subject}`}
              onCheckedChange={onSelect}
              className={cn(
                "size-3.5 transition-opacity",
                !selected && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              )}
            />
            <span className="font-mono text-[10px] font-medium text-muted-foreground">
              {task.code}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <WorkPriority value={task.priority} />

            <div
              className={cn(
                "flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                selected && "opacity-100"
              )}
            >
              <Button
                {...attributes}
                {...listeners}
                variant="ghost"
                size="icon-sm"
                className="size-5 cursor-grab touch-none p-0 text-muted-foreground hover:text-foreground"
                aria-label={`Drag ${task.subject}`}
              >
                <GripVertical className="size-3" />
              </Button>

              <WorkMenu
                label={`Actions for ${task.subject}`}
                actions={[
                  { label: "Open details", onClick: onOpen },
                  { label: "Move to column…", onClick: onMove },
                  { label: "Move up", disabled: !onUp, onClick: () => onUp?.() },
                  {
                    label: "Duplicate task",
                    onClick: () =>
                      runTaskCommand(
                        { kind: "work-duplicate", id: task.id },
                        "Task duplicated"
                      ),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Task Title */}
        <Button
          variant="link"
          onClick={onOpen}
          className="h-auto w-full justify-start p-0 text-left text-xs font-semibold leading-snug text-foreground hover:text-primary hover:no-underline whitespace-normal"
        >
          <span className="line-clamp-2">{task.subject}</span>
        </Button>

        {/* Tags & Blocked Badge */}
        {(task.tags.length > 0 || blocked) && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, view.density === "compact" ? 1 : 2).map((tag, i) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  "border-0 px-1.5 py-0 text-[9px] font-medium",
                  i === 0
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                )}
              >
                {tag}
              </Badge>
            ))}
            {blocked && (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[9px] text-amber-700 dark:text-amber-400"
              >
                <GitBranch className="size-2.5" />
                Blocked
              </Badge>
            )}
          </div>
        )}

        {/* Status Badge when not grouped by status */}
        {view.groupBy !== "status" && <WorkStatusBadge state={state} task={task} />}

        {/* Custom fields preview */}
        {view.fields
          .filter((f) => f.startsWith("field:"))
          .map((id) => {
            const f = state.fields.find((field) => field.id === id.slice(6));
            const value = task.fields[id.slice(6)];
            if (!f || value == null) return null;
            return (
              <p key={id} className="text-[10px] text-muted-foreground">
                <span className="font-medium">{f.name}:</span>{" "}
                {f.options.find((o) => o.id === value)?.label ?? String(value)}
              </p>
            );
          })}

        {/* Card Footer: People & Indicators */}
        <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <WorkPeople state={state} ids={task.assigneeIds} />

          <div className="flex items-center gap-2.5 font-medium">
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {comments}
              </span>
            )}

            {children.length > 0 && (
              <span className="flex items-center gap-1">
                <GitBranch className="size-3" />
                {children.filter(isClosed).length}/{children.length}
              </span>
            )}

            {task.checklist.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCheck className="size-3" />
                {task.checklist.filter((i) => i.done).length}/{task.checklist.length}
              </span>
            )}

            {task.dueAt && (
              <span
                className={cn(
                  "flex items-center gap-1 font-semibold",
                  overdue ? "text-rose-500 dark:text-rose-400" : "text-muted-foreground"
                )}
              >
                <CalendarDays className="size-3" />
                {formatTaskDate(task.dueAt, timezone)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
