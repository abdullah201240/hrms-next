"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";
import { reports, type ReportDef } from "@/lib/mock/data-3";

const byModule = reports.reduce<Record<string, ReportDef[]>>((acc, r) => {
  (acc[r.module] ||= []).push(r);
  return acc;
}, {});

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Standard reports across every HR module."
        showExport
        exportWhat="reports"
      />
      <div className="space-y-8">
        {Object.entries(byModule).map(([module, items]) => (
          <section key={module} className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{module}</h2>
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-semibold">
                {items.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <Card key={r.id} className="rounded-xl border border-slate-200/50 bg-white transition-all hover:border-slate-300 dark:border-slate-800/40 dark:bg-[#121826] dark:hover:border-slate-700">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{r.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {r.doctype}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 shrink-0 rounded-lg text-xs font-semibold gap-1 hover:bg-slate-100 dark:hover:bg-slate-800" render={<Link href={`/reports/${r.slug}`} />}>
                      View
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
