"use client";

import { useTaskNotifications } from "@/hooks/use-task-workspace";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, CheckCheck } from "lucide-react";

/** Header notifications control: a bell with an unread-count badge that opens a
 *  dropdown of recent notifications and links to the full /notifications page.
 *  Read state is tracked locally for the session (UI-only, mirrors the page). */
export function NavNotifications() {
  const { notifications, unread, ready, error, markRead, formatWhen } = useTaskNotifications();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative size-9 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Bell className="size-4 text-slate-600 dark:text-slate-400" />
            {unread.length > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold leading-none text-white shadow-xs">
                {unread.length}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-84 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-[#121826] dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
            {unread.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                {unread.length} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markRead(unread.map((n) => n.id))}
            disabled={unread.length === 0}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {!ready && <p className="p-4 text-xs text-muted-foreground">Loading notifications…</p>}
          {error && <p role="alert" className="p-4 text-xs text-destructive">Demo storage is unavailable. Open Tasks to retry.</p>}
          {ready && !error && !notifications.length && <p className="p-4 text-xs text-muted-foreground">No notifications for this demo employee.</p>}
          {notifications.map((n) => {
            const isRead = n.read;
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => !n.read && markRead([n.id])}
                className={`flex items-start gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted ${
                  !isRead ? "bg-muted/50" : ""
                }`}
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    isRead ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p
                    className={`text-sm ${
                      isRead
                        ? "font-medium text-muted-foreground"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {n.from} · {formatWhen(n.when)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2.5 text-center">
          <Link
            href="/notifications"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
