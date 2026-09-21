"use client";

import { EmployeeForm } from "@/components/shared/employee-form";

export default function NewEmployeePage() {
  return <EmployeeForm mode="create" backHref="/employees" redirect="/employees" />;
}
