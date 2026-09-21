"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layers,
  UserCheck,
  CalendarClock,
  Shield,
  UserCog,
  CalendarCheck,
  Ban,
  HandCoins,
  ArrowRight,
} from "lucide-react";
import { leaveTypes, leaveApplications } from "@/lib/mock/data";
import {
  leaveAllocations,
  leavePeriods,
  leavePolicies,
  holidayLists,
  leaveBlockLists,
} from "@/lib/mock/data-2";

const tools = [
  { href: "/leave/types", label: "Leave Types", desc: "Configure leave categories & rules", icon: Layers },
  { href: "/leave/allocations", label: "Leave Allocation", desc: "Grant leave quotas to employees", icon: UserCheck },
  { href: "/leave/periods", label: "Leave Period", desc: "Define allocation periods", icon: CalendarClock },
  { href: "/leave/policies", label: "Leave Policy", desc: "Bundled allocation templates", icon: Shield },
  { href: "/leave/policy-assignments", label: "Policy Assignment", desc: "Assign policies to employees", icon: UserCog },
  { href: "/leave/holidays", label: "Holiday List", desc: "Manage company holidays", icon: CalendarCheck },
  { href: "/leave/block-list", label: "Leave Block List", desc: "Restrict leave on key dates", icon: Ban },
  { href: "/leave/encashment", label: "Leave Encashment", desc: "Cash out unused balances", icon: HandCoins },
];

export default function LeaveControlPanelPage() {
  const pending = leaveApplications.filter(
    (a) => a.status !== "Approved" && a.status !== "Rejected",
  ).length;

  return (
    <>
      <PageHeader
        title="Leave Control Panel"
        description="One-stop access to every leave configuration tool."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Leave Types" value={leaveTypes.length} icon={Layers} />
        <StatCard label="Allocations" value={leaveAllocations.length} icon={UserCheck} />
        <StatCard label="Pending Applications" value={pending} icon={Shield} hint="Awaiting approval" trend="flat" />
        <StatCard label="Holidays Configured" value={holidayLists.reduce((n, h) => n + h.totalHolidays, 0)} icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="transition-colors hover:bg-muted/60">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                  <t.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-semibold">{t.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Leave Periods"
          value={leavePeriods.length}
          icon={CalendarClock}
        />
        <StatCard
          label="Leave Policies"
          value={leavePolicies.length}
          icon={Shield}
        />
        <StatCard
          label="Block Lists"
          value={leaveBlockLists.length}
          icon={Ban}
        />
      </div>
    </>
  );
}
