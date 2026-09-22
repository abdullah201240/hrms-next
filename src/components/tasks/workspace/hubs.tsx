"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Clock,
  ExternalLink,
  Flame,
  FolderKanban,
  Hash,
  Inbox,
  Layers,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand, useTaskClock } from "@/hooks/use-task-workspace";
import { dayKey, formatTaskDate, isClosed, isOverdue, personName } from "@/lib/tasks/domain";
import {
  nodeById,
  nodeHref,
  preferencesFor,
  scopeLists,
  selectTasks,
  workProgress,
} from "@/lib/tasks/workspace-model";
import {
  CATEGORY_LABELS,
  STATUS_CATEGORIES,
  type WorkScope,
  type WorkspaceState,
  type WorkspaceTask,
} from "@/lib/tasks/workspace-types";
import { WorkEmpty, WorkMenu, WorkPeople, WorkPriority, WorkStatusBadge } from "./common";
import { cn } from "@/lib/utils";

interface HubProps {
  state: WorkspaceState;
  scope: WorkScope;
  onOpen: (id: string) => void;
}

export function HubHeading({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {badge && (
            <Badge variant="secondary" className="font-semibold">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export function TaskSummaryRows({
  state,
  tasks,
  onOpen,
  empty = "You're all caught up.",
}: {
  state: WorkspaceState;
  tasks: WorkspaceTask[];
  onOpen: (id: string) => void;
  empty?: string;
}) {
  const timezone = state.timezone;
  const now = new Date();

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <CheckCheck className="size-5" />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {tasks.map((t) => {
        const overdue = isOverdue(t, now);
        const taskTz =
          state.workspaces.find(
            (w) => w.id === state.lists.find((l) => l.id === t.listId)?.workspaceId
          )?.timezone ?? timezone;

        return (
          <div
            key={t.id}
            className="group flex items-center gap-3 py-3 transition-colors hover:bg-muted/40 sm:px-2"
          >
            <div className="shrink-0">
              <WorkPriority value={t.priority} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  className="h-auto min-w-0 p-0 text-left text-xs font-medium text-foreground hover:text-primary hover:no-underline"
                  onClick={() => onOpen(t.id)}
                >
                  <span className="line-clamp-1">{t.subject}</span>
                </Button>
                <span className="shrink-0 text-[10px] text-muted-foreground">{t.code}</span>
              </div>
            </div>

            <div className="hidden shrink-0 sm:block">
              <WorkStatusBadge state={state} task={t} />
            </div>

            <div className="shrink-0">
              <WorkPeople state={state} ids={t.assigneeIds} />
            </div>

            {t.dueAt && (
              <span
                className={cn(
                  "hidden w-24 shrink-0 text-right text-[11px] font-medium md:block",
                  overdue ? "text-rose-500 dark:text-rose-400" : "text-muted-foreground"
                )}
              >
                {formatTaskDate(t.dueAt, taskTz)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WorkspaceHome({ state, scope, onOpen }: HubProps) {
  const now = useTaskClock();
  const tasks = selectTasks(state, scope);
  const pref = preferencesFor(state, scope.workspaceId);

  const mine = tasks.filter((t) => t.assigneeIds.includes(state.actorId) && !isClosed(t));
  const due = tasks
    .filter((t) => t.dueAt && !isClosed(t))
    .sort((a, b) => a.dueAt!.localeCompare(b.dueAt!));
  const overdue = tasks.filter((t) => isOverdue(t, now));
  const lists = scopeLists(state, scope);
  const recent = pref.recent
    .map((id) => lists.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l);
  const activity = state.activities
    .filter((a) => tasks.some((t) => t.id === a.taskId))
    .slice(-8)
    .reverse();

  const currentPerson = state.people.find((p) => p.id === state.actorId);
  const firstName = currentPerson?.name.split(" ")[0] ?? "Team Member";

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      label: "Assigned to you",
      value: mine.length,
      icon: CircleCheck,
      path: "my-work",
      accent: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/15",
      subtext: mine.length === 1 ? "1 active task" : `${mine.length} active tasks`,
    },
    {
      label: "Overdue tasks",
      value: overdue.length,
      icon: CircleAlert,
      path: "everything",
      accent:
        overdue.length > 0
          ? "text-rose-500 bg-rose-500/10 dark:bg-rose-500/15"
          : "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15",
      subtext: overdue.length > 0 ? "Requires urgent attention" : "All dates on schedule",
    },
    {
      label: "Active lists",
      value: lists.length,
      icon: Layers,
      path: "everything",
      accent: "text-violet-500 bg-violet-500/10 dark:bg-violet-500/15",
      subtext: "Across active spaces",
    },
  ];

  return (
    <div className="h-full space-y-8 overflow-y-auto p-5 lg:p-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Personal Command Center</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="max-w-xl text-xs text-muted-foreground sm:text-sm">
              Track your daily commitments, follow team velocity, and align priorities across all
              connected lists.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button nativeButton={false} render={<Link href={`/workspaces/${scope.workspaceId}/my-work`} />} size="sm" className="gap-2">
              <ListTodo className="size-4" />
              <span>Go to My Work</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((c) => (
          <Link
            key={c.label}
            href={`/workspaces/${scope.workspaceId}/${c.path}`}
            className="group block"
          >
            <Card className="transition-all duration-200 hover:border-primary/40 hover:bg-muted/30">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex size-12 items-center justify-center rounded-xl", c.accent)}>
                  <c.icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {c.value}
                    </p>
                  </div>
                  <p className="truncate text-xs font-medium text-foreground group-hover:text-primary">
                    {c.label}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.subtext}</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recently Visited / Active Lists Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {recent.length ? "Recently visited" : "Your workspace lists"}
            </h2>
            <p className="text-xs text-muted-foreground">Quick access to project spaces and lists</p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={`/workspaces/${scope.workspaceId}/everything`} />}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all lists
            <ArrowUpRight className="ml-1 size-3" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(recent.length ? recent : lists).slice(0, 6).map((list) => {
            const listTasks = tasks.filter((t) => t.listId === list.id);
            const progress = workProgress(listTasks);
            const space = state.spaces.find((s) => s.id === list.spaceId);

            return (
              <Link key={list.id} href={nodeHref(list)} className="group block">
                <Card className="h-full transition-all duration-200 hover:border-primary/40 hover:bg-muted/20">
                  <CardContent className="space-y-3.5 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex size-7 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${list.color || "#6366f1"}18`,
                            color: list.color || "#6366f1",
                          }}
                        >
                          <Hash className="size-4" />
                        </div>
                        <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                          {list.name}
                        </span>
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <p className="truncate text-xs text-muted-foreground">
                      {space?.name ?? "General Space"}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">{progress.percent}%</span>
                      </div>
                      <Progress value={progress.percent} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>
                        {progress.done} of {progress.total} done
                      </span>
                      {list.health && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {list.health}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Focus & Deadlines Two-Column Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-sm font-semibold">Your focus</CardTitle>
              <CardDescription className="text-xs">
                In-progress tasks assigned directly to you
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {mine.length}
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <TaskSummaryRows
              state={state}
              tasks={mine.slice(0, 8)}
              onOpen={onOpen}
              empty="No pending tasks assigned to you right now."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-sm font-semibold">Deadlines & overdue work</CardTitle>
              <CardDescription className="text-xs">
                Upcoming targets requiring your attention
              </CardDescription>
            </div>
            <Badge
              variant={overdue.length > 0 ? "destructive" : "secondary"}
              className="font-mono text-xs"
            >
              {due.length}
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <TaskSummaryRows
              state={state}
              tasks={due.slice(0, 8)}
              onOpen={onOpen}
              empty="No impending deadlines."
            />
          </CardContent>
        </Card>
      </div>

      {/* Favorites & Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-semibold">Starred favorites</CardTitle>
            <CardDescription className="text-xs">Quick access to pinned items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-4">
            {pref.favorites.map((id) => {
              const list = lists.find((l) => l.id === id);
              const task = tasks.find((t) => t.id === id);

              if (task) {
                return (
                  <Button
                    key={id}
                    variant="ghost"
                    className="w-full justify-start gap-2.5 text-xs font-normal"
                    onClick={() => onOpen(id)}
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="truncate">{task.subject}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                      {task.code}
                    </span>
                  </Button>
                );
              }

              if (list) {
                return (
                  <Button
                    key={id}
                    variant="ghost"
                    className="w-full justify-start gap-2.5 text-xs font-normal"
                    nativeButton={false}
                    render={<Link href={nodeHref(list)} />}
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="truncate">{list.name}</span>
                    <Badge variant="outline" className="ml-auto text-[9px]">
                      List
                    </Badge>
                  </Button>
                );
              }

              return null;
            })}

            {!pref.favorites.length && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <Star className="mx-auto mb-2 size-6 text-muted-foreground/40" />
                <p>No favorites starred yet.</p>
                <p className="mt-1 text-[11px]">
                  Star lists or tasks from their action menu to pin them here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
            <CardDescription className="text-xs">Latest team actions in this space</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {activity.map((a) => {
              const task = tasks.find((t) => t.id === a.taskId);
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg p-2 text-xs transition-colors hover:bg-muted/40"
                >
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-left text-xs font-medium text-foreground hover:text-primary hover:no-underline"
                      onClick={() => onOpen(a.taskId)}
                    >
                      {a.message}
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      {personName(state, a.actorId)} ·{" "}
                      <span className="font-mono">{task?.code}</span>
                    </p>
                  </div>
                </div>
              );
            })}

            {!activity.length && (
              <p className="py-6 text-center text-xs text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LocationOverview({ state, scope, onOpen }: HubProps) {
  const node = nodeById(state, scope.id);
  const tasks = selectTasks(state, scope);
  const progress = workProgress(tasks);
  const lists = scopeLists(state, scope);
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Location overview</CardTitle>
              {node?.health && (
                <Badge
                  variant={
                    node.health === "On track"
                      ? "secondary"
                      : node.health === "At risk"
                        ? "destructive"
                        : "outline"
                  }
                  className="font-medium"
                >
                  {node.health}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Key outcomes, timeframe, and team alignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Brief / Description
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {node?.description ||
                  "No brief provided yet. You can add one in location settings to align the team around a shared outcome."}
              </p>
            </div>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Timeframe</p>
                <p className="mt-1 text-xs font-semibold text-foreground">
                  {formatTaskDate(node?.startAt ?? null, timezone) || "Flexible"} —{" "}
                  {formatTaskDate(node?.dueAt ?? null, timezone) || "Ongoing"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Lead / Manager</p>
                <p className="mt-1 text-xs font-semibold text-foreground">
                  {personName(state, node?.managerId ?? state.actorId)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground">Team members</p>
              <WorkPeople state={state} ids={node?.memberIds ?? []} size="lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-semibold">Overall progress</CardTitle>
            <CardDescription className="text-xs">Completion rate across tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6 pt-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-baseline gap-1 text-5xl font-extrabold tracking-tight text-foreground">
                <span>{progress.percent}</span>
                <span className="text-2xl font-semibold text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {progress.done} of {progress.total} outcomes completed
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress.percent} className="h-2.5" />
              <p className="text-center text-[11px] text-muted-foreground">
                Archived and cancelled tasks are excluded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {scope.kind !== "list" && lists.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Contained lists ({lists.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lists.map((list) => {
              const listTasks = tasks.filter((t) => t.listId === list.id);
              const p = workProgress(listTasks);
              return (
                <Card
                  key={list.id}
                  className="transition-all duration-200 hover:border-primary/40 hover:bg-muted/20"
                >
                  <CardContent className="space-y-3 p-4">
                    <Link
                      href={nodeHref(list)}
                      className="group flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="size-4" style={{ color: list.color || "currentColor" }} />
                        <span className="truncate">{list.name}</span>
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <Progress value={p.percent} className="h-1.5" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{p.percent}% done</span>
                      {list.health && (
                        <Badge variant="outline" className="text-[9px]">
                          {list.health}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-sm font-semibold">Upcoming work</CardTitle>
          <CardDescription className="text-xs">Next items on the agenda</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <TaskSummaryRows
            state={state}
            tasks={tasks
              .filter((t) => !isClosed(t))
              .sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"))
              .slice(0, 10)}
            onOpen={onOpen}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function WorkspaceMyWork({ state, scope, onOpen }: HubProps) {
  const [tab, setTab] = useState("assigned");
  const now = useTaskClock();
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;

  const tasks = selectTasks(state, scope).filter(
    (t) =>
      !isClosed(t) &&
      (tab === "assigned"
        ? t.assigneeIds.includes(state.actorId)
        : tab === "created"
          ? t.createdBy === state.actorId
          : t.reviewerId === state.actorId && t.reviewRequired)
  );

  const today = dayKey(now, timezone);
  const group = (t: WorkspaceTask) => {
    if (!t.dueAt) return "No date";
    const d = dayKey(t.dueAt, timezone);
    if (d < today) return "Overdue";
    if (d === today) return "Today";
    return "Upcoming";
  };

  const sections = [
    {
      name: "Overdue",
      badgeVariant: "destructive" as const,
      color: "text-rose-500",
    },
    {
      name: "Today",
      badgeVariant: "default" as const,
      color: "text-amber-500",
    },
    {
      name: "Upcoming",
      badgeVariant: "secondary" as const,
      color: "text-blue-500",
    },
    {
      name: "No date",
      badgeVariant: "outline" as const,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="h-full space-y-6 overflow-y-auto p-5 lg:p-8">
      <HubHeading
        title="My Work"
        description="A centralized view of your commitments, assignments, and reviews across all spaces."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/40 p-1">
        {[
          { id: "assigned", name: "Assigned to me", icon: CircleCheck },
          { id: "created", name: "Created by me", icon: Plus },
          { id: "reviewing", name: "Reviewing", icon: UserCheck },
        ].map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(t.id)}
            className="gap-2 text-xs font-medium"
          >
            <t.icon className="size-3.5" />
            <span>{t.name}</span>
          </Button>
        ))}
      </div>

      {/* Status Groups */}
      <div className="space-y-4">
        {sections.map(({ name, badgeVariant }) => {
          const sectionTasks = tasks.filter((t) => group(t) === name);

          return (
            <Card key={name}>
              <CardHeader className="flex-row items-center justify-between border-b py-3 px-5">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">{name}</CardTitle>
                  <Badge variant={badgeVariant} className="font-mono text-xs">
                    {sectionTasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <TaskSummaryRows
                  state={state}
                  tasks={sectionTasks}
                  onOpen={onOpen}
                  empty={`No ${name.toLowerCase()} tasks in this view.`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function WorkspaceInbox({ state, scope, onOpen }: HubProps) {
  const [filter, setFilter] = useState("unread");
  const [category, setCategory] = useState("");
  const all = state.notifications.filter(
    (n) => n.workspaceId === scope.workspaceId && n.recipientId === state.actorId
  );
  const notifications = all.filter(
    (n) =>
      (filter === "archived" ? n.archived : !n.archived && (filter !== "unread" || !n.read)) &&
      (!category || n.category === category)
  );
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;

  return (
    <div className="h-full space-y-6 overflow-y-auto p-5 lg:p-8">
      <HubHeading
        title="Inbox"
        description="Notifications, assignments, reviews, mentions, and updates across your workspace."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() =>
            runTaskCommand({
              kind: "work-notifications",
              ids: all.filter((n) => !n.archived).map((n) => n.id),
              read: true,
            })
          }
        >
          <CheckCheck className="size-4" />
          Mark all read
        </Button>
      </HubHeading>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border bg-muted/40 p-1">
          {["unread", "all", "archived"].map((v) => (
            <Button
              key={v}
              variant={filter === v ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(v)}
              className="capitalize text-xs"
            >
              {v}
            </Button>
          ))}
        </div>

        <div className="ml-auto w-48">
          <SearchSelect
            value={category}
            options={[
              { value: "assignment", label: "Assignments" },
              { value: "mention", label: "Mentions" },
              { value: "review", label: "Reviews" },
              { value: "activity", label: "Activity" },
            ]}
            placeholder="All updates"
            onChange={setCategory}
          />
        </div>
      </div>

      {notifications.length ? (
        <Card className="gap-0 py-0">
          <CardContent className="divide-y divide-border/50 p-0">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 p-4 transition-colors hover:bg-muted/30",
                  !n.read && "bg-primary/5 dark:bg-primary/10"
                )}
              >
                <span
                  className={cn(
                    "mt-2 size-2.5 shrink-0 rounded-full",
                    n.read ? "bg-muted-foreground/30" : "bg-primary"
                  )}
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-left text-sm font-semibold text-foreground hover:text-primary hover:no-underline"
                    onClick={() => {
                      const task = state.tasks.find((t) => n.href.endsWith(`/${t.id}`));
                      if (
                        runTaskCommand({
                          kind: "work-notifications",
                          ids: [n.id],
                          read: true,
                        }) &&
                        task
                      ) {
                        onOpen(task.id);
                      }
                    }}
                  >
                    {n.title}
                  </Button>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground/80">
                    {n.from} · {formatTaskDate(n.when, timezone, true)}
                  </p>
                </div>

                <WorkMenu
                  label="Notification actions"
                  actions={[
                    {
                      label: n.read ? "Mark unread" : "Mark read",
                      onClick: () =>
                        runTaskCommand({
                          kind: "work-notifications",
                          ids: [n.id],
                          read: !n.read,
                        }),
                    },
                    {
                      label: n.archived ? "Restore notification" : "Archive notification",
                      onClick: () =>
                        runTaskCommand({
                          kind: "work-notifications",
                          ids: [n.id],
                          archived: !n.archived,
                        }),
                    },
                  ]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <WorkEmpty
          title="You're all caught up"
          description="Updates, mentions, and assignments will appear here as they occur."
        />
      )}
    </div>
  );
}

const CATALOG = [
  { value: "status", label: "Status distribution" },
  { value: "overdue", label: "Overdue work" },
  { value: "progress", label: "List / project progress" },
  { value: "workload", label: "Workload by assignee" },
  { value: "trend", label: "Completion trend" },
];

export function WorkspaceDashboards({ state, scope, onOpen }: HubProps) {
  const [space, setSpace] = useState("");
  const [list, setList] = useState("");
  const [after, setAfter] = useState("");
  const [before, setBefore] = useState("");
  const pref = preferencesFor(state, scope.workspaceId);
  const now = useTaskClock();
  const timezone = state.workspaces.find((w) => w.id === scope.workspaceId)!.timezone;

  const all = selectTasks(state, scope);
  const tasks = all.filter(
    (t) =>
      (!space || state.lists.find((l) => l.id === t.listId)?.spaceId === space) &&
      (!list || t.listId === list) &&
      (!after || (!!t.dueAt && dayKey(t.dueAt, timezone) >= after)) &&
      (!before || (!!t.dueAt && dayKey(t.dueAt, timezone) <= before))
  );

  const leaves = tasks.filter(
    (t) => !t.isGroup && !all.some((c) => c.parentId === t.id) && t.status !== "Cancelled"
  );

  const update = (dashboard: string[]) =>
    runTaskCommand({
      kind: "work-preferences",
      workspaceId: scope.workspaceId,
      patch: { dashboard },
    });

  const reorder = (index: number, delta: number) => {
    const next = [...pref.dashboard];
    if (!next[index + delta]) return;
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    update(next);
  };

  const chart = (data: { name: string; value: number }[], unit: string) => (
    <ChartContainer
      config={{ value: { label: unit, color: "var(--primary)" } }}
      className="h-56 w-full"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis width={30} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );

  return (
    <div className="h-full space-y-6 overflow-y-auto p-5 lg:p-8">
      <HubHeading
        title="Dashboards"
        description="Real-time progress, workload metrics, and delivery trends derived from your workspace."
      >
        <WorkMenu
          label="Add card"
          actions={CATALOG.filter((c) => !pref.dashboard.includes(c.value)).map((c) => ({
            label: `Add ${c.label}`,
            onClick: () => update([...pref.dashboard, c.value]),
          }))}
        />
      </HubHeading>

      {/* Dashboard Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44">
          <SearchSelect
            value={space}
            options={state.spaces
              .filter((s) => s.workspaceId === scope.workspaceId && !s.archived)
              .map((s) => ({ value: s.id, label: s.name }))}
            placeholder="All Spaces"
            onChange={(v) => {
              setSpace(v);
              setList("");
            }}
          />
        </div>

        <div className="w-44">
          <SearchSelect
            value={list}
            options={scopeLists(state, scope)
              .filter((l) => !space || l.spaceId === space)
              .map((l) => ({ value: l.id, label: l.name }))}
            placeholder="All Lists"
            onChange={setList}
          />
        </div>

        <Input
          className="w-40 text-xs"
          type="date"
          aria-label="Due on or after"
          value={after}
          onChange={(e) => setAfter(e.target.value)}
        />
        <Input
          className="w-40 text-xs"
          type="date"
          aria-label="Due on or before"
          value={before}
          onChange={(e) => setBefore(e.target.value)}
        />
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {pref.dashboard.map((id, index) => (
          <Card key={id}>
            <CardHeader className="flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-sm font-semibold">
                {CATALOG.find((c) => c.value === id)?.label}
              </CardTitle>
              <WorkMenu
                label="Card actions"
                actions={[
                  {
                    label: "Move up",
                    onClick: () => reorder(index, -1),
                    disabled: index === 0,
                  },
                  {
                    label: "Move down",
                    onClick: () => reorder(index, 1),
                    disabled: index === pref.dashboard.length - 1,
                  },
                  {
                    label: "Remove card",
                    onClick: () => update(pref.dashboard.filter((v) => v !== id)),
                  },
                ]}
              />
            </CardHeader>
            <CardContent className="pt-5">
              {id === "status" &&
                chart(
                  STATUS_CATEGORIES.map((c) => ({
                    name: CATEGORY_LABELS[c],
                    value: tasks.filter(
                      (t) =>
                        t.status === c &&
                        !t.isGroup &&
                        !all.some((child) => child.parentId === t.id)
                    ).length,
                  })),
                  "Tasks"
                )}

              {id === "overdue" && (
                <TaskSummaryRows
                  state={state}
                  tasks={leaves.filter((t) => isOverdue(t, now))}
                  onOpen={onOpen}
                />
              )}

              {id === "progress" && (
                <div className="space-y-4">
                  {scopeLists(state, scope)
                    .filter((l) => tasks.some((t) => t.listId === l.id))
                    .map((l) => {
                      const p = workProgress(leaves.filter((t) => t.listId === l.id));
                      return (
                        <div key={l.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <Link
                              href={nodeHref(l)}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {l.name}
                            </Link>
                            <span className="font-semibold text-muted-foreground">
                              {p.percent}%
                            </span>
                          </div>
                          <Progress value={p.percent} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              )}

              {id === "workload" && (
                <>
                  {chart(
                    [
                      {
                        name: "Unassigned",
                        value: leaves
                          .filter((t) => !isClosed(t) && !t.assigneeIds.length)
                          .reduce((n, t) => n + t.estimateHours, 0),
                      },
                      ...state.people
                        .filter((p) =>
                          leaves.some((t) => !isClosed(t) && t.assigneeIds.includes(p.id))
                        )
                        .map((p) => ({
                          name: p.name.split(" ")[0],
                          value:
                            Math.round(
                              leaves
                                .filter((t) => !isClosed(t) && t.assigneeIds.includes(p.id))
                                .reduce(
                                  (n, t) => n + t.estimateHours / t.assigneeIds.length,
                                  0
                                ) * 10
                            ) / 10,
                        })),
                    ],
                    "Estimated hours"
                  )}
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Estimates split evenly across assignees.
                  </p>
                </>
              )}

              {id === "trend" &&
                chart(
                  Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(now);
                    d.setDate(d.getDate() - 6 + i);
                    const key = dayKey(d, timezone);
                    return {
                      name: key.slice(5),
                      value: leaves.filter(
                        (t) => t.completedAt && dayKey(t.completedAt, timezone) === key
                      ).length,
                    };
                  }),
                  "Completed tasks"
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!pref.dashboard.length && (
        <WorkEmpty
          title="Build your dashboard"
          description="Use the Add card menu above to add progress, workload, status, and trend visualizations."
        />
      )}
    </div>
  );
}
