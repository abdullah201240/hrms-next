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
  company,
} from "@/lib/mock/data";
import { PageHeader } from "@/components/shared/page-header";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { Mail, Phone, MapPin, Pencil } from "lucide-react";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? <span className="font-normal text-muted-foreground">—</span>}</dd>
    </div>
  );
}

function InfoCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">{children}</dl>
      </CardContent>
    </Card>
  );
}

const dash = (s?: string) => (s && s.trim() ? s : undefined);

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const emp = getEmployee(id);
  if (!emp) notFound();

  const initials = (emp.firstName && emp.lastName ? emp.firstName[0] + emp.lastName[0] : emp.name.split("").map((s) => s[0]).slice(0, 2).join("")).toUpperCase();
  const myLeaves = leaveApplications.filter((l) => l.employeeId === emp.employeeId);
  const myAttendance = attendanceRecords.filter((a) => a.employeeId === emp.employeeId);

  return (
    <>
      <PageHeader
        title={emp.name}
        description={`${emp.designation} · ${emp.department} · ${emp.employeeId}`}
        backHref="/employees"
        backLabel="Back to Employees"
        avatar={
          <Avatar className="size-12 ring-2 ring-blue-500/20">
            <AvatarFallback style={{ backgroundColor: emp.avatarColor }} className="text-base font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        }
        badge={<StatusBadge status={emp.status} />}
      >
        <PrintButton data={{ doctype: "Employee", name: emp.employeeId, row: emp, company: company.name }} />
        <Button
          render={<Link href={`/employees/${emp.id}/edit`} />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Pencil className="size-4" /> Edit
        </Button>
        <Button
          variant="outline"
          render={<Link href="/payroll/slips" />}
          className="h-10 rounded-xl border border-slate-200/90 bg-white px-3.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Salary Slips
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="size-4 shrink-0 text-muted-foreground" /> <span className="truncate">{emp.companyEmail || emp.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-muted-foreground" /> {emp.phone}</div>
            <div className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-muted-foreground" /> {emp.workLocation}</div>
            {dash(emp.personalEmail) && (
              <div className="flex items-center gap-2"><Mail className="size-4 shrink-0 text-muted-foreground" /> <span className="truncate text-muted-foreground">{emp.personalEmail} (personal)</span></div>
            )}
          </CardContent>
        </Card>

        <InfoCard title="Personal" className="lg:col-span-2">
          <Field label="Salutation" value={dash(emp.salutation)} />
          <Field label="Full Name" value={emp.name} />
          <Field label="Gender" value={dash(emp.gender)} />
          <Field label="Date of Birth" value={emp.dateOfBirth ? fmtDate(emp.dateOfBirth) : undefined} />
          <Field label="Marital Status" value={dash(emp.maritalStatus)} />
          <Field label="Blood Group" value={dash(emp.bloodGroup)} />
          <Field label="Company" value={dash(emp.company)} />
          <Field label="Branch" value={dash(emp.branch)} />
          <Field label="Holiday List" value={dash(emp.holidayList)} />
        </InfoCard>
      </div>

      <InfoCard title="Employment">
        <Field label="Employee ID" value={emp.employeeId} />
        <Field label="Department" value={emp.department} />
        <Field label="Designation" value={emp.designation} />
        <Field label="Reports To" value={dash(emp.reportsTo)} />
        <Field label="Grade" value={dash(emp.grade)} />
        <Field label="Date of Joining" value={fmtDate(emp.joinDate)} />
        <Field label="Work Location" value={emp.workLocation} />
        <Field label="Role" value={<Badge variant="secondary" className="capitalize">{emp.role}</Badge>} />
        <Field label="Status" value={<StatusBadge status={emp.status} />} />
      </InfoCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="Salary & Compensation">
          <Field label="Currency" value={dash(emp.salaryCurrency)} />
          <Field label="Salary Mode" value={dash(emp.salaryMode)} />
          <Field label="Base Salary" value={`${fmtMoney(emp.baseSalary)} / yr`} />
          <Field label="CTC" value={emp.ctc ? `${fmtMoney(emp.ctc)} / yr` : undefined} />
          <Field label="Bank Name" value={dash(emp.bankName)} />
          <Field label="Bank A/C No." value={dash(emp.bankAcno)} />
        </InfoCard>

        <InfoCard title="Terms & Dates">
          <Field label="Offer Date" value={emp.offerDate ? fmtDate(emp.offerDate) : undefined} />
          <Field label="Confirmation Date" value={emp.confirmationDate ? fmtDate(emp.confirmationDate) : undefined} />
          <Field label="Contract End Date" value={emp.contractEndDate ? fmtDate(emp.contractEndDate) : undefined} />
          <Field label="Retirement Date" value={emp.retirementDate ? fmtDate(emp.retirementDate) : undefined} />
          <Field label="Notice Period" value={emp.noticeDays ? `${emp.noticeDays} days` : undefined} />
          <Field label="Attendance Device ID" value={dash(emp.attendanceDeviceId)} />
        </InfoCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Permanent Address</dt>
              <dd className="font-medium">{dash(emp.permanentAddress) ?? <span className="font-normal text-muted-foreground">—</span>}</dd>
            </div>
            <Separator />
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Current Address</dt>
              <dd className="font-medium">{dash(emp.currentAddress) ?? <span className="font-normal text-muted-foreground">—</span>}</dd>
            </div>
          </CardContent>
        </Card>

        <InfoCard title="Emergency Contact">
          <Field label="Contact Name" value={dash(emp.emergencyContactName)} />
          <Field label="Relation" value={dash(emp.relation)} />
          <Field label="Phone" value={dash(emp.emergencyPhone)} />
        </InfoCard>
      </div>

      {dash(emp.bio) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Bio</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{emp.bio}</p></CardContent>
        </Card>
      )}

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
