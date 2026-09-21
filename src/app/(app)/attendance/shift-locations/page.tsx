"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { shiftLocations, type ShiftLocation } from "@/lib/mock/data-2";

const columns: Column<ShiftLocation>[] = [
  { key: "name", header: "Location", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "checkinRadius", header: "Radius (m)", sortable: true, align: "center" },
  { key: "latitude", header: "Latitude", cell: (x) => <span className="text-muted-foreground">{x.latitude}</span> },
  { key: "longitude", header: "Longitude", cell: (x) => <span className="text-muted-foreground">{x.longitude}</span> },
];

export default function ShiftLocationsPage() {
  return (
    <>
      <PageHeader title="Shift Locations" description="Geofenced check-in points." />
      <DataTable columns={columns} rows={shiftLocations} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
