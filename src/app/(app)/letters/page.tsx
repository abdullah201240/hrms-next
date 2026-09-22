"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { fmtDate } from "@/lib/mock/data";
import { useLetters } from "@/hooks/use-letters";
import { LetterTypeChip, LetterStatusBadge } from "@/components/letters/badges";
import { LetterPrintButton } from "@/components/letters";
import type { HRLetter, LetterStatus } from "@/lib/letters";
import { Plus, FileSignature, FileText, Send, CheckCircle2 } from "lucide-react";

const initials = (n: string) => n.split(" ").map((s) => s[0]).slice(0, 2).join("");

const columns: Column<HRLetter>[] = [
  { key: "type", header: "Letter Type", sortable: true, cell: (l) => <LetterTypeChip type={l.type} /> },
  {
    key: "employeeName",
    header: "Employee",
    sortable: true,
    cell: (l) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {initials(l.employeeName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{l.employeeName}</div>
          <div className="truncate text-xs text-slate-400 dark:text-slate-500">{l.employeeIdCode}</div>
        </div>
      </div>
    ),
  },
  {
    key: "subject",
    header: "Subject",
    cell: (l) => (
      <Link href={`/letters/${l.id}`} className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400">
        {l.subject}
      </Link>
    ),
  },
  { key: "issueDate", header: "Issued", sortable: true, className: "hidden lg:table-cell", cell: (l) => <span className="text-slate-600 dark:text-slate-300">{fmtDate(l.issueDate)}</span> },
  { key: "status", header: "Status", cell: (l) => <LetterStatusBadge status={l.status} /> },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (l) => (
      <div className="flex items-center justify-end gap-1">
        <LetterPrintButton letter={l} label="Print" />
        <Button size="sm" variant="outline" className="h-8 rounded-lg" render={<Link href={`/letters/${l.id}`} />}>
          View
        </Button>
      </div>
    ),
  },
];

const FILTERS: ("All" | LetterStatus)[] = ["All", "Draft", "Sent", "Signed", "Archived"];

export default function LettersPage() {
  const [filter, setFilter] = useState<"All" | LetterStatus>("All");
  const letters = useLetters();
  const rows = filter === "All" ? letters : letters.filter((l) => l.status === filter);

  const draftCount = letters.filter((l) => l.status === "Draft").length;
  const sentCount = letters.filter((l) => l.status === "Sent").length;
  const signedCount = letters.filter((l) => l.status === "Signed").length;

  return (
    <>
      <PageHeader
        title="Letters"
        icon={FileSignature}
        iconColor="indigo"
        description="Issue and print every HR letter — offers, appointments, confirmations, promotions, disciplinary and exit letters."
        showExport
        exportWhat="hr letters"
      >
        <Button
          render={<Link href="/letters/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Letter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Letters" value={letters.length} icon={FileText} color="indigo" hint="All time" sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12" />
        <StatCard label="Signed" value={signedCount} icon={CheckCircle2} color="emerald" hint="Executed" />
        <StatCard label="Sent" value={sentCount} icon={Send} color="blue" hint="Awaiting signature" />
        <StatCard label="Drafts" value={draftCount} icon={FileSignature} color="amber" hint="In progress" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "All" | LetterStatus)}>
        <TabsList className="h-10 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f}
              value={f}
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
            >
              {f}
              {f !== "All" && (
                <span className="ml-1.5 text-xs text-muted-foreground">({letters.filter((l) => l.status === f).length})</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={["employeeName", "subject", "type", "id"]}
        searchPlaceholder="Search letters by employee, subject or type…"
        pageSize={10}
      />
    </>
  );
}
