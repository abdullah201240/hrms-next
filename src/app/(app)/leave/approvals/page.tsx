"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fmtDate, currentUser } from "@/lib/mock/data";
import { useLeaveApplications } from "@/hooks/use-leave-applications";
import { leavePrint } from "@/lib/print/print";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { toast } from "sonner";
import { Check, X, Inbox } from "lucide-react";

type Decision = { id: string; status: "Approved" | "Rejected" };

export default function LeaveApprovalsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const leaveApplications = useLeaveApplications();
  const pending = leaveApplications.filter(
    (l) => l.status === "Pending" && !decisions.some((d) => d.id === l.id),
  );

  const decide = (id: string, name: string, status: "Approved" | "Rejected") => {
    setDecisions((prev) => [...prev, { id, status }]);
    toast.success(`${name}'s request ${status.toLowerCase()}`);
  };

  return (
    <>
      <PageHeader
        title="Leave Approvals"
        description={`Requests awaiting your action as ${currentUser.designation}.`}
        backHref="/leave"
        backLabel="Back to Leave"
        showExport
        exportWhat="leave approvals"
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
              No leave requests are waiting for your approval.
            </p>
            <Button variant="outline" className="mt-2" render={<Link href="/leave" />}>
              View all leave
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: "#64748b" }}>
                      {l.employeeName.split("").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="font-medium">{l.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.leaveType} · {fmtDate(l.from)} → {fmtDate(l.to)} · {l.days} day{l.days > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm">{l.reason}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PrintButton data={() => leavePrint(l)} variant="ghost" label="Print" />
                  <Button variant="outline" size="sm" onClick={() => decide(l.id, l.employeeName, "Rejected")}>
                    <X /> Reject
                  </Button>
                  <Button size="sm" onClick={() => decide(l.id, l.employeeName, "Approved")}>
                    <Check /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
