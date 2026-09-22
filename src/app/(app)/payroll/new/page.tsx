"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { fmtMoney, lineAmount, type PayMode, type TemplateLine } from "@/lib/mock/payroll";
import { toast } from "sonner";
import { Plus, Trash2, Wand2 } from "lucide-react";

/** Draft a fresh, sensible starter recipe. */
const SUGGESTIONS: TemplateLine[] = [
  { name: "House Rent Allowance", mode: "Percent", value: 40 },
  { name: "Medical Allowance", mode: "Percent", value: 10 },
  { name: "Conveyance Allowance", mode: "Fixed", value: 3000 },
  { name: "Special Allowance", mode: "Percent", value: 20 },
];
const DEDUCTION_SUGGESTIONS: TemplateLine[] = [
  { name: "Provident Fund", mode: "Percent", value: 12 },
  { name: "Health Insurance", mode: "Fixed", value: 1000 },
];

function LineRow({
  line,
  basic,
  tone,
  onChange,
  onRemove,
}: {
  line: TemplateLine;
  basic: number;
  tone: "earn" | "ded";
  onChange: (patch: Partial<TemplateLine>) => void;
  onRemove: () => void;
}) {
  const amount = lineAmount(line, basic);
  return (
    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
      <div className="space-y-1.5">
        <Label className="text-xs">Component</Label>
        <Input value={line.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. House Rent Allowance" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Type</Label>
        <div className="inline-flex h-10 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {(["Fixed", "Percent"] as PayMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ mode: m })}
              className={`rounded-md px-3 text-xs font-medium transition ${
                line.mode === m
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {m === "Percent" ? "% of basic" : "Fixed"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">{line.mode === "Percent" ? "Percent (%)" : "Amount (৳)"}</Label>
        <Input
          type="number"
          min="0"
          step="any"
          className="w-28"
          value={String(line.value)}
          onChange={(e) => onChange({ value: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="flex items-center gap-3 pb-1">
        <span className={`w-28 text-right text-sm font-semibold tabular-nums ${tone === "earn" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
          {tone === "earn" ? "" : "−"}
          {fmtMoney(amount)}
        </span>
        <Button type="button" variant="ghost" size="icon" className="size-9 text-slate-400 hover:text-rose-500" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function NewSalaryTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basic, setBasic] = useState(50000);
  const [earnings, setEarnings] = useState<TemplateLine[]>([...SUGGESTIONS]);
  const [deductions, setDeductions] = useState<TemplateLine[]>([...DEDUCTION_SUGGESTIONS]);

  const patch = (setter: React.Dispatch<React.SetStateAction<TemplateLine[]>>, i: number, p: Partial<TemplateLine>) =>
    setter((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...p } : r)));

  const { gross, totalDeduction, net } = useMemo(() => {
    const g = basic + earnings.reduce((s, l) => s + lineAmount(l, basic), 0);
    const d = deductions.reduce((s, l) => s + lineAmount(l, basic), 0);
    return { gross: g, totalDeduction: d, net: g - d };
  }, [earnings, deductions, basic]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (earnings.length === 0) {
      toast.error("Add at least one earning line.");
      return;
    }
    toast.success(`Salary template "${name.trim()}" created`);
    router.push("/payroll");
  };

  return (
    <>
      <PageHeader
        title="New Salary Template"
        description="Name it, list earnings & deductions, and preview the result — no formulas, no fuss."
        backHref="/payroll"
        backLabel="Back to Salary Templates"
      />

      <form className="grid gap-6 lg:grid-cols-3" onSubmit={submit}>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tpl-name" className="after:ml-0.5 after:text-destructive after:content-['*']">Template name</Label>
                <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering Package" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-desc">Description</Label>
                <Input id="tpl-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this package for?" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Earnings</CardTitle>
                <CardDescription>Basic Salary is always paid; add allowances on top.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => setEarnings((r) => [...r, { name: "", mode: "Fixed", value: 0 }])}>
                <Plus className="size-3.5" /> Add earning
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {earnings.map((l, i) => (
                <LineRow key={i} line={l} basic={basic} tone="earn" onChange={(p) => patch(setEarnings, i, p)} onRemove={() => setEarnings((r) => r.filter((_, idx) => idx !== i))} />
              ))}
              {earnings.length === 0 && <p className="text-sm text-slate-400">No earnings yet — add at least one.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Deductions</CardTitle>
                <CardDescription>Optional — subtracted from gross to reach net pay.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => setDeductions((r) => [...r, { name: "", mode: "Fixed", value: 0 }])}>
                <Plus className="size-3.5" /> Add deduction
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {deductions.map((l, i) => (
                <LineRow key={i} line={l} basic={basic} tone="ded" onChange={(p) => patch(setDeductions, i, p)} onRemove={() => setDeductions((r) => r.filter((_, idx) => idx !== i))} />
              ))}
              {deductions.length === 0 && <p className="text-sm text-slate-400">No deductions.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="size-4 text-blue-600" /> Live preview
              </CardTitle>
              <CardDescription>Assume a Basic Salary to see the monthly result.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preview-basic">Basic Salary (৳ / month)</Label>
                <Input id="preview-basic" type="number" min="0" step="any" value={String(basic)} onChange={(e) => setBasic(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Gross pay</span><span className="font-medium tabular-nums">{fmtMoney(gross)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Deductions</span><span className="font-medium tabular-nums text-rose-500">−{fmtMoney(totalDeduction)}</span></div>
                <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Net pay</span>
                  <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(net)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="h-10 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">Create Template</Button>
                <Button type="button" variant="outline" render={<Link href="/payroll" />} className="h-10 rounded-xl">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
