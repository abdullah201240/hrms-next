"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
};

type SortDir = "asc" | "desc" | null;

export function DataTable<T>({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = "Search…",
  pageSize = 10,
  filters,
  selectable = false,
  emptyText = "No records found.",
  defaultSortKey,
  defaultSortDir,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (keyof T & string)[];
  searchPlaceholder?: string;
  pageSize?: number;
  filters?: ReactNode;
  selectable?: boolean;
  emptyText?: string;
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir ?? null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rowId = (row: T, i: number) =>
    String((row as { id?: string | number }).id ?? i);

  const filtered = useMemo(() => {
    let data = rows;
    if (query.trim() && searchKeys.length) {
      const q = query.toLowerCase();
      data = data.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sortKey && sortDir) {
      data = [...data].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av ?? "").localeCompare(String(bv ?? ""))
          : String(bv ?? "").localeCompare(String(av ?? ""));
      });
    }
    return data;
  }, [rows, query, sortKey, sortDir, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pageCount);
  const paged = filtered.slice((current - 1) * size, current * size);

  const colCount = columns.length + (selectable ? 1 : 0);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    }
  };

  const allOnPageSelected = paged.length > 0 && paged.every((r, i) => selected.has(rowId(r, i)));
  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paged.forEach((r, i) => next.delete(rowId(r, i)));
      else paged.forEach((r, i) => next.add(rowId(r, i)));
      return next;
    });
  };

  const align = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {searchKeys.length ? (
              <div className="relative w-full sm:w-[380px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  className="h-10 rounded-xl border-slate-200/90 bg-white pl-10 text-sm text-slate-700 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                />
              </div>
            ) : null}
            {filters}
          </div>
          <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </p>
        </div>

        <div className="w-full overflow-x-auto rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#f8fafc] hover:bg-[#f8fafc] dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                {selectable ? (
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={toggleAllOnPage}
                      aria-label="Select all on page"
                    />
                  </TableHead>
                ) : null}
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn(
                      "h-11 text-xs font-semibold text-slate-700 dark:text-slate-300",
                      align(c.align),
                      c.className
                    )}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      >
                        <span>{c.header}</span>
                        {sortKey === c.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="size-3.5 text-slate-500 dark:text-slate-300" />
                          ) : (
                            <ArrowDown className="size-3.5 text-slate-500 dark:text-slate-300" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row, i) => {
                  const id = rowId(row, i);
                  const isSel = selected.has(id);
                  return (
                    <TableRow
                      key={id}
                      data-state={isSel ? "selected" : undefined}
                      className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800/80 dark:hover:bg-slate-900/40"
                    >
                      {selectable ? (
                        <TableCell className="w-12 pl-4">
                          <Checkbox
                            checked={isSel}
                            onCheckedChange={() => toggleRow(id)}
                            aria-label="Select row"
                          />
                        </TableCell>
                      ) : null}
                      {columns.map((c) => (
                        <TableCell
                          key={c.key}
                          className={cn(
                            "py-3.5 text-sm text-slate-700 dark:text-slate-300",
                            align(c.align),
                            c.className
                          )}
                        >
                          {c.cell ? c.cell(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2 text-xs font-normal text-slate-500 dark:text-slate-400">
            <span>Rows per page:</span>
            <Select
              value={String(size)}
              onValueChange={(v) => {
                setSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:border-slate-800 dark:bg-[#121826]">
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              Page {current} of {pageCount}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg border-slate-200/80 bg-white text-slate-300 hover:text-slate-600 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:text-slate-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg border-slate-200/80 bg-white text-slate-300 hover:text-slate-600 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:text-slate-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                disabled={current >= pageCount}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
