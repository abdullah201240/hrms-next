"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { notifications as seed } from "@/lib/mock/data-4";

export default function NotificationsPage() {
  const [readIds, setReadIds] = useState<string[]>(
    seed.filter((n) => n.read).map((n) => n.id),
  );
  const unread = seed.filter((n) => !readIds.includes(n.id));

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about your leave, salary, claims and requests."
      >
        <Button
          variant="outline"
          onClick={() => setReadIds(seed.map((n) => n.id))}
          disabled={unread.length === 0}
        >
          <CheckCheck className="size-4" />
          Mark all read
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {seed.map((n) => {
          const isRead = readIds.includes(n.id);
          return (
            <Card key={n.id} className={!isRead ? "bg-muted/40" : undefined}>
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center ${
                    isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!isRead && <Badge variant="secondary" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.docType} · {n.from} · {n.when}
                  </p>
                </div>
                {!isRead && (
                  <button
                    type="button"
                    onClick={() => setReadIds((r) => [...r, n.id])}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
