"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notifications as seed } from "@/lib/mock/data-4";
import { Bell, CheckCheck } from "lucide-react";

/** Header notifications control: a bell with an unread-count badge that opens a
 *  dropdown of recent notifications and links to the full /notifications page.
 *  Read state is tracked locally for the session (UI-only, mirrors the page). */
export function NavNotifications() {
  const [readIds, setReadIds] = useState<string[]>(
    seed.filter((n) => n.read).map((n) => n.id),
  );
  const unread = seed.filter((n) => !readIds.includes(n.id));

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative size-9"
          >
            <Bell className="size-5" />
            {unread.length > 0 && (
              <span className="pill absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                {unread.length}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unread.length > 0 && (
              <span className="pill bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unread.length} new
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setReadIds(seed.map((n) => n.id))}
            disabled={unread.length === 0}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {seed.map((n) => {
            const isRead = readIds.includes(n.id);
            return (
              <Link
                key={n.id}
                href="/notifications"
                onClick={() => setReadIds((r) => (r.includes(n.id) ? r : [...r, n.id]))}
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
                    {n.from} · {n.when}
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
