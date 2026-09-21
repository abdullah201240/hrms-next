import { notFound } from "next/navigation";
import { DocTypeDetail } from "@/components/shared/crud/doctype-detail";
import { getRow } from "@/lib/crud/registry";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRow("/leave/periods", id)) notFound();
  return <DocTypeDetail doctype="/leave/periods" id={id} />;
}
