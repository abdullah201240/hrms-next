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
};

export type Section = { title: string; desc?: string; fields: Field[] };

export type ChildTableDef = {
  title: string;
  desc?: string;
  columns: { label: string; type?: "text" | "number" | "date" }[];
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
