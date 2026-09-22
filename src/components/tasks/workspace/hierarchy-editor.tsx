"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { newProjectDraft } from "@/lib/tasks/domain";
import { runTaskCommand, useUnsavedTaskForm } from "@/hooks/use-task-workspace";
import { nodeById, statusesFor } from "@/lib/tasks/workspace-model";
import { CATEGORY_LABELS, STATUS_CATEGORIES, WORK_COLORS, type WorkNode, type WorkScope, type WorkStatus, type WorkWorkflow, type WorkspaceState } from "@/lib/tasks/workspace-types";
import { WorkLabel, WorkModal, OrderButtons } from "./common";
import { TaskDateInput } from "../task-shared";

export function buildNode(state: WorkspaceState, scope: WorkScope, kind: WorkNode["kind"]): WorkNode {
  const parent = nodeById(state, scope.id);
  const spaceId = parent?.kind === "space" ? parent.id : parent && "spaceId" in parent ? parent.spaceId : state.spaces.find((s) => s.workspaceId === scope.workspaceId && !s.archived)?.id ?? "";
  const members = Object.keys(state.workspaces.find((w) => w.id === scope.workspaceId)!.members);
  const base = { id: crypto.randomUUID(), workspaceId: scope.workspaceId, name: "", description: "", color: parent?.color ?? "#3b82f6", managerId: state.actorId, memberIds: members, workflowId: "", archived: false, position: [...state.spaces, ...state.folders, ...state.lists].length, startAt: null, dueAt: null, health: "On track" as const };
  if (kind === "space") return { ...base, kind };
  if (kind === "folder") return { ...base, kind, spaceId };
  return { ...newProjectDraft(state.actorId, () => crypto.randomUUID()), ...base, kind, spaceId, folderId: parent?.kind === "folder" ? parent.id : "", department: "", createdAt: new Date().toISOString() };
}
export function StatusMapping({ entries, map, onChange }: { entries: { id: string; name: string; options: WorkStatus[] }[]; map: Record<string, string>; onChange: (map: Record<string, string>) => void }) {
  if (!entries.length) return null;
  return <div className="space-y-3 border-t pt-4"><p className="text-sm font-medium">Map affected task statuses</p><p className="text-xs text-muted-foreground">Choose a replacement in the same category. No tasks will be completed or reopened by this change.</p>{entries.map((entry) => <WorkLabel key={entry.id} label={entry.name}><SearchSelect value={map[entry.id] ?? ""} onChange={(value) => onChange({ ...map, [entry.id]: value })} options={entry.options.map((s) => ({ value: s.id, label: s.name }))} placeholder="Choose replacement status" /></WorkLabel>)}</div>;
}
export function requiredMappings(before: WorkspaceState, after: WorkspaceState) {
  const entries = new Map<string, { id: string; name: string; options: WorkStatus[] }>();
  for (const task of before.tasks) {
    let next: WorkStatus[];
    try { next = statusesFor(after, task.listId); } catch { continue; }
    if (!next.some((s) => s.id === task.statusId && s.category === task.status)) {
      const options = next.filter((s) => s.category === task.status);
      const previous = entries.get(task.statusId);
      entries.set(task.statusId, { id: task.statusId, name: `${statusesFor(before, task.listId).find((s) => s.id === task.statusId)?.name ?? task.status} · ${CATEGORY_LABELS[task.status]}`, options: previous ? options.filter((s) => previous.options.some((p) => p.id === s.id)) : options });
    }
  }
  return [...entries.values()];
}
export function HierarchyEditor({ state, initial, onClose }: { state: WorkspaceState; initial: WorkNode; onClose: () => void }) {
  const [node, setNode] = useState(initial);
  const [map, setMap] = useState<Record<string, string>>({});
  const existing = !!nodeById(state, node.id);
  const dirty = JSON.stringify(node) !== JSON.stringify(initial);
  useUnsavedTaskForm(dirty);
  const close = () => { if (!dirty || window.confirm("Discard these unsaved location changes?")) onClose(); };
  const set = (patch: Partial<WorkNode>) => setNode({ ...node, ...patch } as WorkNode);
  const work = state.workspaces.find((w) => w.id === node.workspaceId)!;
  const preview = structuredClone(state);
  const key = node.kind === "space" ? "spaces" : node.kind === "folder" ? "folders" : "lists";
  (preview[key] as WorkNode[]) = [...preview[key].filter((n) => n.id !== node.id), node];
  if (node.kind === "folder") preview.lists.forEach((l) => { if (l.folderId === node.id) l.spaceId = node.spaceId; });
  const mappings = existing ? requiredMappings(state, preview) : [];
  return <WorkModal title={`${existing ? "Edit" : "Create"} ${node.kind}`} description="Organize the work, configure its workflow, and bring the right people together." onClose={close} wide>
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (runTaskCommand({ kind: "work-node", node, statusMap: map }, `${node.kind} saved`)) onClose(); }}>
      <WorkLabel label="Name"><Input required maxLength={120} autoFocus value={node.name} onChange={(e) => set({ name: e.target.value })} placeholder={node.kind === "space" ? "e.g. Product & Engineering" : node.kind === "folder" ? "e.g. Website launch" : "e.g. Design workstream"} /></WorkLabel>
      <WorkLabel label="Description / project brief"><Textarea rows={3} value={node.description} onChange={(e) => set({ description: e.target.value })} placeholder="What will the team accomplish here?" /></WorkLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        {node.kind !== "space" && <WorkLabel label="Space"><SearchSelect value={node.spaceId} options={state.spaces.filter((s) => s.workspaceId === work.id && !s.archived).map((s) => ({ value: s.id, label: s.name }))} onChange={(spaceId) => set({ spaceId, ...(node.kind === "list" ? { folderId: "" } : {}) })} placeholder="Choose a Space" /></WorkLabel>}
        {node.kind === "list" && <WorkLabel label="Folder (optional)"><SearchSelect value={node.folderId} options={state.folders.filter((f) => f.spaceId === node.spaceId && !f.archived).map((f) => ({ value: f.id, label: f.name }))} onChange={(folderId) => set({ folderId })} placeholder="Directly in Space" /></WorkLabel>}
        <WorkLabel label="Workflow"><SearchSelect value={node.workflowId} options={state.workflows.filter((f) => f.workspaceId === work.id).map((f) => ({ value: f.id, label: f.name }))} onChange={(workflowId) => set({ workflowId })} placeholder="Inherit from parent" /></WorkLabel>
        <WorkLabel label="Health"><SearchSelect value={node.health} options={["On track", "At risk", "Off track"]} onChange={(health) => health && set({ health: health as WorkNode["health"] })} /></WorkLabel>
        <WorkLabel label="Manager"><SearchSelect value={node.managerId} options={state.people.filter((p) => work.members[p.id] && work.members[p.id] !== "Viewer").map((p) => ({ value: p.id, label: `${p.name} · ${p.employeeCode}` }))} onChange={(managerId) => managerId && set({ managerId, memberIds: [...new Set([...node.memberIds, managerId])] })} /></WorkLabel>
        <WorkLabel label="Color"><SearchSelect value={node.color} options={WORK_COLORS.map((color, i) => ({ value: color, label: ["Slate", "Blue", "Violet", "Green", "Amber", "Rose"][i] }))} onChange={(color) => color && set({ color })} /></WorkLabel>
        <WorkLabel label="Start"><TaskDateInput id="node-start" value={node.startAt} timezone={work.timezone} onChange={(startAt) => set({ startAt })} /></WorkLabel>
        <WorkLabel label="Due"><TaskDateInput id="node-due" value={node.dueAt} timezone={work.timezone} onChange={(dueAt) => set({ dueAt })} /></WorkLabel>
      </div>
      <WorkLabel label="Members"><SearchSelect multiple value={node.memberIds} options={state.people.filter((p) => work.members[p.id]).map((p) => ({ value: p.id, label: `${p.name} · ${p.employeeCode}` }))} onChange={(memberIds) => set({ memberIds: [...new Set([...memberIds, node.managerId])] })} placeholder="Add team members" /></WorkLabel>
      <StatusMapping entries={mappings} map={map} onChange={setMap} />
      <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={!node.name.trim() || mappings.some((e) => !map[e.id])}>{existing ? "Save changes" : `Create ${node.kind}`}</Button></div>
    </form>
  </WorkModal>;
}
export function WorkflowEditor({ state, initial, onClose }: { state: WorkspaceState; initial: WorkWorkflow; onClose: () => void }) {
  const [flow, setFlow] = useState(initial);
  const [map, setMap] = useState<Record<string, string>>({});
  const preview = { ...state, workflows: [...state.workflows.filter((f) => f.id !== flow.id), flow] };
  const mappings = requiredMappings(state, preview);
  const update = (id: string, patch: Partial<WorkStatus>) => setFlow({ ...flow, statuses: flow.statuses.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const reorder = (index: number, delta: number) => { const statuses = [...flow.statuses]; [statuses[index], statuses[index + delta]] = [statuses[index + delta], statuses[index]]; setFlow({ ...flow, statuses }); };
  return <WorkModal title="Configure workflow" description="Name your stages of work. Semantic categories keep progress and review rules consistent across the workspace." onClose={onClose} wide><div className="space-y-4"><WorkLabel label="Workflow name"><Input value={flow.name} onChange={(e) => setFlow({ ...flow, name: e.target.value })} /></WorkLabel>{flow.statuses.map((status, i) => <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2" key={status.id}><Input aria-label="Status name" value={status.name} onChange={(e) => update(status.id, { name: e.target.value })} /><SearchSelect value={status.category} options={STATUS_CATEGORIES.map((category) => ({ value: category, label: CATEGORY_LABELS[category] }))} onChange={(category) => category && update(status.id, { category: category as WorkStatus["category"] })} /><div className="flex items-center"><OrderButtons first={i === 0} last={i === flow.statuses.length - 1} up={() => reorder(i, -1)} down={() => reorder(i, 1)} /><Button variant="ghost" size="icon-sm" aria-label={`Remove ${status.name}`} onClick={() => setFlow({ ...flow, statuses: flow.statuses.filter((s) => s.id !== status.id) })}><Trash2 className="size-3.5" /></Button></div><div className="col-span-2"><SearchSelect value={status.color} options={WORK_COLORS.map((c, i) => ({ value: c, label: ["Slate", "Blue", "Violet", "Green", "Amber", "Rose"][i] }))} onChange={(color) => color && update(status.id, { color })} /></div></div>)}<Button variant="outline" onClick={() => setFlow({ ...flow, statuses: [...flow.statuses, { id: crypto.randomUUID(), name: "New status", category: "Working", color: "#3b82f6" }] })}><Plus className="size-4" /> Add status</Button><StatusMapping entries={mappings} map={map} onChange={setMap} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={mappings.some((e) => !map[e.id])} onClick={() => { if (runTaskCommand({ kind: "work-workflow", workflow: flow, statusMap: map }, "Workflow saved")) onClose(); }}>Save workflow</Button></div></div></WorkModal>;
}
