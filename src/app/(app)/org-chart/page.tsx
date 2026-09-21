"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { orgChart, type OrgNode } from "@/lib/mock/data-2";

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("");
}

function Node({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const children = orgChart.filter((n) => n.reportsTo === node.id);
  return (
    <div className="flex flex-col items-center gap-3">
      <Card className="min-w-52">
        <CardContent className="flex items-center gap-3 p-3">
          <Avatar className="size-9">
            <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: "#334155" }}>
              {initials(node.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-tight">{node.name}</p>
            <p className="text-xs text-muted-foreground">{node.designation}</p>
            <Badge variant="secondary" className="mt-0.5 text-[10px]">{node.directReports} direct</Badge>
          </div>
        </CardContent>
      </Card>
      {children.length > 0 && (
        <>
          <div className={`h-4 w-px bg-muted-foreground/30 ${depth === 0 ? "hidden" : ""}`} />
          <div className="flex flex-wrap items-start justify-center gap-6">
            {children.map((c) => <Node key={c.id} node={c} depth={depth + 1} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const roots = orgChart.filter((n) => !n.reportsTo);
  return (
    <>
      <PageHeader title="Organizational Chart" description="Reporting hierarchy from leadership down." />
      <div className="overflow-x-auto">
        <div className="flex min-w-max flex-col items-center gap-6 py-4">
          {roots.map((r) => <Node key={r.id} node={r} />)}
        </div>
      </div>
    </>
  );
}
