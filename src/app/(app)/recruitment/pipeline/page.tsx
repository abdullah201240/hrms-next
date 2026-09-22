"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  hiringPipeline,
  type PipelineApplicant,
  type HiringStage,
} from "@/lib/mock/data-3";

const stages: { key: HiringStage; accent: string }[] = [
  { key: "Applied", accent: "bg-sky-500" },
  { key: "Screening", accent: "bg-indigo-500" },
  { key: "Interview", accent: "bg-violet-500" },
  { key: "Offer", accent: "bg-amber-500" },
  { key: "Hired", accent: "bg-emerald-500" },
];

function ApplicantCard({ a }: { a: PipelineApplicant }) {
  return (
    <Card className="rounded-xl border border-slate-200/50 bg-white transition-all dark:border-slate-800 dark:bg-[#161e2e]">
      <CardContent className="space-y-2 p-3.5">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.applicantName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{a.jobTitle}</p>
        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium">
            {a.source}
          </Badge>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i < a.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HiringPipelinePage() {
  return (
    <>
      <PageHeader
        title="Hiring Pipeline"
        description="Kanban view of candidates moving through recruitment stages."
        showExport
        exportWhat="candidates"
      />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((s) => {
          const items = hiringPipeline.filter((a) => a.stage === s.key);
          return (
            <div key={s.key} className="flex w-72 shrink-0 flex-col gap-3">
              <div className="flex items-center gap-2 pb-1">
                <span className={`size-2.5 rounded-full ${s.accent}`} />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{s.key}</h2>
                <Badge variant="secondary" className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold">
                  {items.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/50 bg-slate-100/50 p-3 min-h-[300px] dark:border-slate-800/40 dark:bg-[#121826]/60">
                {items.length ? (
                  items.map((a) => <ApplicantCard key={a.id} a={a} />)
                ) : (
                  <p className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    No candidates in {s.key.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
