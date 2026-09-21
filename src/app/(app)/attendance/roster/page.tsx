"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shiftAssignments } from "@/lib/mock/data-2";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RosterPage() {
  return (
    <>
      <PageHeader
        title="Shift Roster"
        description="Weekly shift view for assigned employees."
      />
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="p-3 text-left font-medium">Employee</th>
                  <th className="p-3 text-left font-medium">Shift</th>
                  {days.map((d) => (
                    <th key={d} className="p-3 text-center font-medium">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftAssignments.map((a) => (
                  <tr key={a.id}>
                    <td className="p-3 font-medium whitespace-nowrap">{a.employee}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{a.shiftType}</Badge>
                    </td>
                    {days.map((_, i) => {
                      const working = i < 5;
                      return (
                        <td key={i} className="p-3 text-center">
                          {working ? (
                            <span
                              className="inline-block size-6 bg-emerald-100 dark:bg-emerald-950"
                              title="Working"
                            />
                          ) : (
                            <span
                              className="inline-block size-6 bg-muted"
                              title="Week off"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block size-3 bg-emerald-100 dark:bg-emerald-950" /> Working
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-3 bg-muted" /> Week off
        </span>
      </div>
    </>
  );
}
