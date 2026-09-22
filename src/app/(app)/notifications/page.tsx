"use client";

import Link from "next/link";
import { useTaskNotifications } from "@/hooks/use-task-workspace";
import { TaskBoundary } from "@/components/tasks/task-shared";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  return <TaskBoundary>{() => <NotificationList />}</TaskBoundary>;
}
function NotificationList() {
  const { notifications, unread, markRead, formatWhen } = useTaskNotifications();

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread.length} unread · Demo updates about tasks, leave, salary, and requests.`}
      >
        <Button
          variant="outline"
          className="h-10 gap-2 rounded-xl border border-slate-200/50 bg-white px-3.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={() => markRead(unread.map((n) => n.id))}
          disabled={unread.length === 0}
        >
          <CheckCheck className="size-4" />
          Mark all read
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {!notifications.length && <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No notifications for this demo employee.</CardContent></Card>}
        {notifications.map((n) => {
          const isRead = n.read;
          return (
            <Card
              key={n.id}
              className={`rounded-2xl border transition-colors ${
                !isRead
                  ? "border-blue-200/80 bg-blue-50/20 dark:border-blue-900/40 dark:bg-blue-950/20"
                  : "border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                    !isRead
                      ? "border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-400"
                      : "border-slate-200/50 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
                  }`}
                >
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={n.href} onClick={() => !n.read && markRead([n.id])} className="text-sm font-semibold text-slate-900 hover:text-primary dark:text-slate-100">{n.title}</Link>
                    {!isRead && (
                      <Badge variant="secondary" className="rounded-full bg-blue-50 px-2 py-0 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{n.body}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {n.docType} · {n.from} · {formatWhen(n.when)}
                  </p>
                </div>
                {!isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead([n.id])}
                    className="shrink-0 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
