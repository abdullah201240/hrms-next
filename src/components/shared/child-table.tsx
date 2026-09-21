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
import { Plus, Trash2 } from "lucide-react";

export type ChildColumn = {
  label: string;
  type?: "text" | "number" | "date";
};

/**
 * Repeatable child-table mirroring Frappe's child-doctype grids
 * (Earnings / Deductions / Time Logs, etc.). Rows are held locally and only
 * "saved" with the parent form.
 */
export function ChildTable({
  title,
  desc,
  columns,
}: {
  title: string;
  desc?: string;
  columns: ChildColumn[];
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const addRow = () => setRows((r) => [...r, Object.fromEntries(columns.map((c) => [c.label, ""]))]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, x) => x !== i));
  const setCell = (i: number, c: string, val: string) =>
    setRows((r) => r.map((row, x) => (x === i ? { ...row, [c]: val } : row)));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {desc && <CardDescription>{desc}</CardDescription>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus /> Add Row
        </Button>
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
                    <th key={c.label} className="py-2 pr-3 font-medium">{c.label}</th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-1 text-muted-foreground">{i + 1}</td>
                    {columns.map((c) => (
                      <td key={c.label} className="py-1 pr-3">
                        <Input
                          value={row[c.label] ?? ""}
                          type={c.type ?? "text"}
                          min={c.type === "number" ? "0" : undefined}
                          step={c.type === "number" ? "any" : undefined}
                          onChange={(e) => setCell(i, c.label, e.target.value)}
                        />
                      </td>
                    ))}
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
      </CardContent>
    </Card>
  );
}
