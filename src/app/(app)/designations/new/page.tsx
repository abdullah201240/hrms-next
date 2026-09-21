"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

// Fields cloned from the ERPNext `Designation` doctype.
export default function NewDesignationPage() {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.designation?.trim()) {
      toast.error("Missing required: Designation");
      return;
    }
    toast.success(`${v.designation} added`);
    router.push("/designations");
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/designations" />}>
        <ArrowLeft /> Back to Designations
      </Button>
      <PageHeader title="New Designation" description="Create a designation — fields mirror the Frappe Designation form." />

      <form className="space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Designation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="designation" className="after:content-['*'] after:ml-0.5 after:text-destructive">Designation</Label>
              <Input id="designation" value={v.designation ?? ""} onChange={(e) => set("designation", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="outline" render={<Link href="/designations" />}>Cancel</Button>
          <Button type="submit">Create Designation</Button>
        </div>
      </form>
    </>
  );
}
