"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { salarySlips, fmtMoney } from "@/lib/mock/data";
import { toast } from "sonner";
import { Play, Wallet, Users, CircleDollarSign } from "lucide-react";

export default function PayrollProcessingPage() {
  const [period, setPeriod] = useState("September 2026");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const payable = salarySlips.filter((s) => s.month === "September 2026");
  const totalNet = payable.reduce((s, x) => s + x.net, 0);
  const processed = salarySlips.filter((s) => s.month === "August 2026" && s.status === "Paid").length;

  const run = () => {
    setRunning(true);
    setDone(false);
    toast.loading("Calculating payroll…", { id: "payroll" });
    setTimeout(() => {
      setRunning(false);
      setDone(true);
      toast.success(`Payroll for ${period} is ready`, { id: "payroll" });
    }, 1400);
  };

  return (
    <>
      <PageHeader title="Payroll Processing" description={`Prepare and publish payslips for a period.`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Employees in period" value={payable.length} icon={Users} />
        <StatCard label="Total Net Payable" value={fmtMoney(totalNet)} icon={CircleDollarSign} />
        <StatCard label="Published (Aug)" value={processed} icon={Wallet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run Payroll</CardTitle>
          <CardDescription>Pick a period and generate payslips for everyone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pay Period</label>
              <Select value={period} onValueChange={(v) => setPeriod(v ?? period)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["September 2026", "October 2026", "November 2026"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={run} disabled={running}>
              <Play /> {running ? "Processing…" : done ? "Re-run" : "Run Payroll"}
            </Button>
          </div>

          {running && <Progress value={60} className="h-2" />}

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              {done ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Ready to publish</Badge> : <Badge variant="secondary">Draft</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {done
                ? `${payable.length} payslips generated for ${period}. Review and publish to notify employees.`
                : `No payroll run yet for ${period}. Run it to generate ${payable.length} payslips totalling ${fmtMoney(totalNet)}.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
