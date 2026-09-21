"use client";

import { DocTypeForm } from "@/components/shared/crud/doctype-form";

export default function Page() {
  return <DocTypeForm doctype="/performance/cycles" mode="create" />;
}
