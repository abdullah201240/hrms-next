import type { ReactNode } from "react";

/** Control types the generic engine knows how to render. */
export type FieldType =
  | "text"
  | "data"
  | "long"
  | "select"
  | "link"
  | "check"
  | "date"
  | "time"
  | "datetime"
  | "number"
  | "float"
  | "int"
  | "email"
  | "tel"
  | "password";

export type Field = {
  /** State key — also the mock record property used for prefill/detail mapping. */
  key: string;
  label: string;
  type: FieldType;
  /** Literal options for `select`, or the linked doctype name for `link`. */
  options?: readonly string[];
  req?: boolean;
  full?: boolean;
  placeholder?: string;
  /** For `link` fields: enables the "+ Add {addLabel}" quick-create. */
  addLabel?: string;
  /** Read-only (Frappe's `read_only`) — value comes from `computed`, not the record. */
  ro?: boolean;
  /** Field-level help text (Frappe's `description`). */
  help?: string;
};

export type Section = { title: string; desc?: string; fields: Field[] };

/** One column of a child table; `key` doubles as the row property (defaults to `label`). */
export type ChildColumn = {
  label: string;
  key?: string;
  type?: "text" | "number" | "date" | "time" | "check";
  req?: boolean;
};

export type ChildTableDef = {
  title: string;
  desc?: string;
  columns: ChildColumn[];
  /** Record property holding this table's rows — enables prefill on Edit and rendering on Detail. */
  rowsKey?: string;
  /** Row properties that carry the values the domain logic needs (`Holiday` child doctype shape). */
  keys?: { date?: string; description?: string; weeklyOff?: string; halfDay?: string };
  /** Declarative row generator — Frappe's Holiday List "Add to Holidays" / "Clear Table" buttons. */
  fill?: { label: string; fromKey: string; toKey: string; dayKey: string; halfDayKey?: string; clearLabel?: string };
  /** Validator run before submit; `holidayList` = erpnext `validate_days` + `validate_duplicate_date`. */
  validate?: "holidayList";
  /** Parent field key that shows the live row total (`update_total_holidays`). */
  computeTotal?: string;
};

export type ListCol = {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** Custom cell renderer. Falls back to the raw value (formatted by type). */
  render?: (row: any) => ReactNode;
};

export type DoctypeConfig = {
  /** Route prefix, e.g. "/leave/types". Also the registry key. */
  route: string;
  label: string; // singular — "Leave Type"
  plural: string; // "Leave Types"
  desc?: string; // list page description
  rows: any[]; // mock collection backing this doctype
  idKey?: string; // default "id"
  titleKey: string; // primary display field
  subtitleKey?: string; // secondary line under the title (detail + row)
  /** Which column links to the detail page (defaults to titleKey). */
  linkKey?: string;
  searchKeys?: string[];
  columns: ListCol[]; // list table columns
  sections: Section[]; // New/Edit form sections (cloned from the doctype)
  required?: { key: string; label: string }[]; // defaults to req fields in sections
  childTables?: ChildTableDef[];
};
