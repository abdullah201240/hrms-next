"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Diamond,
  GitBranch,
  GripVertical,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchSelect } from "@/components/shared/search-select";
import { canEditTask, dayKey, fromLocalInput, isClosed, toLocalInput } from "@/lib/tasks/domain";
import { taskDraft, taskStatus, workProgress } from "@/lib/tasks/workspace-model";
import type { WorkScope, WorkView, WorkspaceState, WorkspaceTask } from "@/lib/tasks/workspace-types";
import { runTaskCommand } from "@/hooks/use-task-workspace";
import { WorkLabel, WorkModal } from "./common";
import { TaskDateInput } from "../task-shared";
import { cn } from "@/lib/utils";

const dayNumber = (key: string) => Date.parse(`${key}T00:00:00Z`) / 86400000;
const shiftDay = (key: string, days: number) =>
  new Date((dayNumber(key) + days) * 86400000).toISOString().slice(0, 10);

function shiftTime(value: string | null, days: number, timezone: string) {
  if (!value) return null;
  const local = toLocalInput(value, timezone);
  return fromLocalInput(`${shiftDay(local.slice(0, 10), days)}T${local.slice(11)}`, timezone);
}

export function WorkspaceSchedule({
  state,
  scope,
  view,
  tasks,
  onOpen,
  onCreate,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  view: WorkView;
  tasks: WorkspaceTask[];
  onOpen: (id: string) => void;
  onCreate: (listId?: string, statusId?: string, dueAt?: string) => void;
}) {
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;
  const today = dayKey(new Date(), timezone);
  const [cursor, setCursor] = useState(today);
  const [scale, setScale] = useState("month");
  const [editing, setEditing] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const monthStart = `${cursor.slice(0, 7)}-01`;
  const weekday = (key: string) => (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start =
    scale === "week"
      ? shiftDay(cursor, -weekday(cursor))
      : view.type === "calendar"
        ? shiftDay(monthStart, -weekday(monthStart))
        : monthStart;

  const count =
    scale === "week"
      ? 7
      : view.type === "calendar"
        ? 42
        : new Date(
            Date.UTC(Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7)), 0)
          ).getUTCDate();

  const days = Array.from({ length: count }, (_, i) => shiftDay(start, i));

  const navigate = (delta: number) => {
    if (scale === "week") {
      setCursor(shiftDay(cursor, 7 * delta));
    } else {
      const d = new Date(`${monthStart}T00:00:00Z`);
      d.setUTCMonth(d.getUTCMonth() + delta);
      setCursor(d.toISOString().slice(0, 10));
    }
  };

  const inDay = (task: WorkspaceTask, day: string) => {
    const first = task.startAt ?? task.dueAt;
    const last = task.dueAt ?? task.startAt;
    return (
      !!first &&
      !!last &&
      day >= dayKey(first, timezone) &&
      day <= dayKey(last, timezone)
    );
  };

  const drop = (e: DragEndEvent) => {
    setDragging(null);
    if (!e.over) return;
    const id = e.active.data.current?.taskId as string;
    const day = e.over.data.current?.day as string;
    const task = tasks.find((t) => t.id === id);
    if (!task || !day) return;

    try {
      const anchor = e.active.data.current?.day as string | undefined;
      const delta = anchor ? dayNumber(day) - dayNumber(anchor) : 0;
      const patch =
        !task.startAt && !task.dueAt
          ? { dueAt: fromLocalInput(`${day}T17:00`, timezone) }
          : {
              startAt: shiftTime(task.startAt, delta, timezone),
              dueAt: shiftTime(task.dueAt, delta, timezone),
            };

      if (!runTaskCommand({ kind: "work-task", id, draft: { ...taskDraft(task), ...patch } }, "Task rescheduled")) {
        setEditing(id);
      }
    } catch (error) {
      toast.error((error as Error).message);
      setEditing(id);
    }
  };

  const edited = tasks.find((t) => t.id === editing);
  const unscheduled = tasks.filter((t) => !t.startAt && !t.dueAt);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Date Navigation Bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-card px-5 py-3 sm:px-6">
        <Button variant="outline" size="sm" onClick={() => setCursor(today)} className="h-8 text-xs font-semibold">
          Today
        </Button>

        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/20 p-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous period"
            onClick={() => navigate(-1)}
            className="size-7"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next period"
            onClick={() => navigate(1)}
            className="size-7"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
          {new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${cursor}T12:00:00Z`))}
        </h2>

        <div className="ml-auto flex items-center gap-3">
          <div className="w-28">
            <SearchSelect
              value={scale}
              options={[
                { value: "month", label: "Month" },
                { value: "week", label: "Week" },
              ]}
              onChange={(v) => v && setScale(v)}
            />
          </div>
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            {timezone}
          </span>
        </div>
      </div>

      {view.type === "calendar" ? (
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setDragging(String(e.active.data.current?.taskId))}
          onDragCancel={() => setDragging(null)}
          onDragEnd={drop}
        >
          {/* Calendar Grid View */}
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="grid min-w-[770px] grid-cols-7 border-l">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="sticky top-0 z-10 border-b bg-card py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-2xs"
                >
                  {d}
                </div>
              ))}

              {days.map((day) => (
                <CalendarDay
                  key={day}
                  day={day}
                  today={today}
                  muted={day.slice(0, 7) !== cursor.slice(0, 7)}
                  onCreate={() => {
                    try {
                      onCreate(
                        scope.kind === "list" ? scope.id : undefined,
                        undefined,
                        fromLocalInput(`${day}T17:00`, timezone)!
                      );
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  {tasks
                    .filter((t) => inDay(t, day))
                    .map((task) => (
                      <CalendarTask
                        key={task.id}
                        task={task}
                        state={state}
                        day={day}
                        onOpen={() => onOpen(task.id)}
                        onSchedule={() => setEditing(task.id)}
                      />
                    ))}
                </CalendarDay>
              ))}
            </div>
          </div>

          {/* Unscheduled Tray */}
          <div className="max-h-44 shrink-0 overflow-auto border-t bg-muted/20 px-5 py-3">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Unscheduled
              </h3>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {unscheduled.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {unscheduled.map((task) => (
                <div key={task.id} className="w-60">
                  <CalendarTask
                    task={task}
                    state={state}
                    onOpen={() => onOpen(task.id)}
                    onSchedule={() => setEditing(task.id)}
                  />
                </div>
              ))}
              {!unscheduled.length && (
                <span className="text-xs text-muted-foreground">All tasks have scheduled dates.</span>
              )}
            </div>
          </div>

          <DragOverlay>
            {dragging && (
              <Badge className="max-w-64 truncate shadow-lg">
                {tasks.find((t) => t.id === dragging)?.subject}
              </Badge>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        /* Timeline / Gantt View */
        <div className="min-h-0 flex-1 overflow-auto">
          <div
            className="relative"
            style={{ minWidth: 280 + days.length * (scale === "week" ? 120 : 42) }}
          >
            {/* Timeline Header Days */}
            <div className="sticky top-0 z-20 flex h-11 border-b bg-card shadow-2xs">
              <div className="sticky left-0 z-30 w-72 shrink-0 border-r bg-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                List / Task
              </div>
              {days.map((d) => (
                <div
                  key={d}
                  className={cn(
                    "flex-1 border-r py-3 text-center font-mono text-[11px] font-medium text-muted-foreground",
                    d === today && "bg-primary/10 font-bold text-primary"
                  )}
                >
                  {Number(d.slice(8))}
                </div>
              ))}
            </div>

            {/* Timeline Rows grouped by List */}
            {state.lists
              .filter((l) => tasks.some((t) => t.listId === l.id))
              .map((list) => (
                <section key={list.id} className="border-b">
                  <div className="sticky left-0 flex h-9 items-center gap-2 border-b bg-muted/40 px-4 text-xs font-bold uppercase tracking-wider text-foreground">
                    <span>{list.name}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {workProgress(tasks.filter((t) => t.listId === list.id)).percent}%
                    </Badge>
                  </div>

                  {tasks
                    .filter((t) => t.listId === list.id)
                    .map((task) => {
                      const activeDays = days.filter((d) => inDay(task, d));
                      const left = activeDays.length ? days.indexOf(activeDays[0]) : -1;
                      const color = taskStatus(state, task)?.color || "var(--primary)";
                      const progress = tasks.some((t) => t.parentId === task.id)
                        ? workProgress(tasks.filter((t) => t.parentId === task.id)).percent
                        : task.progress;

                      return (
                        <div className="flex h-11 border-b border-border/40 hover:bg-muted/20" key={task.id}>
                          <div className="sticky left-0 z-10 flex w-72 shrink-0 items-center justify-between border-r bg-card px-4">
                            <Button
                              variant="link"
                              className="min-w-0 flex-1 justify-start truncate p-0 text-xs font-medium text-foreground hover:text-primary hover:no-underline text-left"
                              onClick={() => onOpen(task.id)}
                            >
                              <span className="truncate">{task.subject}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Reschedule ${task.subject}`}
                              onClick={() => setEditing(task.id)}
                              className="size-6 text-muted-foreground hover:text-foreground"
                            >
                              <CalendarDays className="size-3" />
                            </Button>
                          </div>

                          <div className="relative flex flex-1">
                            {days.map((d) => (
                              <div
                                key={d}
                                className={cn(
                                  "flex-1 border-r border-border/40",
                                  d === today && "bg-primary/5 border-r-primary/40"
                                )}
                              />
                            ))}

                            {left >= 0 && (
                              <Button
                                variant="secondary"
                                className="absolute top-1.5 h-8 justify-start gap-1.5 overflow-hidden rounded-lg px-2.5 text-xs font-semibold shadow-xs"
                                style={{
                                  left: `${(left / count) * 100}%`,
                                  width: `${Math.max(4, (activeDays.length / count) * 100)}%`,
                                  backgroundColor: `${color}25`,
                                  color,
                                  borderColor: `${color}40`,
                                }}
                                onClick={() => onOpen(task.id)}
                              >
                                {!task.startAt && <Diamond className="size-3 shrink-0" />}
                                {task.dependencyIds.length > 0 && <GitBranch className="size-3 shrink-0" />}
                                <span className="truncate">
                                  {task.subject} · {progress}%
                                </span>
                              </Button>
                            )}

                            {!task.startAt && !task.dueAt && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute left-3 top-1.5 h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setEditing(task.id)}
                              >
                                + Set dates
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </section>
              ))}
          </div>
        </div>
      )}

      {edited && (
        <ScheduleDialog
          key={edited.id}
          state={state}
          task={edited}
          timezone={timezone}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CalendarDay({
  day,
  today,
  muted,
  children,
  onCreate,
}: {
  day: string;
  today: string;
  muted: boolean;
  children: React.ReactNode;
  onCreate: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: day, data: { day } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group min-h-36 space-y-1.5 border-b border-r p-2 transition-colors",
        muted ? "bg-muted/20 text-muted-foreground/60" : "bg-card",
        isOver && "bg-primary/10 ring-2 ring-primary/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full font-mono text-xs font-medium",
            day === today && "bg-primary font-bold text-primary-foreground"
          )}
        >
          {Number(day.slice(8))}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
          aria-label={`Create task on ${day}`}
          onClick={onCreate}
        >
          <Plus className="size-3" />
        </Button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CalendarTask({
  task,
  state,
  day,
  onOpen,
  onSchedule,
}: {
  task: WorkspaceTask;
  state: WorkspaceState;
  day?: string;
  onOpen: () => void;
  onSchedule: () => void;
}) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `${task.id}:${day ?? "unscheduled"}`,
    data: { taskId: task.id, day },
    disabled: !canEditTask(state, task) || isClosed(task),
  });

  const color = taskStatus(state, task)?.color || "var(--primary)";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/task flex items-center gap-1 rounded-lg border-l-3 px-2 py-1 shadow-2xs transition-all",
        isDragging && "opacity-30"
      )}
      style={{ borderColor: color, backgroundColor: `${color}15` }}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-4 shrink-0 cursor-grab touch-none p-0 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${task.subject}`}
      >
        <GripVertical className="size-2.5" />
      </Button>

      <Button
        variant="link"
        className="h-auto min-w-0 flex-1 justify-start truncate p-0 text-left text-xs font-medium text-foreground hover:text-primary hover:no-underline"
        onClick={onOpen}
      >
        <span className="truncate">{task.subject}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label={`Reschedule ${task.subject}`}
        onClick={onSchedule}
      >
        <CalendarDays className="size-3" />
      </Button>
    </div>
  );
}

function ScheduleDialog({
  state,
  task,
  timezone,
  onClose,
}: {
  state: WorkspaceState;
  task: WorkspaceTask;
  timezone: string;
  onClose: () => void;
}) {
  const [start, setStart] = useState(task.startAt);
  const [due, setDue] = useState(task.dueAt);

  return (
    <WorkModal
      title="Schedule Task"
      description={`Set start and due targets in ${timezone}.`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">{task.subject}</p>

        <WorkLabel label="Start Date">
          <TaskDateInput
            id="schedule-start"
            value={start}
            timezone={timezone}
            onChange={setStart}
          />
        </WorkLabel>

        <WorkLabel label="Due Date">
          <TaskDateInput
            id="schedule-due"
            value={due}
            timezone={timezone}
            onChange={setDue}
          />
        </WorkLabel>

        {isClosed(task) && (
          <p className="text-xs text-rose-500">
            Reopen this task before changing its schedule.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!canEditTask(state, task) || isClosed(task)}
            onClick={() => {
              if (
                runTaskCommand(
                  {
                    kind: "work-task",
                    id: task.id,
                    draft: { ...taskDraft(task), startAt: start, dueAt: due },
                  },
                  "Schedule updated"
                )
              ) {
                onClose();
              }
            }}
          >
            Save Schedule
          </Button>
        </div>
      </div>
    </WorkModal>
  );
}
