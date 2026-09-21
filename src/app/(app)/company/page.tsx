"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { company } from "@/lib/mock/data";

const fields: [string, React.ReactNode][] = [
  ["Company Name", company.name],
  ["Abbreviation", company.abbreviation],
  ["Default Email", company.email],
  ["Phone", company.phone],
  ["Address", company.address],
  ["Timezone", company.timezone],
  ["Currency", <Badge variant="secondary">{company.currency}</Badge>],
  ["Status", <StatusBadge status="Active" />],
];

export default function CompanyPage() {
  return (
    <>
      <PageHeader title="Company" description="Organisation profile used across HR, payroll and attendance." />
      <Card>
        <CardHeader><CardTitle className="text-base">Acme Technologies Ltd.</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            {fields.map(([label, value]) => (
              <div key={label} className="space-y-0.5">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
