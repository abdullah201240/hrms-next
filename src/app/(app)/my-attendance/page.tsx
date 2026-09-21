"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentUser } from "@/lib/mock/data";
import { LogIn, LogOut, CalendarCheck, Clock, CalendarX, Plane } from "lucide-react";

const myRecords = [
  { date: "2026-09-21", checkIn: "08:58", checkOut: "—", lateBy: "0m", status: "Present" },
  { date: "2026-09-20", checkIn: "09:01", checkOut: "18:12", lateBy: "1m", status: "Present" },
  { date: "2026-09-19", checkIn: "—", checkOut: "—", lateBy: "—", status: "Week Off" },
  { date: "2026-09-18", checkIn: "—", checkOut: "—", lateBy: "—", status: "Week Off" },
  { date: "2026-09-17", checkIn: "09:24", checkOut: "17:58", lateBy: "24m", status: "Present" },
  { date: "2026-09-16", checkIn: "—", checkOut: "—", lateBy: "—", status: "Leave" },
  { date: "2026-09-15", checkIn: "08:55", checkOut: "13:02", lateBy: "0m", status: "Half Day" },
];

export default function MyAttendancePage() {
  return (
    <>
      <PageHeader
        title="My Attendance"
        description={`Signed in as ${currentUser.name} · ${currentUser.employeeId}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Today · Mon, 21 Sep</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 p-3">
                <p className="text-xs text-muted-foreground">Check In</p>
                <p className="text-lg font-semibold tabular-nums">08:58</p>
              </div>
              <div className="space-y-1 p-3">
                <p className="text-xs text-muted-foreground">Check Out</p>
                <p className="text-lg font-semibold tabular-nums text-muted-foreground">—</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" disabled><LogIn /> Clocked In</Button>
              <Button variant="outline" className="flex-1"><LogOut /> Check Out</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard label="Days Present" value={18} icon={CalendarCheck} hint="This month" />
          <StatCard label="Late Arrivals" value={2} icon={Clock} hint="Under 30m policy" />
          <StatCard label="Leave Taken" value={1} icon={Plane} hint="Casual leave" />
          <StatCard label="Absences" value={0} icon={CalendarX} hint="Perfect" />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Late By</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRecords.map((r) => (
                <TableRow key={r.date}>
                  <TableCell className="font-medium">{r.date}</TableCell>
                  <TableCell>{r.checkIn}</TableCell>
                  <TableCell>{r.checkOut}</TableCell>
                  <TableCell>{r.lateBy}</TableCell>
                  <TableCell className="text-right"><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
