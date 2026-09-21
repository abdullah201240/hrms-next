import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Generates list + New + Detail + Edit routes for every doctype registered in
 * src/lib/crud/registry.ts. Route keys are scraped from the `route: "/..."`
 * fields so this stays plain Node (no TS execution).
 *
 *   node scripts/scaffold-crud.mjs            # create missing sub-routes only
 *   node scripts/scaffold-crud.mjs --rewrite  # also overwrite existing list pages
 */
const APP = join(process.cwd(), "src/app/(app)");
let registry = readFileSync(join(process.cwd(), "src/lib/crud/registry.ts"), "utf8");
try {
  registry += readFileSync(join(process.cwd(), "src/lib/crud/registry.auto.ts"), "utf8");
} catch {
  /* auto registry not generated yet */
}
const routes = [...new Set([...registry.matchAll(/route:\s*"\/[^"]*"/g)].map((m) =>
  m[0].replace(/route:\s*"/, "").replace(/"$/, ""),
))];
const rewrite = process.argv.includes("--rewrite");

const write = (rel, content) => {
  const full = join(APP, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return rel;
};

let made = 0;
for (const route of routes) {
  const seg = route.replace(/^\//, ""); // leave/types
  const key = route; // registry key == route

  // New
  const newFile = `${seg}/new/page.tsx`;
  if (!existsSync(join(APP, newFile))) {
    write(newFile, `"use client";

import { DocTypeForm } from "@/components/shared/crud/doctype-form";

export default function Page() {
  return <DocTypeForm doctype="${key}" mode="create" />;
}
`);
    made++;
  }

  // Detail
  const detailFile = `${seg}/[id]/page.tsx`;
  if (!existsSync(join(APP, detailFile))) {
    write(detailFile, `import { notFound } from "next/navigation";
import { DocTypeDetail } from "@/components/shared/crud/doctype-detail";
import { getRow } from "@/lib/crud/registry";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRow("${key}", id)) notFound();
  return <DocTypeDetail doctype="${key}" id={id} />;
}
`);
    made++;
  }

  // Edit
  const editFile = `${seg}/[id]/edit/page.tsx`;
  if (!existsSync(join(APP, editFile))) {
    write(editFile, `"use client";

import { DocTypeForm } from "@/components/shared/crud/doctype-form";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocTypeForm doctype="${key}" mode="edit" id={id} />;
}
`);
    made++;
  }

  // List page (opt-in overwrite of simple master lists)
  const listFile = `${seg}/page.tsx`;
  if (rewrite || !existsSync(join(APP, listFile))) {
    write(listFile, `"use client";

import { CrudList } from "@/components/shared/crud/crud-list";

export default function Page() {
  return <CrudList doctype="${key}" />;
}
`);
    made++;
  }
}

console.log(`Scaffolded/updated ${made} file(s) across ${routes.length} registered doctypes.`);
