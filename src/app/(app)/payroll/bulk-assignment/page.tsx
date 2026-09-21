"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers } from "lucide-react";
import { employees, salaryStructures } from "@/lib/mock/data";

const list = employees.slice(0, 8);

export default function BulkSalaryStructurePage() {
  const [structure, setStructure] = useState(salaryStructures[0]?.name ?? "");
  const [from, setFrom] = useState("2026-01-01");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const count = Object.values(selected).filter(Boolean).length;

  return (
    <>
      <PageHeader
        title="Bulk Salary Structure Assignment"
        description="Apply one salary structure to many employees at once."
      />
      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Salary Structure</Label>
            <Select value={structure} onValueChange={(v) => v && setStructure(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select structure" />
              </SelectTrigger>
              <SelectContent>
                {salaryStructures.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bs-from">Salary Effective From</Label>
            <Input id="bs-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {list.map((e) => (
            <label
              key={e.id}
              className="flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/40"
            >
              <Checkbox
                checked={!!selected[e.id]}
                onCheckedChange={(c) => setSelected((s) => ({ ...s, [e.id]: c === true }))}
              />
              <span className="text-sm font-medium">{e.name}</span>
              <span className="text-xs text-muted-foreground">
                {e.designation} · {e.department}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button disabled={count === 0}>
          <Layers className="size-4" />
          Create {count} {count === 1 ? "Assignment" : "Assignments"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {structure || "No structure selected"} · from {from}
        </span>
      </div>
    </>
  );
}
