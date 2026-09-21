"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { leaveTypes } from "@/lib/mock/data";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function daysBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

export default function LeaveApplyPage() {
  const [leaveType, setLeaveType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const days = daysBetween(from, to);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveType || !from || !to || days <= 0) {
      toast.error("Please fill all fields with a valid date range.");
      return;
    }
    toast.success(`Leave request submitted · ${days} day${days > 1 ? "s" : ""}`);
    setLeaveType("");
    setFrom("");
    setTo("");
    setReason("");
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/leave" />}>
        <ArrowLeft /> Back to Leave
      </Button>
      <PageHeader title="Apply for Leave" description="Submit a new leave request for approval." />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Leave Request</CardTitle>
          <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select value={leaveType} onValueChange={(v) => setLeaveType(v ?? "")}>
                <SelectTrigger id="leaveType" className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name} ({t.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-semibold tabular-nums">{days} day{days === 1 ? "" : "s"}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
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
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
