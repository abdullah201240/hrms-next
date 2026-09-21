import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CrudPrintButton } from "@/components/shared/crud/crud-print-button";
import { fmtDate } from "@/lib/mock/data";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import type { DoctypeConfig, Field } from "@/lib/crud/types";
import { getDoctype, getRow } from "@/lib/crud/registry";

/** Keys whose values are rendered with the shared status pill. */
const STATUS_KEYS = new Set(["status", "docStatus", "state", "approvalStatus", "transactionStatus", "attendanceStatus", "result", "cycleStatus", "templateType"]);

function formatValue(f: Field, row: Record<string, unknown>) {
  const val = row[f.key];
  if (val === undefined || val === null || val === "") return undefined;
  if (f.type === "check") {
    const on = val === true || val === "true" || val === 1 || val === "1" || val === "Yes";
    return <Badge variant={on ? "secondary" : "outline"}>{on ? "Yes" : "No"}</Badge>;
  }
  if (f.type === "date") return fmtDate(String(val));
  if (f.type === "datetime") return fmtDate(String(val));
  if (STATUS_KEYS.has(f.key)) return <StatusBadge status={String(val)} />;
  return String(val);
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? <span className="font-normal text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export function DocTypeDetail({ doctype, id }: { doctype: string; id: string }) {
  const config: DoctypeConfig = getDoctype(doctype);
  const row = getRow(doctype, id) as Record<string, unknown>;
  const title = String(row[config.titleKey] ?? config.label);
  const subtitle = config.subtitleKey ? (row[config.subtitleKey] as string | undefined) : undefined;

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href={config.route} />}>
        <ArrowLeft /> Back to {config.plural}
      </Button>

      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {STATUS_KEYS.has(config.titleKey) && <StatusBadge status={title} />}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <CrudPrintButton doctype={doctype} id={id} />
          <Button render={<Link href={`${config.route}/${id}/edit`} />}>
            <Pencil /> Edit
          </Button>
          <Button variant="outline" render={<Link href={`${config.route}/new`} />}>
            <Plus /> New {config.label}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {config.sections.map((s) => {
          const entries = s.fields
            .map((f) => ({ f, value: formatValue(f, row) }))
            .filter((e) => e.value !== undefined);
          if (!entries.length) return null;
          return (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
                {s.desc && <CardDescription>{s.desc}</CardDescription>}
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                  {entries.map(({ f, value }) => (
                    <Detail key={f.key} label={f.label} value={value} />
                  ))}
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
