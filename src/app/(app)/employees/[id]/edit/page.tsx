import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/shared/employee-form";
import { getEmployee } from "@/lib/mock/data";

/** Map a mock Employee record onto the shared form's field keys. */
function toInitial(emp: NonNullable<ReturnType<typeof getEmployee>>): Record<string, string> {
  const [firstName, ...rest] = (emp.firstName || emp.name).split(" ");
  const raw: Record<string, string | number | undefined> = {
    salutation: emp.salutation,
    firstName: emp.firstName || firstName,
    lastName: emp.lastName || rest.join(" ") || undefined,
    employeeName: emp.name,
    employeeNumber: emp.employeeId,
    company: emp.company,
    status: emp.status,
    gender: emp.gender,
    dob: emp.dateOfBirth,
    dateOfJoining: emp.joinDate,
    department: emp.department,
    designation: emp.designation,
    reportsTo: emp.reportsTo,
    branch: emp.branch,
    holidayList: emp.holidayList,
    grade: emp.grade,
    salaryCurrency: emp.salaryCurrency,
    ctc: emp.ctc,
    baseSalary: emp.baseSalary,
    salaryMode: emp.salaryMode,
    bankName: emp.bankName,
    bankAcno: emp.bankAcno,
    offerDate: emp.offerDate,
    confirmationDate: emp.confirmationDate,
    contractEndDate: emp.contractEndDate,
    retirementDate: emp.retirementDate,
    noticeDays: emp.noticeDays,
    attendanceDeviceId: emp.attendanceDeviceId,
    mobile: emp.phone,
    companyEmail: emp.companyEmail,
    personalEmail: emp.personalEmail,
    userId: emp.userId,
    permanentAddress: emp.permanentAddress,
    currentAddress: emp.currentAddress,
    emergencyPhone: emp.emergencyPhone,
    emergencyContactName: emp.emergencyContactName,
    relation: emp.relation,
    maritalStatus: emp.maritalStatus,
    bloodGroup: emp.bloodGroup,
    bio: emp.bio,
  };
  return Object.fromEntries(
    Object.entries(raw).filter(([, val]) => val !== undefined && val !== "").map(([k, val]) => [k, String(val)]),
  );
}

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const emp = getEmployee(id);
  if (!emp) notFound();

  return <EmployeeForm mode="edit" initial={toInitial(emp)} backHref={`/employees/${emp.id}`} redirect={`/employees/${emp.id}`} />;
}
