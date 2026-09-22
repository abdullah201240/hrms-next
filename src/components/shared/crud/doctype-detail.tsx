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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CrudPrintButton } from "@/components/shared/crud/crud-print-button";
import { PageHeader } from "@/components/shared/page-header";
import { fmtDate } from "@/lib/mock/data";
import { Pencil, Plus } from "lucide-react";
import type { ChildTableDef, DoctypeConfig, Field } from "@/lib/crud/types";
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

/** Read-only view of a saved child table (e.g. the Holiday rows of a Holiday List). */
function ReadOnlyChildTable({ def, data }: { def: ChildTableDef; data: unknown }) {
  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  const colKey = (c: ChildTableDef["columns"][number]) => c.key ?? c.label;
  const valueKey = (c: ChildTableDef["columns"][number]) => {
    const k = colKey(c);
    if (def.keys) {
      if (k === def.keys.date) return "date";
      if (k === def.keys.description) return "description";
      if (k === def.keys.weeklyOff) return "weeklyOff";
      if (k === def.keys.halfDay) return "halfDay";
    }
    return k;
  };
  return (
    <Card className="lg:col-span-2 rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
      <CardHeader>
        <CardTitle className="text-base">{def.title}</CardTitle>
        {def.desc && <CardDescription>{def.desc}</CardDescription>}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  {def.columns.map((c) => (
                    <TableHead key={colKey(c)}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    {def.columns.map((c) => {
                      const v = r[valueKey(c)];
                      return (
                        <TableCell key={colKey(c)}>
                          {c.type === "check" ? (
                            <Badge variant={v ? "secondary" : "outline"}>{v ? "Yes" : "No"}</Badge>
                          ) : c.type === "date" ? (
                            v ? fmtDate(String(v)) : "—"
                          ) : (
                            v !== undefined && v !== null && v !== "" ? String(v) : "—"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DocTypeDetail({ doctype, id }: { doctype: string; id: string }) {
  const config: DoctypeConfig = getDoctype(doctype);
  const row = getRow(doctype, id) as Record<string, unknown>;
  const title = String(row[config.titleKey] ?? config.label);
  const subtitle = config.subtitleKey ? (row[config.subtitleKey] as string | undefined) : undefined;
  const statusBadge = STATUS_KEYS.has(config.titleKey) ? <StatusBadge status={title} /> : undefined;

  return (
    <>
      <PageHeader
        title={title}
        description={subtitle}
        backHref={config.route}
        backLabel={`Back to ${config.plural}`}
        badge={statusBadge}
      >
        <CrudPrintButton doctype={doctype} id={id} />
        <Button
          render={<Link href={`${config.route}/${id}/edit`} />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Pencil className="size-4" /> Edit
        </Button>
        <Button
          variant="outline"
          render={<Link href={`${config.route}/new`} />}
          className="h-10 rounded-xl border border-slate-200/50 bg-white px-3.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Plus className="size-4" /> New {config.label}
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {config.sections.map((s) => {
          const entries = s.fields
            .map((f) => ({ f, value: formatValue(f, row) }))
            .filter((e) => e.value !== undefined);
          if (!entries.length) return null;
          return (
            <Card key={s.title} className="rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
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
        {(config.childTables ?? []).map((t) => (
          <ReadOnlyChildTable key={t.title} def={t} data={t.rowsKey ? row[t.rowsKey] : undefined} />
        ))}
      </div>
    </>
  );
}
