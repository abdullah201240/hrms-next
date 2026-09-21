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
      />
      <div className="space-y-8">
        {Object.entries(byModule).map(([module, items]) => (
          <section key={module} className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight">{module}</h2>
              <Badge variant="secondary" className="text-xs">
                {items.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">{r.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.doctype}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0" render={<Link href={`/reports/${r.slug}`} />}>
                      View
                      <ArrowRight className="size-4" />
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
