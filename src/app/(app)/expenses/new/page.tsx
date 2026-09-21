"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { PageHeader } from "@/components/shared/page-header";
import { expenseCategories } from "@/lib/mock/data";
import { toast } from "sonner";
import { ArrowLeft, Upload, Paperclip, X } from "lucide-react";

// Receipt files are held locally and only "uploaded" on save (never on selection),
// so cancelling or closing the tab leaves no orphaned files behind.
type PendingFile = { file: File; preview: string };

export default function NewExpensePage() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFiles((prev) => [...prev, ...next]);
  };
  const removeFile = (idx: number) =>
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !date) {
      toast.error("Category, amount and date are required.");
      return;
    }
    // This is where real uploads would run before saving the record.
    toast.success(`Expense claim for ৳${Number(amount).toLocaleString()} submitted`);
    setCategory("");
    setAmount("");
    setDate("");
    setDescription("");
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/expenses" />}>
        <ArrowLeft /> Back to Expenses
      </Button>
      <PageHeader title="New Expense Claim" description="Submit an expense for reimbursement." />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Claim Details</CardTitle>
          <CardDescription>Attach receipts to speed up approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <SearchSelect
                  id="category"
                  value={category}
                  onChange={setCategory}
                  options={expenseCategories}
                  placeholder="Search category…"
                  addLabel="Expense Claim Type"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (BDT)</Label>
                <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Expense Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" />
            </div>

            <div className="space-y-2">
              <Label>Receipts</Label>
              <input ref={inputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 bg-muted p-6 text-sm text-muted-foreground transition-colors hover:bg-muted/70"
              >
                <Upload className="size-5" />
                Click to attach receipts
              </button>
              {files.length > 0 && (
                <ul className="space-y-2 pt-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 text-sm">
                      <Paperclip className="size-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{f.file.name}</span>
                      <span className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(0)} KB</span>
                      <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => removeFile(i)}>
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/expenses" />}>Cancel</Button>
              <Button type="submit">Submit Claim</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
