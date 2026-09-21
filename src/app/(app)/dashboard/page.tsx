import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  CalendarCheck,
  CalendarX,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  employees,
  attendanceRecords,
  leaveApplications,
  expenseClaims,
  leaveBalances,
  departments,
  fmtDate,
} from "@/lib/mock/data";

const TODAY = "2026-09-21";

export default function DashboardPage() {
  const present = attendanceRecords.filter((a) => a.date === TODAY && a.status === "Present").length;
  const onLeave = attendanceRecords.filter((a) => a.date === TODAY && a.status === "Leave").length;
  const pendingLeaves = leaveApplications.filter((l) => l.status === "Pending");
  const pendingExpenses = expenseClaims.filter((e) => e.status === "Pending");

  const headcount = departments
    .map((d) => ({ name: d.name, count: d.employeeCount }))
    .sort((a, b) => b.count - a.count);
  const maxHead = Math.max(...headcount.map((h) => h.count));

  return (
    <>
      <PageHeader title="Dashboard" description="People-operations overview for your organization.">
        <Button render={<Link href="/leave/apply" />}>
          <Plus /> Request Leave
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={employees.length} icon={Users} hint="+2 this month" trend="up" />
        <StatCard label="Present Today" value={present} icon={CalendarCheck} hint={`${Math.round((present / employees.length) * 100)}% attendance`} trend="up" />
        <StatCard label="On Leave Today" value={onLeave} icon={CalendarX} hint="2 planned" trend="flat" />
        <StatCard label="Pending Approvals" value={pendingLeaves.length + pendingExpenses.length} icon={Clock} hint="3 leave · 2 expense" trend="down" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Leave approvals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Leave requests awaiting approval</CardTitle>
              <CardDescription>Requests you need to action.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/leave/approvals" />}>
              View all <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.employeeName}</TableCell>
                    <TableCell>{l.leaveType}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtDate(l.from)} → {fmtDate(l.to)}
                    </TableCell>
                    <TableCell className="text-right">{l.days}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Leave balance */}
        <Card>
          <CardHeader>
            <CardTitle>Your Leave Balance</CardTitle>
            <CardDescription>FY 2026 · {employees[4].name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveBalances.map((b) => (
              <div key={b.leaveType} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{b.leaveType}</span>
                  <span className="text-muted-foreground">
                    {b.used}/{b.entitled} used
                  </span>
                </div>
                <Progress value={(b.used / b.entitled) * 100} className="h-2" />
              </div>
            ))}
            <Separator />
            <Button variant="outline" className="w-full" render={<Link href="/leave/balances" />}>
              Full breakdown
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Headcount */}
        <Card>
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>Distribution across teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {headcount.map((h) => (
              <div key={h.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{h.name}</span>
                  <span className="font-medium tabular-nums">{h.count}</span>
                </div>
                <div className="h-2 w-full bg-muted">
                  <div className="h-2 bg-primary" style={{ width: `${(h.count / maxHead) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent expenses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Expense Claims</CardTitle>
              <CardDescription>Latest submissions across the team.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/expenses" />}>
              View all <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Claim</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseClaims.slice(0, 5).map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="font-medium">{x.claimId}</TableCell>
                    <TableCell>{x.employeeName}</TableCell>
                    <TableCell>{x.category}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ৳{x.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={x.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
