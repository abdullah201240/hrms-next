"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { appointmentLetterTemplates, type AppointmentLetterTemplate } from "@/lib/mock/data-4";

const columns: Column<AppointmentLetterTemplate>[] = [
  { key: "name", header: "Template", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "company", header: "Company", sortable: true },
  { key: "basedOn", header: "Based On", sortable: true, cell: (x) => <span className="text-muted-foreground">{x.basedOn}</span> },
];

export default function AppointmentLetterTemplatesPage() {
  return (
    <>
      <PageHeader title="Appointment Letter Templates" description="Templates used to generate appointment letters." />
      <DataTable columns={columns} rows={appointmentLetterTemplates} searchKeys={["name", "company"]} pageSize={10} />
    </>
  );
}
