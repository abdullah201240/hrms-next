import { notFound } from "next/navigation";
import { DocTypeDetail } from "@/components/shared/crud/doctype-detail";
import { getRow } from "@/lib/crud/registry";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRow("/tax-benefits/exemption-categories", id)) notFound();
  return <DocTypeDetail doctype="/tax-benefits/exemption-categories" id={id} />;
}
