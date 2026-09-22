import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarRange } from "lucide-react";
import { reportBySlug, reportRows } from "@/lib/mock/data-3";

export default async function ReportViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = reportBySlug(slug);
  if (!report) notFound();

  const rows = reportRows(report);

  return (
    <>
      <PageHeader
        title={report.name}
        description={`Report · ${report.module}`}
        backHref="/reports"
        backLabel="All Reports"
        showExport
        exportWhat={report.name.toLowerCase()}
      />

      <Card className="mb-5 rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
        <CardContent className="flex flex-wrap items-end gap-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <CalendarRange className="size-4 text-blue-600 dark:text-blue-400" />
            Filters
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs font-semibold text-slate-600 dark:text-slate-300">From Date</Label>
            <Input id="from" type="date" defaultValue="2026-01-01" className="h-9 w-44 rounded-lg border-slate-200 dark:border-slate-700" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs font-semibold text-slate-600 dark:text-slate-300">To Date</Label>
            <Input id="to" type="date" defaultValue="2026-12-31" className="h-9 w-44 rounded-lg border-slate-200 dark:border-slate-700" />
          </div>
          <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-medium">Source: {report.doctype}</Badge>
        </CardContent>
      </Card>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {report.columns.map((c) => (
                <TableHead key={c} className="font-medium">
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j} className={j === 0 ? "font-medium" : undefined}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Showing a preview of {rows.length} rows · {report.module}. Sample data for UI review only.
      </p>
    </>
  );
}
