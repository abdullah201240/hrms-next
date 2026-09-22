"use client";

import { createTaskDemo } from "../mock/data-tasks";
import { applyTaskCommand } from "./domain";
import { parseTaskSnapshot, TASK_STORAGE_KEY } from "./persistence";
import type { TaskCommand, TaskRepository, TaskWorkspace } from "./types";

export interface TaskStoreSnapshot { workspace: TaskWorkspace | null; ready: boolean; error: string | null }
const serverSnapshot: TaskStoreSnapshot = { workspace: null, ready: false, error: null };
let snapshot = serverSnapshot;
let lastRaw: string | null = null;
let scheduled = false;
const listeners = new Set<() => void>();
function publish(next: TaskStoreSnapshot) { snapshot = next; listeners.forEach((listener) => listener()); }
function hydrate() {
  try {
    const raw = window.localStorage.getItem(TASK_STORAGE_KEY);
    const workspace = raw ? parseTaskSnapshot(raw) : createTaskDemo();
    const serialized = raw ?? JSON.stringify(workspace);
    if (!raw) window.localStorage.setItem(TASK_STORAGE_KEY, serialized);
    lastRaw = serialized;
    publish({ workspace, ready: true, error: null });
  } catch {
    publish({ workspace: snapshot.workspace, ready: true, error: "Could not load the task demo. Browser storage may be unavailable or the saved snapshot is invalid. Your stored data has not been replaced. Retry or explicitly reset the demo." });
  }
}
function ensureHydration() {
  if (typeof window === "undefined" || scheduled) return;
  scheduled = true;
  queueMicrotask(hydrate);
  window.addEventListener("storage", (event) => {
    if (event.key === TASK_STORAGE_KEY || event.key === null) hydrate();
  });
}
export function subscribeTasks(listener: () => void) {
  listeners.add(listener);
  ensureHydration();
  return () => { listeners.delete(listener); };
}
export const getTaskStoreSnapshot = () => snapshot;
export const getTaskServerSnapshot = () => serverSnapshot;
export const retryTaskStorage = () => hydrate();
export function executeTaskCommand(command: TaskCommand) {
  if (!snapshot.workspace) throw new Error("The task demo has not loaded yet.");
  let raw: string | null;
  try { raw = window.localStorage.getItem(TASK_STORAGE_KEY); }
  catch { throw new Error("Browser storage is unavailable. No changes were saved."); }
  if (raw !== lastRaw) {
    hydrate();
    throw new Error("The demo changed in another tab. Review the latest data and try again.");
  }
  const workspace = applyTaskCommand(snapshot.workspace, command, { now: new Date().toISOString(), newId: () => crypto.randomUUID() });
  const serialized = JSON.stringify(workspace);
  try { window.localStorage.setItem(TASK_STORAGE_KEY, serialized); }
  catch {
    publish({ ...snapshot, error: "Browser storage is full or unavailable. Your last change was not saved." });
    throw new Error("Could not save to browser storage. No changes were applied.");
  }
  lastRaw = serialized;
  publish({ workspace, ready: true, error: null });
}
/** Called only after the UI's explicit reset confirmation. Other HR demo stores are untouched. */
export function resetTaskDemo() {
  const workspace = createTaskDemo();
  const serialized = JSON.stringify(workspace);
  try { window.localStorage.setItem(TASK_STORAGE_KEY, serialized); }
  catch { throw new Error("Browser storage is unavailable. The demo could not be reset."); }
  lastRaw = serialized;
  publish({ workspace, ready: true, error: null });
}
export const taskRepository: TaskRepository = { getSnapshot: () => snapshot.workspace, subscribe: subscribeTasks, execute: executeTaskCommand };
