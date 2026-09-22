"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { PageHeader } from "@/components/shared/page-header";
import {
  employees,
  leaveTypes,
  leaveBalances,
  currentUser,
  fmtDate,
  type LeaveApplication,
} from "@/lib/mock/data";
import { netLeaveDays } from "@/lib/working-hours";
import { addLeaveApplication } from "@/lib/mock/leave-store";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const TODAY = "2026-09-21";
const employeeNames = employees.map((e) => e.name);
const leaveTypeNames = leaveTypes.map((t) => t.name);

function daysBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

export default function LeaveApplyPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState(currentUser.name);
  const [leaveType, setLeaveType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayDate, setHalfDayDate] = useState("");
  const [approver, setApprover] = useState("");
  const [reason, setReason] = useState("");

  const gross = daysBetween(from, to);
  // Holiday-aware net days (mirrors Leave Application.calculate_total_leave_days).
  const net =
    leaveType && employee && gross > 0
      ? netLeaveDays(employee, leaveType, from, to, {
          halfDay,
          halfDayDate: halfDayDate || from,
        })
      : null;
  const days = net ? net.days : gross;
  const balance = leaveBalances.find((b) => b.leaveType === leaveType);
  const overBalance = balance ? days > balance.remaining : false;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employee || !leaveType || !from || !to || gross <= 0) {
      toast.error("Please pick an employee, leave type and a valid date range.");
      return;
    }
    const emp = employees.find((x) => x.name === employee);
    const rec: LeaveApplication = {
      id: `la-${Date.now()}`,
      employeeId: emp?.employeeId ?? "",
      employeeName: employee,
      leaveType,
      from,
      to,
      days: Math.max(0, Math.round(days * 100) / 100),
      reason,
      status: "Pending",
      appliedOn: TODAY,
      approver: approver || "—",
    };
    addLeaveApplication(rec);
    toast.success(`Leave application added for ${employee} · ${rec.days} day${rec.days === 1 ? "" : "s"}`);
    router.push("/leave");
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/leave" />}>
        <ArrowLeft /> Back to Leave
      </Button>
      <PageHeader title="New Leave Application" description="Create a leave request for approval." />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Leave Application</CardTitle>
          <CardDescription>Employee, leave type and period are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <SearchSelect
                  id="employee"
                  value={employee}
                  onChange={setEmployee}
                  options={employeeNames}
                  placeholder="Search employee…"
                  addLabel="Employee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <SearchSelect
                  id="leaveType"
                  value={leaveType}
                  onChange={setLeaveType}
                  options={leaveTypeNames}
                  placeholder="Search leave type…"
                  addLabel="Leave Type"
                />
              </div>
            </div>

            {balance && (
              <p className="-mt-2 text-sm text-muted-foreground">
                Available balance:{" "}
                <span className="font-medium text-foreground tabular-nums">{balance.remaining}</span> day
                {balance.remaining === 1 ? "" : "s"}
                <span className="text-muted-foreground">
                  {" "}
                  (entitled {balance.entitled}, used {balance.used}, pending {balance.pending})
                </span>
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">From Date</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To Date</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="halfDay"
                  checked={halfDay}
                  onCheckedChange={(c) => setHalfDay(c === true)}
                />
                <label htmlFor="halfDay" className="text-sm leading-none">
                  Half Day
                </label>
              </div>
              {halfDay && (
                <div className="space-y-1.5">
                  <Label htmlFor="halfDayDate" className="text-xs">
                    Half-day date
                  </Label>
                  <Input
                    id="halfDayDate"
                    type="date"
                    value={halfDayDate}
                    onChange={(e) => setHalfDayDate(e.target.value)}
                    className="w-44"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">Leave Approver</Label>
              <SearchSelect
                id="approver"
                value={approver}
                onChange={setApprover}
                options={employeeNames}
                placeholder="Search approver…"
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Leave Days:</span>
                <span className="font-semibold tabular-nums">
                  {days} day{days === 1 ? "" : "s"}
                </span>
                {overBalance && (
                  <Badge variant="outline" className="text-destructive">
                    Exceeds balance
                  </Badge>
                )}
              </div>
              {net && net.holidays.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {gross} selected · {net.holidays.length} holiday
                  {net.holidays.length > 1 ? "s" : ""} not counted (
                  {net.holidays.map((h) => fmtDate(h.date)).join(", ")})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Leave</Label>
              <Textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your leave…"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/leave" />}>
                Cancel
              </Button>
              <Button type="submit">Create Application</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
