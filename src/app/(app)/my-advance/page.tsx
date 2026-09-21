"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HandCoins } from "lucide-react";
import { employeeAdvances, type EmployeeAdvance } from "@/lib/mock/data-2";
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<EmployeeAdvance>[] = [
  { key: "purpose", header: "Purpose / Ref", sortable: true, cell: (x) => <span className="font-medium">{x.purpose}</span> },
  { key: "advanceDate", header: "Applied", sortable: true, cell: (x) => fmtDate(x.advanceDate) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "paidAmount", header: "Paid", align: "right", cell: (x) => <span className="tabular-nums">{fmtMoney(x.paidAmount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function MyAdvancePage() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  return (
    <>
      <PageHeader
        title="My Salary Advances"
        description="Apply for an advance and track your existing requests."
      />

      <Card className="mb-6 max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HandCoins className="size-4" />
            New Advance Request
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="adv-amt">Amount</Label>
            <Input id="adv-amt" type="number" min={0} placeholder="e.g. 800" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adv-reason">Reason</Label>
            <Input id="adv-reason" placeholder="Medical emergency" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button disabled={!amount || !purpose}>Submit for Approval</Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="pb-3 text-lg font-semibold tracking-tight">Advance History</h2>
      <DataTable columns={columns} rows={employeeAdvances} searchKeys={["purpose"]} pageSize={10} />
    </>
  );
}
