"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchSelect } from "@/components/shared/search-select";
import { ChildTable, childTotal, fromHolidayRows, toHolidayRows, type ChildRow } from "@/components/shared/child-table";
import { validateHolidayList } from "@/lib/holidays";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import type { DoctypeConfig, Field } from "@/lib/crud/types";
import { getDoctype } from "@/lib/crud/registry";

/** Build the initial form values — pre-fills from the record on Edit. */
function initValues(config: DoctypeConfig, row?: Record<string, unknown>) {
  const v: Record<string, string> = {};
  if (row) {
    for (const s of config.sections) {
      for (const f of s.fields) {
        const val = row[f.key];
        if (val === undefined || val === null) continue;
        v[f.key] = typeof val === "boolean" ? (val ? "true" : "false") : String(val);
      }
    }
  }
  return v;
}

const inputType = (t: Field["type"]) =>
  t === "number" || t === "float" || t === "int"
    ? "number"
    : t === "date"
      ? "date"
      : t === "time"
        ? "time"
        : t === "datetime"
          ? "datetime-local"
          : t === "email"
            ? "email"
            : t === "tel"
              ? "tel"
              : t === "password"
                ? "password"
                : "text";

/** Prefill child tables from the saved record (rows are stored on the row object). */
function initChildRows(config: DoctypeConfig, row?: Record<string, unknown>): Record<string, ChildRow[]> {
  const out: Record<string, ChildRow[]> = {};
  if (!row) return out;
  for (const t of config.childTables ?? []) {
    if (!t.rowsKey) continue;
    const raw = row[t.rowsKey];
    if (!Array.isArray(raw)) continue;
    out[t.title] = t.keys?.date
      ? fromHolidayRows(raw as never, t.keys)
      : (raw as Record<string, unknown>[]).map((r) =>
          Object.fromEntries(
            t.columns.map((c) => {
              const key = c.key ?? c.label;
              const val = r[key];
              return [key, val === undefined || val === null ? "" : typeof val === "boolean" ? String(val) : String(val)];
            }),
          ),
        );
  }
  return out;
}

export function DocTypeForm({
  doctype,
  mode,
  id,
}: {
  doctype: string;
  mode: "create" | "edit";
  id?: string;
}) {
  const config = getDoctype(doctype);
  const row =
    mode === "edit" && id
      ? config.rows.find((r) => String(r[config.idKey ?? "id"]) === id)
      : undefined;
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(() => initValues(config, row));
  const [child, setChild] = useState<Record<string, ChildRow[]>>(() => initChildRows(config, row));
  const set = (k: string, val: string) => setV((prev) => ({ ...prev, [k]: val }));

  const tables = config.childTables ?? [];
  /** Read-only parent fields derived from child rows — Frappe's `update_total_holidays`. */
  const computed: Record<string, string> = {};
  for (const t of tables) {
    if (t.computeTotal) computed[t.computeTotal] = String(childTotal(child[t.title] ?? [], t));
  }

  const required =
    config.required ??
    config.sections.flatMap((s) => s.fields.filter((f) => f.req).map((f) => ({ key: f.key, label: f.label })));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = required.filter((r) => !v[r.key]?.trim()).map((r) => r.label);
    if (missing.length) {
      toast.error(`Missing required: ${missing.join(", ")}`);
      return;
    }
    // Child-table rules run on the live rows, exactly like the doctype's validate().
    for (const t of tables) {
      if (t.validate !== "holidayList") continue;
      const errors = validateHolidayList({ from: v[t.fill?.fromKey ?? ""] ?? "", to: v[t.fill?.toKey ?? ""] ?? "", rows: toHolidayRows(child[t.title] ?? [], t.keys) });
      if (errors.length) {
        toast.error(errors[0]);
        return;
      }
    }
    const title = v[config.titleKey] || (row?.[config.titleKey] as string) || config.label;
    const rowsIn = tables.reduce((n: number, t) => n + (child[t.title]?.length ?? 0), 0);
    toast.success(`${title} ${mode === "create" ? "created" : "updated"}${rowsIn ? ` · ${rowsIn} row${rowsIn === 1 ? "" : "s"}` : ""}`);
    router.push(config.route);
  };

  const backHref = mode === "edit" && id ? `${config.route}/${id}` : config.route;

  const renderField = (f: Field) => {
    const key = f.key;
    const label = (
      <Label htmlFor={key} className={f.req ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
        {f.label}
      </Label>
    );
    const help = f.help ? <p className="text-xs text-muted-foreground">{f.help}</p> : null;
    if (f.type === "check") {
      return (
        <div key={key} className="flex items-center gap-2 pt-6">
          <Checkbox
            id={key}
            checked={v[key] === "true"}
            onCheckedChange={(c) => set(key, c === true ? "true" : "false")}
          />
          <label htmlFor={key} className="text-sm leading-none">{f.label}</label>
        </div>
      );
    }
    if (f.type === "select" || f.type === "link") {
      const cur = v[key];
      const base = f.options ?? [];
      const opts = cur && !base.includes(cur) ? [...base, cur] : base;
      return (
        <div key={key} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
          {label}
          <SearchSelect
            id={key}
            value={cur ?? ""}
            onChange={(val) => set(key, val)}
            options={opts}
            placeholder={`Search ${f.label.toLowerCase()}\u2026`}
            addLabel={f.addLabel ?? (f.type === "link" ? f.options?.[0] : undefined)}
          />
        </div>
      );
    }
    if (f.type === "long") {
      return (
        <div key={key} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
          {label}
          <Textarea id={key} rows={3} value={v[key] ?? ""} onChange={(ev) => set(key, ev.target.value)} placeholder={f.placeholder} />
          {help}
        </div>
      );
    }
    return (
      <div key={key} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
        {label}
        <Input
          id={key}
          type={inputType(f.type)}
          value={f.ro ? (computed[key] ?? v[key] ?? "") : (v[key] ?? "")}
          readOnly={f.ro}
          min={f.type === "number" || f.type === "float" || f.type === "int" ? "0" : undefined}
          step={f.type === "float" ? "any" : undefined}
          onChange={(ev) => !f.ro && set(key, ev.target.value)}
          placeholder={f.placeholder}
          className={f.ro ? "bg-muted text-muted-foreground" : undefined}
        />
        {help}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title={`${mode === "create" ? "New" : "Edit"} ${config.label}`}
        description={
          mode === "create"
            ? `Create a ${config.label} record — fields mirror the Frappe ${config.label} form.`
            : `Update this ${config.label} record.`
        }
        backHref={backHref}
        backLabel="Back"
      />

      <form className="space-y-6" onSubmit={submit}>
        {config.sections.map((s) => (
          <Card key={s.title} className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              {s.desc && <CardDescription>{s.desc}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{s.fields.map(renderField)}</div>
            </CardContent>
          </Card>
        ))}

        {tables.map((c) => (
          <ChildTable
            key={c.title}
            title={c.title}
            desc={c.desc}
            columns={c.columns}
            def={c}
            value={child[c.title] ?? []}
            onChange={(rows) => setChild((prev) => ({ ...prev, [c.title]: rows }))}
            fieldValues={v}
            onFieldChange={set}
          />
        ))}

        <div className="flex justify-end gap-2.5 pb-8">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border border-slate-200/90 bg-white px-4 font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
            render={<Link href={backHref} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {mode === "create" ? `Create ${config.label}` : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
