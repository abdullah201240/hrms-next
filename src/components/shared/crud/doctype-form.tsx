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
import { ChildTable } from "@/components/shared/child-table";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
      : t === "datetime"
        ? "datetime-local"
        : t === "email"
          ? "email"
          : t === "tel"
            ? "tel"
            : t === "password"
              ? "password"
              : "text";

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
  const set = (k: string, val: string) => setV((prev) => ({ ...prev, [k]: val }));

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
    const title = v[config.titleKey] || (row?.[config.titleKey] as string) || config.label;
    toast.success(mode === "create" ? `${title} created` : `${title} updated`);
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
        </div>
      );
    }
    return (
      <div key={key} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
        {label}
        <Input
          id={key}
          type={inputType(f.type)}
          value={v[key] ?? ""}
          min={f.type === "number" || f.type === "float" || f.type === "int" ? "0" : undefined}
          step={f.type === "float" ? "any" : undefined}
          onChange={(ev) => set(key, ev.target.value)}
          placeholder={f.placeholder}
        />
      </div>
    );
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href={backHref} />}>
        <ArrowLeft /> Back
      </Button>
      <PageHeader
        title={`${mode === "create" ? "New" : "Edit"} ${config.label}`}
        description={
          mode === "create"
            ? `Create a ${config.label} record — fields mirror the Frappe ${config.label} form.`
            : `Update this ${config.label} record.`
        }
      />

      <form className="space-y-6" onSubmit={submit}>
        {config.sections.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              {s.desc && <CardDescription>{s.desc}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{s.fields.map(renderField)}</div>
            </CardContent>
          </Card>
        ))}

        {config.childTables?.map((c) => (
          <ChildTable key={c.title} title={c.title} desc={c.desc} columns={c.columns} />
        ))}

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="outline" render={<Link href={backHref} />}>Cancel</Button>
          <Button type="submit">{mode === "create" ? `Create ${config.label}` : "Save Changes"}</Button>
        </div>
      </form>
    </>
  );
}
