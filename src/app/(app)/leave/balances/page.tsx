import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { leaveBalances, leaveTypes, currentUser } from "@/lib/mock/data";
import { Plus } from "lucide-react";

export default function LeaveBalancesPage() {
  return (
    <>
      <PageHeader
        title="Leave Balances"
        description={`FY 2026 entitlements for ${currentUser.name}.`}
        backHref="/leave"
        backLabel="Back to Leave"
        showExport
        exportWhat="leave balances"
      >
        <Button
          render={<Link href="/leave/apply" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> Apply Leave
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {leaveBalances.map((b) => {
          const meta = leaveTypes.find((t) => t.name === b.leaveType);
          const usedPct = Math.round((b.used / b.entitled) * 100);
          return (
            <Card key={b.leaveType}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">{b.leaveType}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {meta?.paid ? "Paid" : "Unpaid"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-semibold tabular-nums">{b.remaining}</span>
                  <span className="text-sm text-muted-foreground">of {b.entitled} days left</span>
                </div>
                <Progress value={usedPct} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground">Used</p>
                    <p className="font-medium tabular-nums">{b.used}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-medium tabular-nums">{b.pending}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground">Left</p>
                    <p className="font-medium tabular-nums">{b.remaining}</p>
                  </div>
                </div>
                {meta?.carryForward ? (
                  <p className="text-xs text-muted-foreground">Unused days carry forward.</p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
