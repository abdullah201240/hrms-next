"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  CalendarDays,
  Check,
  Columns3,
  Copy,
  Eye,
  Filter,
  GanttChart,
  Hash,
  Layers,
  LayoutGrid,
  List,
  MoreHorizontal,
  MoveLeft,
  MoveRight,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Settings2,
  SlidersHorizontal,
  Star,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchSelect } from "@/components/shared/search-select";
import { runTaskCommand, useTaskClock } from "@/hooks/use-task-workspace";
import {
  canManageNode,
  canWriteWorkspace,
  fieldsFor,
  newView,
  nodeById,
  preferencesFor,
  scopeLists,
  selectTasks,
  statusesFor,
} from "@/lib/tasks/workspace-model";
import {
  CATEGORY_LABELS,
  STATUS_CATEGORIES,
  type GroupKind,
  type ViewFilter,
  type WorkScope,
  type WorkView,
  type WorkspaceState,
} from "@/lib/tasks/workspace-types";
import { TASK_PRIORITIES } from "@/lib/tasks/types";
import { WorkspaceBoard } from "./board";
import { BASE_FIELDS, BulkEditor, WorkspaceTable } from "./list-table";
import { WorkLabel, WorkMenu, WorkModal, WorkPeople, OrderButtons } from "./common";
import { HierarchyEditor } from "./hierarchy-editor";
import { WorkspaceSchedule } from "./scheduling";
import { LocationOverview } from "./hubs";
import { cn } from "@/lib/utils";

const kinds = [
  { value: "list", label: "List", icon: List },
  { value: "board", label: "Board", icon: Columns3 },
  { value: "table", label: "Table", icon: Table2 },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
  { value: "timeline", label: "Timeline", icon: GanttChart },
] as const;

export function WorkspaceWorkArea({
  state,
  scope,
  onOpen,
  onCreate,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  onOpen: (id: string) => void;
  onCreate: (listId?: string, statusId?: string, dueAt?: string) => void;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const views = state.views
    .filter(
      (v) =>
        v.workspaceId === scope.workspaceId &&
        v.scopeId === scope.id &&
        (!v.personal || v.creatorId === state.actorId)
    )
    .sort((a, b) => a.position - b.position);

  const selected =
    views.find((v) => v.id === params.get("view")) ??
    views.find((v) => v.isDefault) ??
    views[0] ??
    newView("", scope, state.actorId);

  const [manage, setManage] = useState<WorkView | null>(null);
  const [editNode, setEditNode] = useState(false);
  const node = nodeById(state, scope.id);
  const overview =
    params.get("view") === "overview" ||
    (!params.has("view") && (scope.kind === "space" || scope.kind === "folder"));

  const switchView = (id: string) => {
    const p = new URLSearchParams(params);
    p.set("view", id);
    p.delete("filters");
    router.push(`${pathname}?${p}`, { scroll: false });
  };

  const addView = () =>
    setManage({
      ...newView(crypto.randomUUID(), scope, state.actorId),
      position: views.length,
      isDefault: false,
    });

  const reorder = (delta: number) => {
    const index = views.findIndex((v) => v.id === selected.id);
    if (!views[index + delta]) return;
    const next = [...views];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    runTaskCommand({
      kind: "work-batch",
      commands: next.map((view, position) => ({
        kind: "work-view",
        view: { ...view, position },
      })),
    });
  };

  const pref = preferencesFor(state, scope.workspaceId);
  const isFavorited = pref.favorites.includes(selected.id);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-background">
      {/* Top Location Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-card px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-xl font-bold shadow-xs"
            style={{
              backgroundColor: node?.color ? `${node.color}20` : "var(--primary-foreground)",
              color: node?.color || "var(--primary)",
            }}
          >
            <Hash className="size-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>
                {scope.kind === "workspace"
                  ? "Workspace"
                  : state.spaces.find((s) => s.id === (node && "spaceId" in node ? node.spaceId : ""))
                      ?.name ?? "Space"}
              </span>
              <span>/</span>
              <span className="capitalize">{scope.kind}</span>
            </div>
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {node?.name ?? "Everything"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <WorkPeople
              state={state}
              ids={
                node?.memberIds.slice(0, 5) ??
                Object.keys(state.workspaces.find((w) => w.id === scope.workspaceId)!.members).slice(
                  0,
                  4
                )
              }
            />
          </div>

          {node && (
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Location settings"
              disabled={!canManageNode(state, node)}
              onClick={() => setEditNode(true)}
              className="size-8 rounded-lg"
            >
              <Settings2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* View Tabs Navigation */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b bg-muted/20 px-4 py-1.5 sm:px-6">
        {node && (
          <Button
            variant={overview ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8 gap-1.5 rounded-lg text-xs font-medium transition-all",
              overview
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => switchView("overview")}
          >
            <LayoutGrid className="size-3.5" />
            <span>Overview</span>
          </Button>
        )}

        {views.map((v) => {
          const Icon = kinds.find((k) => k.value === v.type)!.icon;
          const isActive = !overview && selected.id === v.id;

          return (
            <Button
              key={v.id}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-lg text-xs font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => switchView(v.id)}
            >
              <Icon className="size-3.5" />
              <span>{v.name}</span>
            </Button>
          );
        })}

        <Button
          variant="ghost"
          size="sm"
          onClick={addView}
          disabled={!canWriteWorkspace(state, scope.workspaceId)}
          className="h-8 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
          <span>View</span>
        </Button>

        {!overview && (
          <div className="ml-auto flex items-center gap-1">
            <WorkMenu
              label="View actions"
              actions={[
                {
                  label: "Rename / view settings",
                  icon: <Settings className="size-3.5" />,
                  onClick: () => setManage(selected),
                },
                {
                  label: "Duplicate view",
                  icon: <Copy className="size-3.5" />,
                  onClick: () =>
                    setManage({
                      ...selected,
                      id: crypto.randomUUID(),
                      name: `${selected.name} copy`,
                      creatorId: state.actorId,
                      position: views.length,
                      isDefault: false,
                    }),
                },
                {
                  label: isFavorited ? "Remove favorite" : "Favorite view",
                  icon: <Star className="size-3.5" />,
                  onClick: () =>
                    runTaskCommand({
                      kind: "work-preferences",
                      workspaceId: scope.workspaceId,
                      patch: {
                        favorites: isFavorited
                          ? pref.favorites.filter((id) => id !== selected.id)
                          : [...pref.favorites, selected.id],
                      },
                    }),
                },
                {
                  label: "Set as default",
                  icon: <Check className="size-3.5" />,
                  onClick: () =>
                    runTaskCommand({
                      kind: "work-view",
                      view: { ...selected, isDefault: true },
                    }),
                },
                {
                  label: "Move view left",
                  icon: <MoveLeft className="size-3.5" />,
                  onClick: () => reorder(-1),
                },
                {
                  label: "Move view right",
                  icon: <MoveRight className="size-3.5" />,
                  onClick: () => reorder(1),
                },
                {
                  label: "Copy view link",
                  onClick: () => {
                    navigator.clipboard.writeText(location.href).then(
                      () => toast.success("View link copied"),
                      () => toast.error("Clipboard unavailable")
                    );
                  },
                },
                {
                  label: "Remove view",
                  danger: true,
                  icon: <Trash2 className="size-3.5" />,
                  onClick: () => {
                    if (window.confirm(`Remove ${selected.name}? Tasks are not deleted.`)) {
                      runTaskCommand({ kind: "work-remove-view", id: selected.id });
                    }
                  },
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      {overview ? (
        <LocationOverview state={state} scope={scope} onOpen={onOpen} />
      ) : (
        <ViewSurface
          key={`${scope.id}-${selected.id}-${state.actorId}`}
          state={state}
          scope={scope}
          saved={selected}
          onOpen={onOpen}
          onCreate={onCreate}
          onSaveAs={(v) =>
            setManage({
              ...v,
              id: crypto.randomUUID(),
              name: `${v.name} copy`,
              creatorId: state.actorId,
              isDefault: false,
              position: views.length,
            })
          }
        />
      )}

      {/* Modals */}
      {manage && (
        <ViewEditor
          initial={manage}
          onClose={() => setManage(null)}
          onSave={(view) => {
            if (runTaskCommand({ kind: "work-view", view }, "View saved")) {
              setManage(null);
              switchView(view.id);
            }
          }}
        />
      )}

      {editNode && node && (
        <HierarchyEditor state={state} initial={node} onClose={() => setEditNode(false)} />
      )}
    </div>
  );
}

function ViewEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: WorkView;
  onClose: () => void;
  onSave: (view: WorkView) => void;
}) {
  const [view, setView] = useState(initial);

  return (
    <WorkModal title="Configure View" onClose={onClose}>
      <div className="space-y-4">
        <WorkLabel label="View Name">
          <Input
            value={view.name}
            onChange={(e) => setView({ ...view, name: e.target.value })}
            placeholder="e.g. Sprint Board, Backlog"
            autoFocus
          />
        </WorkLabel>

        <WorkLabel label="View Layout">
          <SearchSelect
            value={view.type}
            options={kinds}
            onChange={(v) => v && setView({ ...view, type: v as WorkView["type"] })}
          />
        </WorkLabel>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={view.personal}
              onCheckedChange={(v) => setView({ ...view, personal: !!v })}
            />
            Personal View (Private to you)
          </label>
          <p className="text-xs text-muted-foreground ml-6">
            Shared views are visible to anyone with access to this location.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!view.name.trim()} onClick={() => onSave(view)}>
            Save View
          </Button>
        </div>
      </div>
    </WorkModal>
  );
}

function ViewSurface({
  state,
  scope,
  saved,
  onOpen,
  onCreate,
  onSaveAs,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  saved: WorkView;
  onOpen: (id: string) => void;
  onCreate: (listId?: string, statusId?: string, dueAt?: string) => void;
  onSaveAs: (view: WorkView) => void;
}) {
  const params = useSearchParams();
  const [draft, setDraft] = useState(saved);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<"filters" | "options" | "bulk" | null>(null);
  const now = useTaskClock();
  const lists = scopeLists(state, scope);
  const fields = state.fields.filter(
    (f) => !f.archived && lists.some((l) => fieldsFor(state, l.id).some((field) => field.id === f.id))
  );
  const allowed = new Set([
    "name",
    "status",
    "category",
    "assignee",
    "priority",
    "tag",
    "list",
    "space",
    "start",
    "due",
    "blocked",
    "review",
    ...fields.map((f) => `field:${f.id}`),
  ]);

  let filters = draft.filters;
  const filterParam = params.get("filters");
  if (filterParam) {
    try {
      const value: unknown = JSON.parse(filterParam);
      if (
        Array.isArray(value) &&
        value.length <= 30 &&
        value.every(
          (f) =>
            f &&
            typeof f.id === "string" &&
            allowed.has(f.field) &&
            ["is", "is-not", "contains", "before", "after"].includes(f.operator) &&
            typeof f.value === "string"
        )
      ) {
        filters = value;
      }
    } catch {
      /* Invalid URL overrides leave the saved view intact. */
    }
  }

  const view = { ...draft, filters };
  const query = (params.get("q") ?? "").slice(0, 255);

  const updateUrl = (key: string, value: string) => {
    const p = new URLSearchParams(window.location.search);
    if (value) p.set(key, value);
    else p.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}?${p}`);
  };

  const onView = (next: WorkView) => {
    setDraft(next);
    if (JSON.stringify(next.filters) !== JSON.stringify(filters)) {
      updateUrl("filters", JSON.stringify(next.filters));
    }
  };

  const tasks = selectTasks(state, scope, view, query, now);
  const dirty = JSON.stringify(view) !== JSON.stringify(saved);

  const groupOptions = [
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
    { value: "assignee", label: "Primary assignee" },
    { value: "list", label: "List" },
    ...fields
      .filter((f) => f.type === "select" && lists.every((l) => fieldsFor(state, l.id).some((field) => field.id === f.id)))
      .map((f) => ({ value: `field:${f.id}`, label: f.name })),
  ];

  return (
    <>
      {/* View Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-card/60 px-5 py-2.5 backdrop-blur-xs">
        {/* Search Bar */}
        <div className="relative w-44 sm:w-52">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            aria-label="Search this view"
            placeholder="Search tasks…"
            className="h-8 pl-8 text-xs rounded-lg"
            value={query}
            onChange={(e) => updateUrl("q", e.target.value)}
          />
        </div>

        {/* Filter Button */}
        <Button
          variant={filters.length ? "secondary" : "outline"}
          size="sm"
          onClick={() => setDialog("filters")}
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          <Filter className="size-3.5" />
          <span>Filter</span>
          {filters.length > 0 && (
            <Badge variant="default" className="size-4 p-0 text-[10px] justify-center">
              {filters.length}
            </Badge>
          )}
        </Button>

        {/* Customize Options */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialog("options")}
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          <SlidersHorizontal className="size-3.5" />
          <span>Group & Sort</span>
        </Button>

        {/* Show closed checkbox */}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer px-2">
          <Checkbox
            checked={view.showClosed}
            onCheckedChange={(v) => onView({ ...view, showClosed: !!v })}
          />
          <span>Show closed</span>
        </label>

        {/* Tasks Count */}
        <span className="hidden sm:inline text-xs text-muted-foreground font-mono">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>

        {/* Right Action buttons */}
        <div className="ml-auto flex items-center gap-1.5">
          {dirty && (
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-0.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  setDraft(saved);
                  updateUrl("filters", "");
                }}
              >
                <RotateCcw className="size-3 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => onSaveAs(view)}
              >
                Save as new
              </Button>
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs font-semibold gap-1"
                onClick={() => {
                  if (runTaskCommand({ kind: "work-view", view }, "View saved")) {
                    updateUrl("filters", "");
                  }
                }}
              >
                <Save className="size-3" />
                Save view
              </Button>
            </div>
          )}

          <Button
            size="sm"
            disabled={!canWriteWorkspace(state, scope.workspaceId)}
            onClick={() => onCreate()}
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Task</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {!!filters.length && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b bg-muted/20 px-5 py-2">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">Filtered by:</span>
          {filters.map((f) => (
            <Badge
              key={f.id}
              variant="secondary"
              className="gap-1.5 pl-2 pr-1 py-0.5 text-xs font-normal"
            >
              <span className="font-semibold capitalize">{f.field}:</span>
              <span>
                {state.people.find((p) => p.id === f.value)?.name ?? f.value}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-4 p-0 hover:bg-muted"
                aria-label="Remove filter"
                onClick={() =>
                  onView({
                    ...view,
                    filters: filters.filter((item) => item.id !== f.id),
                  })
                }
              >
                <X className="size-2.5" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={() => onView({ ...view, filters: [] })}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Bulk Selection Bar */}
      {selected.size > 0 && (
        <div className="flex shrink-0 items-center justify-between border-b bg-primary/10 px-5 py-2 text-xs font-medium text-primary">
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              {selected.size} {selected.size === 1 ? "task" : "tasks"} selected
            </span>
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs font-semibold"
              onClick={() => setDialog("bulk")}
            >
              Bulk actions
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs hover:bg-primary/20"
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* View Surface Content */}
      <div className="min-h-0 flex-1">
        {view.type === "board" ? (
          <WorkspaceBoard
            state={state}
            scope={scope}
            view={view}
            tasks={tasks}
            selected={selected}
            onSelect={setSelected}
            onView={onView}
            onOpen={onOpen}
            onCreate={onCreate}
          />
        ) : view.type === "calendar" || view.type === "timeline" ? (
          <WorkspaceSchedule
            state={state}
            scope={scope}
            view={view}
            tasks={tasks}
            onOpen={onOpen}
            onCreate={onCreate}
          />
        ) : (
          <WorkspaceTable
            state={state}
            scope={scope}
            view={view}
            tasks={tasks}
            selected={selected}
            onSelect={setSelected}
            onView={onView}
            onOpen={onOpen}
            onCreate={onCreate}
          />
        )}
      </div>

      {/* Bulk Editor Dialog */}
      {dialog === "bulk" && (
        <BulkEditor
          state={state}
          scope={scope}
          ids={[...selected]}
          onClose={() => setDialog(null)}
        />
      )}

      {/* Filter Editor Dialog */}
      {dialog === "filters" && (
        <FilterEditor
          state={state}
          scope={scope}
          view={view}
          onChange={onView}
          onClose={() => setDialog(null)}
        />
      )}

      {/* View Customizer Dialog */}
      {dialog === "options" && (
        <WorkModal
          title="Customize View"
          description="Adjust grouping, sorting, visible columns, and layout density."
          onClose={() => setDialog(null)}
          wide
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <WorkLabel label="Group by">
                <SearchSelect
                  value={view.groupBy}
                  options={groupOptions}
                  onChange={(v) =>
                    v &&
                    onView({
                      ...view,
                      groupBy: v as GroupKind,
                      swimlane: v === view.swimlane ? "none" : view.swimlane,
                    })
                  }
                />
              </WorkLabel>

              <WorkLabel label="Sort by">
                <SearchSelect
                  value={view.sort}
                  options={[
                    { value: "manual", label: "Manual order" },
                    { value: "name", label: "Name" },
                    { value: "due", label: "Due date" },
                    { value: "priority", label: "Priority" },
                  ]}
                  onChange={(v) => v && onView({ ...view, sort: v })}
                />
              </WorkLabel>

              <WorkLabel label="Subtasks Display">
                <SearchSelect
                  value={view.subtasks}
                  options={[
                    { value: "nested", label: "Nested under parents" },
                    { value: "separate", label: "Separate tasks" },
                    { value: "hidden", label: "Hidden" },
                  ]}
                  onChange={(v) => v && onView({ ...view, subtasks: v as WorkView["subtasks"] })}
                />
              </WorkLabel>

              <WorkLabel label="Row Density">
                <SearchSelect
                  value={view.density}
                  options={[
                    { value: "comfortable", label: "Comfortable" },
                    { value: "compact", label: "Compact" },
                  ]}
                  onChange={(v) => v && onView({ ...view, density: v as WorkView["density"] })}
                />
              </WorkLabel>

              {view.type === "board" && (
                <WorkLabel label="Swimlanes">
                  <SearchSelect
                    value={view.swimlane}
                    options={[
                      { value: "none", label: "None" },
                      ...[
                        { value: "list", label: "List" },
                        { value: "priority", label: "Priority" },
                      ].filter((o) => o.value !== view.groupBy),
                    ]}
                    onChange={(v) => v && onView({ ...view, swimlane: v as WorkView["swimlane"] })}
                  />
                </WorkLabel>
              )}
            </div>

            <div className="space-y-3 border-t pt-4">
              <WorkLabel label="Visible Columns / Fields">
                <SearchSelect
                  multiple
                  value={view.fields}
                  options={[
                    ...BASE_FIELDS,
                    ...fields.map((f) => ({ value: `field:${f.id}`, label: f.name })),
                  ]}
                  onChange={(value) => onView({ ...view, fields: value })}
                />
              </WorkLabel>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {view.fields.map((f, index) => (
                  <div
                    key={f}
                    className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2 text-xs"
                  >
                    <span className="flex-1 font-medium">
                      {BASE_FIELDS.find((b) => b.value === f)?.label ??
                        fields.find((b) => `field:${b.id}` === f)?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Width:</span>
                      <Input
                        aria-label={`${f} width`}
                        type="number"
                        min={100}
                        max={600}
                        className="h-7 w-20 text-xs"
                        value={view.widths[f] ?? 145}
                        onChange={(e) =>
                          onView({
                            ...view,
                            widths: {
                              ...view.widths,
                              [f]: Math.max(100, Math.min(600, Number(e.target.value))),
                            },
                          })
                        }
                      />
                    </div>
                    <OrderButtons
                      first={index === 0}
                      last={index === view.fields.length - 1}
                      up={() => {
                        const order = [...view.fields];
                        [order[index], order[index - 1]] = [order[index - 1], order[index]];
                        onView({ ...view, fields: order });
                      }}
                      down={() => {
                        const order = [...view.fields];
                        [order[index], order[index + 1]] = [order[index + 1], order[index]];
                        onView({ ...view, fields: order });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDialog(null)}>Done</Button>
            </div>
          </div>
        </WorkModal>
      )}
    </>
  );
}

function FilterEditor({
  state,
  scope,
  view,
  onChange,
  onClose,
}: {
  state: WorkspaceState;
  scope: WorkScope;
  view: WorkView;
  onChange: (view: WorkView) => void;
  onClose: () => void;
}) {
  const lists = scopeLists(state, scope);
  const fields = state.fields.filter(
    (f) => !f.archived && lists.some((l) => fieldsFor(state, l.id).some((x) => x.id === f.id))
  );
  const options = [
    { value: "name", label: "Task name" },
    { value: "status", label: "Status" },
    { value: "category", label: "Status category" },
    { value: "assignee", label: "Assignee" },
    { value: "priority", label: "Priority" },
    { value: "tag", label: "Tag" },
    { value: "list", label: "List" },
    { value: "space", label: "Space" },
    { value: "due", label: "Due date / preset" },
    { value: "start", label: "Start date" },
    { value: "blocked", label: "Blocked" },
    { value: "review", label: "Review required" },
    ...fields.map((f) => ({ value: `field:${f.id}`, label: f.name })),
  ];

  const values = (f: ViewFilter) => {
    if (f.field === "priority") return TASK_PRIORITIES.map((v) => ({ value: v, label: v }));
    if (f.field === "assignee")
      return [
        { value: "unassigned", label: "Unassigned" },
        ...state.people
          .filter((p) => lists.some((l) => l.memberIds.includes(p.id)))
          .map((p) => ({ value: p.id, label: p.name })),
      ];
    if (f.field === "status")
      return [
        ...new Map(
          lists.flatMap((l) => statusesFor(state, l.id)).map((s) => [s.id, { value: s.id, label: s.name }])
        ).values(),
      ];
    if (f.field === "category")
      return STATUS_CATEGORIES.map((s) => ({ value: s, label: CATEGORY_LABELS[s] }));
    if (f.field === "list") return lists.map((l) => ({ value: l.id, label: l.name }));
    if (f.field === "space")
      return state.spaces
        .filter((s) => s.workspaceId === scope.workspaceId)
        .map((s) => ({ value: s.id, label: s.name }));
    if (f.field === "due" && ["is", "is-not"].includes(f.operator))
      return ["overdue", "today", "upcoming", "none"].map((v) => ({ value: v, label: v }));
    const field = fields.find((x) => `field:${x.id}` === f.field);
    if (field?.type === "select")
      return field.options.map((o) => ({ value: o.id, label: o.label }));
    if (["blocked", "review"].includes(f.field) || field?.type === "checkbox")
      return [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ];
    return null;
  };

  const edit = (id: string, patch: Partial<ViewFilter>) =>
    onChange({
      ...view,
      filters: view.filters.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });

  return (
    <WorkModal
      title="Filter Tasks"
      description="Apply criteria to narrow down tasks in this view."
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        <div className="w-52">
          <SearchSelect
            value={view.match}
            options={[
              { value: "all", label: "Match ALL filters (AND)" },
              { value: "any", label: "Match ANY filter (OR)" },
            ]}
            onChange={(v) => v && onChange({ ...view, match: v as "all" | "any" })}
          />
        </div>

        <div className="space-y-3">
          {view.filters.map((f) => {
            const choices = values(f);
            return (
              <div
                key={f.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-xl border bg-muted/20 p-3"
              >
                <SearchSelect
                  value={f.field}
                  options={options}
                  onChange={(v) => v && edit(f.id, { field: v, value: "" })}
                />
                <SearchSelect
                  value={f.operator}
                  options={[
                    { value: "is", label: "Is" },
                    { value: "is-not", label: "Is not" },
                    { value: "contains", label: "Contains" },
                    { value: "before", label: "On or before" },
                    { value: "after", label: "On or after" },
                  ]}
                  onChange={(v) => v && edit(f.id, { operator: v as ViewFilter["operator"] })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground hover:text-destructive"
                  aria-label="Remove filter"
                  onClick={() =>
                    onChange({
                      ...view,
                      filters: view.filters.filter((item) => item.id !== f.id),
                    })
                  }
                >
                  <X className="size-4" />
                </Button>

                <div className="col-span-2">
                  {choices ? (
                    <SearchSelect
                      value={f.value}
                      options={choices}
                      onChange={(value) => edit(f.id, { value })}
                    />
                  ) : (
                    <Input
                      aria-label="Filter value"
                      type={
                        f.field === "due" ||
                        f.field === "start" ||
                        fields.find((x) => `field:${x.id}` === f.field)?.type === "date"
                          ? "date"
                          : "text"
                      }
                      value={f.value}
                      onChange={(e) => edit(f.id, { value: e.target.value })}
                      placeholder="Enter value…"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...view,
                filters: [
                  ...view.filters,
                  {
                    id: crypto.randomUUID(),
                    field: "priority",
                    operator: "is",
                    value: "High",
                  },
                ],
              })
            }
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Add filter</span>
          </Button>

          <Button onClick={onClose}>Apply Filters</Button>
        </div>
      </div>
    </WorkModal>
  );
}
