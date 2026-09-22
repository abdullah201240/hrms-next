// ============================================================================
// Leave Application client store. The rest of the app is UI-only mock (creates
// just toast), but Leave Applications are the one flow that has a real self
// service "add" screen (/leave/apply) whose result the user expects to see in
// the /leave list. This module holds that in-memory list; it survives client
// navigation (SPA) and is seeded from the static mock so first paint matches.
// ============================================================================
import { leaveApplications, type LeaveApplication } from "./data";

let apps: LeaveApplication[] = [...leaveApplications];
const listeners = new Set<() => void>();

/** Current snapshot — used by `useSyncExternalStore` (server + client). */
export function getLeaveApplications(): LeaveApplication[] {
  return apps;
}

export function subscribeLeaveApplications(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Prepend a newly created application and notify subscribers. */
export function addLeaveApplication(app: LeaveApplication): void {
  apps = [app, ...apps];
  for (const l of listeners) l();
}
