import { notFound } from "next/navigation";
import { DocTypeDetail } from "@/components/shared/crud/doctype-detail";
import { getRow } from "@/lib/crud/registry";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRow("/leave/policy-assignments", id)) notFound();
  return <DocTypeDetail doctype="/leave/policy-assignments" id={id} />;
}
