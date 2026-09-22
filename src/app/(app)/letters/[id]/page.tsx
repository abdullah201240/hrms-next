"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { CARD } from "@/components/letters/ui";
import { useLetters } from "@/hooks/use-letters";
import { getLetterType, labelize, type LetterStatus } from "@/lib/letters";
import { setLetterStatus, deleteLetter } from "@/lib/mock/letters-store";
import { fmtDate } from "@/lib/mock/data";
import { LetterStatusBadge, LetterTypeChip } from "@/components/letters/badges";
import { LetterPrintButton, renderLetter } from "@/components/letters";
import { Pencil, Trash2, Send, CheckCircle2, Archive, FileQuestion } from "lucide-react";

const NEXT_ACTIONS: Partial<Record<LetterStatus, { to: LetterStatus; label: string; icon: typeof Send }[]>> = {
  Draft: [
    { to: "Sent", label: "Mark Sent", icon: Send },
    { to: "Signed", label: "Mark Signed", icon: CheckCircle2 },
  ],
  Sent: [{ to: "Signed", label: "Mark Signed", icon: CheckCircle2 }],
  Signed: [{ to: "Archived", label: "Archive", icon: Archive }],
};

export default function LetterDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const letters = useLetters();
  const letter = letters.find((l) => l.id === id);

  if (!letter) {
    return (
      <>
        <PageHeader title="Letter not found" backHref="/letters" backLabel="Back to Letters" />
        <div className={CARD + " flex flex-col items-center gap-4 p-12 text-center"}>
          <FileQuestion className="size-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-muted-foreground">This letter may have been removed in this session.</p>
          <Button render={<Link href="/letters" />} variant="outline" className="rounded-xl">
            Back to Letters
          </Button>
        </div>
      </>
    );
  }

  const cfg = getLetterType(letter.type);
  const actions = NEXT_ACTIONS[letter.status] ?? [];

  const meta: [string, string][] = [
    ["Employee", letter.employeeName],
    ["Employee ID", letter.employeeIdCode],
    ["Department", letter.employeeDepartment],
    ["Designation", letter.employeeDesignation],
    ["Issued", fmtDate(letter.issueDate)],
    ["Effective", fmtDate(letter.effectiveDate)],
    ["Created by", letter.createdBy],
  ];

  return (
    <>
      <PageHeader
        title={cfg?.name ?? "Letter"}
        description={letter.subject}
        backHref="/letters"
        backLabel="Back to Letters"
        badge={<LetterStatusBadge status={letter.status} />}
      >
        <LetterPrintButton letter={letter} variant="default" label="Print" className="h-10 rounded-xl" />
        <Button variant="outline" className="h-10 rounded-xl" render={<Link href={`/letters/new?edit=${letter.id}`} />}>
          <Pencil className="size-4" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl text-muted-foreground hover:text-destructive"
          aria-label="Delete letter"
          onClick={() => {
            deleteLetter(letter.id);
            toast.success("Letter deleted");
            router.push("/letters");
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* Meta + actions */}
        <div className="space-y-6">
          <div className={CARD + " p-5"}>
            <div className="mb-3 flex items-center justify-between">
              <LetterTypeChip type={letter.type} />
              <span className="font-mono text-xs text-slate-400">{letter.id}</span>
            </div>
            <dl className="space-y-2.5">
              {meta.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{k}</dt>
                  <dd className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {actions.length > 0 && (
            <div className={CARD + " p-5"}>
              <p className="mb-3 text-sm font-semibold">Move to…</p>
              <div className="flex flex-wrap gap-2">
                {actions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <Button
                      key={a.to}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg gap-1.5"
                      onClick={() => {
                        setLetterStatus(letter.id, a.to);
                        toast.success(`Marked ${a.to}`);
                      }}
                    >
                      <Icon className="size-4" /> {a.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {Object.keys(letter.fields).filter((k) => !k.startsWith("signatory")).length > 0 && (
            <div className={CARD + " p-5"}>
              <p className="mb-3 text-sm font-semibold">Details</p>
              <dl className="space-y-2.5">
                {Object.entries(letter.fields)
                  .filter(([k]) => !k.startsWith("signatory"))
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{labelize(k)}</dt>
                      <dd className="text-sm text-slate-700 dark:text-slate-200">{v || "—"}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
        </div>

        {/* Rendered letter */}
        <div>
          <div className="overflow-x-auto rounded-2xl bg-slate-100 p-4 dark:bg-slate-900 sm:p-6">
            <div className="mx-auto w-fit rounded-lg ring-1 ring-slate-200/60 dark:ring-slate-800">
              {renderLetter(letter)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
