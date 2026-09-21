import { notFound } from "next/navigation";
import { DocTypeDetail } from "@/components/shared/crud/doctype-detail";
import { getRow } from "@/lib/crud/registry";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRow("/expenses/purpose-of-travel", id)) notFound();
  return <DocTypeDetail doctype="/expenses/purpose-of-travel" id={id} />;
}
