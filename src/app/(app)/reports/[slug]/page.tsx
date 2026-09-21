import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
import { Download, ArrowLeft, CalendarRange } from "lucide-react";
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
      <PageHeader title={report.name} description={`Report · ${report.module}`}>
        <Button render={<Link href="/reports" />} variant="outline">
          <ArrowLeft className="size-4" />
          All Reports
        </Button>
        <Button>
          <Download className="size-4" />
          Export
        </Button>
      </PageHeader>

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-end gap-4 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="size-4" />
            Filters
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from">From Date</Label>
            <Input id="from" type="date" defaultValue="2026-01-01" className="w-44" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To Date</Label>
            <Input id="to" type="date" defaultValue="2026-12-31" className="w-44" />
          </div>
          <Badge variant="secondary">Source: {report.doctype}</Badge>
        </CardContent>
      </Card>

      <div className="w-full overflow-x-auto">
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
