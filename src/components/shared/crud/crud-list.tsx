"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CrudPrintButton } from "@/components/shared/crud/crud-print-button";
import { fmtDate } from "@/lib/mock/data";
import { Plus } from "lucide-react";
import { getDoctype } from "@/lib/crud/registry";

type Row = Record<string, unknown>;

const STATUS_KEYS = new Set(["status", "docStatus", "state", "approvalStatus", "transactionStatus", "attendanceStatus", "result"]);

/** Default cell rendering for a column when no custom renderer is supplied. */
function defaultCell(row: Row, col: { key: string }) {
  const val = row[col.key];
  if (val === undefined || val === null || val === "") return "—";
  if (typeof val === "boolean") return <Badge variant={val ? "secondary" : "outline"}>{val ? "Yes" : "No"}</Badge>;
  if (STATUS_KEYS.has(col.key)) return <StatusBadge status={String(val)} />;
  if (/date$|Date$|from$|to$|From$|To$/i.test(col.key) && /^\d{4}-\d{2}-\d{2}/.test(String(val)))
    return fmtDate(String(val));
  return String(val);
}

export function CrudList({ doctype }: { doctype: string }) {
  const config = getDoctype(doctype);
  const idKey = config.idKey ?? "id";
  const linkKey = config.linkKey ?? config.titleKey;

  const columns: Column<Row>[] = config.columns.map((c) => ({
    key: c.key,
    header: c.header,
    sortable: c.sortable,
    align: c.align,
    cell: (row: Row) => {
      const inner = c.render ? c.render(row) : defaultCell(row, c);
      if (c.key === linkKey) {
        return (
          <Link href={`${config.route}/${String(row[idKey])}`} className="font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400">
            {inner as React.ReactNode}
          </Link>
        );
      }
      return inner;
    },
  }));

  // Frappe parity: every list row's menu carries a Print action using that
  // DocType's print format(s). Appended as a trailing icon-only column.
  columns.push({
    key: "__print",
    header: "",
    align: "right",
    cell: (row: Row) => (
      <CrudPrintButton doctype={doctype} id={String(row[idKey])} variant="ghost" size="sm" label={null} />
    ),
  });

  return (
    <>
      <PageHeader
        title={config.plural}
        description={config.desc}
        showExport
        exportWhat={config.plural.toLowerCase()}
      >
        <Button
          render={<Link href={`${config.route}/new`} />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New {config.label}
        </Button>
      </PageHeader>
      <DataTable columns={columns} rows={config.rows} searchKeys={config.searchKeys} pageSize={10} />
    </>
  );
}
