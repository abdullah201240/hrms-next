"use client";

import { DocTypeForm } from "@/components/shared/crud/doctype-form";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocTypeForm doctype="/recruitment/interview-rounds" mode="edit" id={id} />;
}
