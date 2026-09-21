import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getEmployee,
  fmtDate,
  fmtMoney,
  leaveApplications,
  attendanceRecords,
} from "@/lib/mock/data";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const emp = getEmployee(id);
  if (!emp) notFound();

  const initials = emp.name.split("").map((s) => s[0]).slice(0, 2).join("");
  const myLeaves = leaveApplications.filter((l) => l.employeeId === emp.employeeId);
  const myAttendance = attendanceRecords.filter((a) => a.employeeId === emp.employeeId);

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/employees" />}>
        <ArrowLeft /> Back to Employees
      </Button>

      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback style={{ backgroundColor: emp.avatarColor }} className="text-lg font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{emp.name}</h1>
              <StatusBadge status={emp.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {emp.designation} · {emp.department} · {emp.employeeId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit</Button>
          <Button variant="outline" render={<Link href="/payroll/slips" />}>Salary Slips</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {emp.email}</div>
            <div className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {emp.phone}</div>
            <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /> {emp.workLocation}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              <Field label="Employee ID" value={emp.employeeId} />
              <Field label="Department" value={emp.department} />
              <Field label="Designation" value={emp.designation} />
              <Field label="Reports To" value={emp.reportsTo} />
              <Field label="Date of Joining" value={fmtDate(emp.joinDate)} />
              <Field label="Work Location" value={emp.workLocation} />
              <Field label="Base Salary" value={`${fmtMoney(emp.baseSalary)} / yr`} />
              <Field label="Role" value={<Badge variant="secondary" className="capitalize">{emp.role}</Badge>} />
              <Field label="Status" value={<StatusBadge status={emp.status} />} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Leave History</CardTitle></CardHeader>
          <CardContent>
            {myLeaves.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.leaveType}</TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(l.from)} → {fmtDate(l.to)}</TableCell>
                      <TableCell className="text-right">{l.days}</TableCell>
                      <TableCell className="text-right"><StatusBadge status={l.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No leave records.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Attendance</CardTitle></CardHeader>
          <CardContent>
            {myAttendance.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAttendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{fmtDate(a.date)}</TableCell>
                      <TableCell>{a.checkIn}</TableCell>
                      <TableCell>{a.checkOut}</TableCell>
                      <TableCell className="text-right"><StatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No attendance records.</p>
            )}
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Data shown is mock sample for UI review.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
