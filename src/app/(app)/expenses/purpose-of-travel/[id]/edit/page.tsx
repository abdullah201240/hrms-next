"use client";

import { DocTypeForm } from "@/components/shared/crud/doctype-form";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocTypeForm doctype="/expenses/purpose-of-travel" mode="edit" id={id} />;
}
