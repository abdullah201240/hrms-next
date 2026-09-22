"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { executeTaskCommand, getTaskServerSnapshot, getTaskStoreSnapshot, subscribeTasks } from "@/lib/tasks/store";
import type { TaskCommand } from "@/lib/tasks/types";
import { formatTaskDate } from "@/lib/tasks/domain";

export function useTaskWorkspace() { return useSyncExternalStore(subscribeTasks, getTaskStoreSnapshot, getTaskServerSnapshot); }
export function runTaskCommand(command: TaskCommand, message?: string): boolean {
  try {
    executeTaskCommand(command);
    if (message) toast.success(message);
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "The change could not be saved.");
    return false;
  }
}
export function useTaskNotifications() {
  const { workspace, ready, error } = useTaskWorkspace();
  const notifications = workspace?.notifications.filter((item) => item.recipientId === workspace.actorId) ?? [];
  return {
    notifications,
    unread: notifications.filter((item) => !item.read),
    ready,
    error,
    markRead: (ids: string[]) => runTaskCommand({ kind: "read-notifications", ids }),
    formatWhen: (value: string) => Number.isFinite(Date.parse(value)) ? formatTaskDate(value, workspace?.timezone ?? "Asia/Dhaka", true) : value,
  };
}
export function useTaskClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
export function useUnsavedTaskForm(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a[href]");
      if (!anchor || event.defaultPrevented || anchor.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm("Leave this page and discard your unsaved changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", click, true); };
  }, [dirty]);
}
