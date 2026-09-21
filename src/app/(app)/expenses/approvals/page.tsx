"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { expenseClaims, fmtDate, currentUser } from "@/lib/mock/data";
import { toast } from "sonner";
import { Check, X, Inbox } from "lucide-react";

type Decision = { id: string; status: "Approved" | "Rejected" };

export default function ExpenseApprovalsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const pending = expenseClaims.filter(
    (x) => x.status === "Pending" && !decisions.some((d) => d.id === x.id),
  );

  const decide = (id: string, name: string, status: "Approved" | "Rejected") => {
    setDecisions((prev) => [...prev, { id, status }]);
    toast.success(`${name}'s claim ${status.toLowerCase()}`);
  };

  return (
    <>
      <PageHeader
        title="Expense Approvals"
        description={`Claims awaiting your action as ${currentUser.designation}.`}
      >
        <Badge variant="secondary" className="h-6 text-sm">
          {pending.length} pending
        </Badge>
      </PageHeader>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Inbox className="size-8 text-muted-foreground" />
            <p className="font-medium">You're all caught up</p>
            <p className="text-sm text-muted-foreground">
              No expense claims are waiting for your approval.
            </p>
            <Button variant="outline" className="mt-2" render={<Link href="/expenses" />}>
              View all expenses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((x) => (
            <Card key={x.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: "#64748b" }}>
                      {x.employeeName.split("").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {x.employeeName} <span className="text-sm font-normal text-muted-foreground">· {x.claimId}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {x.category} · {fmtDate(x.date)}
                    </p>
                    <p className="text-sm">{x.description}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular-nums font-semibold">${x.amount.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => decide(x.id, x.employeeName, "Rejected")}>
                      <X /> Reject
                    </Button>
                    <Button size="sm" onClick={() => decide(x.id, x.employeeName, "Approved")}>
                      <Check /> Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
