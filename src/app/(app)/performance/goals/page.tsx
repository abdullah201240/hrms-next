"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { goals, fmtDate, fmtMoney, type Goal } from "@/lib/mock/data";
import { Plus } from "lucide-react";

const progress = (g: Goal) => Math.min(100, Math.round((g.current / g.target) * 100));
const fmtVal = (n: number, unit: string) => (unit === "BDT" ? fmtMoney(n) : `${n.toLocaleString()} ${unit}`);

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        title="Goals"
        description={`${goals.length} active performance goals.`}
        showExport
        exportWhat="goals"
      >
        <Button
          render={<Link href="/performance/goals/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Goal
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-medium leading-tight">{g.title}</p>
                  <p className="text-sm text-muted-foreground">{g.employeeName} · {g.department}</p>
                </div>
                <StatusBadge status={g.status} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{g.kpi}</span>
                  <span className="tabular-nums font-medium">{fmtVal(g.current, g.unit)} / {fmtVal(g.target, g.unit)}</span>
                </div>
                <Progress value={progress(g)} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">Due {fmtDate(g.dueOn)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
