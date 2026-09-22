"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { addWeeklyOffHolidays, sortHolidayRows, totalHolidays, type HolidayRow } from "@/lib/holidays";
import type { ChildTableDef } from "@/lib/crud/types";

/** One row of a child table — every cell is a string, mirrors the form state. */
export type ChildRow = Record<string, string>;

/** Row column with its effective property name. */
const colKey = (c: ChildTableDef["columns"][number]) => c.key ?? c.label;

/** "true"/true/1 → boolean, the way the parent form stores checkbox state. */
export const isOn = (v: string | undefined) => v === "true" || v === "1" || v === "Yes";

/** Child rows → the `Holiday` shape the domain helpers work on. */
export function toHolidayRows(rows: ChildRow[], keys: ChildTableDef["keys"] = {}): HolidayRow[] {
  const dateKey = keys.date ?? "Date";
  const descKey = keys.description ?? "Description";
  const offKey = keys.weeklyOff ?? "Weekly Off";
  const halfKey = keys.halfDay ?? "Half Day";
  return rows.map((r) => ({
    date: r[dateKey] ?? "",
    description: r[descKey] ?? "",
    weeklyOff: isOn(r[offKey]),
    halfDay: isOn(r[halfKey]),
  }));
}

/** `Holiday` rows → child-table rows (used to prefill the form from a record). */
export function fromHolidayRows(rows: HolidayRow[], keys: ChildTableDef["keys"] = {}): ChildRow[] {
  const dateKey = keys.date ?? "Date";
  const descKey = keys.description ?? "Description";
  const offKey = keys.weeklyOff ?? "Weekly Off";
  const halfKey = keys.halfDay ?? "Half Day";
  return sortHolidayRows(rows).map((h) => ({
    [dateKey]: h.date,
    [descKey]: h.description,
    [offKey]: String(h.weeklyOff),
    [halfKey]: String(h.halfDay),
  }));
}

/** Live row total — `update_total_holidays`: half rows weigh 0.5. */
export function childTotal(rows: ChildRow[], t: ChildTableDef): number {
  if (!t.computeTotal) return 0;
  if (t.keys?.halfDay) return totalHolidays(toHolidayRows(rows, t.keys));
  return rows.length;
}

/**
 * Repeatable child-table mirroring Frappe's child-doctype grids
 * (Earnings / Deductions / Holidays). Rows can be uncontrolled (the default for
 * blank create forms) or driven by the parent so an Edit form can prefill from the
 * record and a Detail page can render saved rows.
 */
export function ChildTable({
  title,
  desc,
  columns,
  def,
  value,
  onChange,
  fieldValues,
  onFieldChange,
  compact,
}: {
  title: string;
  desc?: string;
  columns: ChildTableDef["columns"];
  /** Full definition — supplies the row generator, total and validation hints. */
  def?: ChildTableDef;
  /** Controlled rows. Omit to keep rows locally (classic blank create form). */
  value?: ChildRow[];
  onChange?: (rows: ChildRow[]) => void;
  /** Parent form field values — a row generator reads From/To/Weekly Off from here. */
  fieldValues?: Record<string, string>;
  /** Lets a row generator write back (e.g. the recomputed Total Holidays). */
  onFieldChange?: (key: string, val: string) => void;
  compact?: boolean;
}) {
  const [inner, setInner] = useState<ChildRow[]>([]);
  const rows = value ?? inner;
  const commit = (next: ChildRow[]) => (onChange ? onChange(next) : setInner(next));
  const blank = () => Object.fromEntries(columns.map((c) => [colKey(c), c.type === "check" ? "false" : ""])) as ChildRow;
  const addRow = () => commit([...rows, blank()]);
  const removeRow = (i: number) => commit(rows.filter((_, x) => x !== i));
  const setCell = (i: number, key: string, val: string) =>
    commit(rows.map((row, x) => (x === i ? { ...row, [key]: val } : row)));

  /** `HolidayList.get_weekly_off_dates` — append weekly offs that are not listed yet. */
  const runFill = () => {
    if (!def?.fill || !fieldValues) return;
    const f = def.fill;
    const halfKey = def.keys?.halfDay ?? "Half Day";
    const dateKey = def.keys?.date ?? "Date";
    const descKey = def.keys?.description ?? "Description";
    const offKey = def.keys?.weeklyOff ?? "Weekly Off";
    const generated = addWeeklyOffHolidays(toHolidayRows(rows, def.keys), {
      from: fieldValues[f.fromKey] ?? "",
      to: fieldValues[f.toKey] ?? "",
      weeklyOff: fieldValues[f.dayKey] ?? "",
      halfDay: f.halfDayKey ? isOn(fieldValues[f.halfDayKey]) : false,
    });
    commit(
      generated.map((h) => ({
        ...blank(),
        [dateKey]: h.date,
        [descKey]: h.description,
        [offKey]: String(h.weeklyOff),
        [halfKey]: String(h.halfDay),
      })),
    );
  };

  const clearRows = () => commit([]);

  const total = def?.computeTotal ? childTotal(rows, def) : undefined;

  return (
    <Card>
      <CardHeader className={compact ? "py-3" : undefined}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {desc && <CardDescription>{desc}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {def?.fill && (
              <Button type="button" variant="outline" size="sm" onClick={runFill}>
                <Wand2 /> {def.fill.label}
              </Button>
            )}
            {def?.fill?.clearLabel && (
              <Button type="button" variant="ghost" size="sm" onClick={clearRows}>
                {def.fill.clearLabel}
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus /> Add Row
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="w-8 py-2 font-medium">#</th>
                  {columns.map((c) => (
                    <th key={colKey(c)} className="py-2 pr-3 font-medium">
                      {c.req ? `${c.label} *` : c.label}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-1 text-muted-foreground">{i + 1}</td>
                    {columns.map((c) => {
                      const key = colKey(c);
                      return (
                        <td key={key} className="py-1 pr-3">
                          {c.type === "check" ? (
                            <div className="flex items-center gap-2 pt-1.5">
                              <Checkbox
                                id={`${title}-${i}-${key}`}
                                checked={isOn(row[key])}
                                onCheckedChange={(ck) => setCell(i, key, ck === true ? "true" : "false")}
                              />
                              <span className="text-xs text-muted-foreground">{row[key] === "true" ? "Yes" : "No"}</span>
                            </div>
                          ) : (
                            <Input
                              value={row[key] ?? ""}
                              type={c.type ?? "text"}
                              min={c.type === "number" ? "0" : undefined}
                              step={c.type === "number" ? "any" : undefined}
                              onChange={(e) => setCell(i, key, e.target.value)}
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="py-1">
                      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => removeRow(i)}>
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total !== undefined && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {rows.length} {rows.length === 1 ? "entry" : "entries"}
              {def?.fill ? ` · weekly offs generated up to ${fieldValues?.[def.fill.toKey] ?? "—"}` : ""}
            </span>
            <span className="font-medium tabular-nums">Total: {total}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
