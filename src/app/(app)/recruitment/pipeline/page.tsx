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
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold">{a.applicantName}</p>
        <p className="text-xs text-muted-foreground">{a.jobTitle}</p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {a.source}
          </Badge>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i < a.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40"
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
      />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((s) => {
          const items = hiringPipeline.filter((a) => a.stage === s.key);
          return (
            <div key={s.key} className="flex w-72 shrink-0 flex-col gap-3">
              <div className="flex items-center gap-2 pb-1">
                <span className={`size-2.5 ${s.accent}`} />
                <h2 className="text-sm font-semibold">{s.key}</h2>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {items.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 bg-muted/30 p-3">
                {items.length ? (
                  items.map((a) => <ApplicantCard key={a.id} a={a} />)
                ) : (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No candidates
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
