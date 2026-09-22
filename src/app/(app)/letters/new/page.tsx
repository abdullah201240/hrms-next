"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { SearchSelect } from "@/components/shared/search-select";
import { employees, currentUser } from "@/lib/mock/data";
import {
  LETTER_TYPES,
  LETTER_CATEGORIES,
  getLetterType,
  getCategoryLabel,
  getCategoryShort,
  defaultSubject,
  defaultBody,
  isDateField,
  labelize,
  type HRLetter,
  type LetterStatus,
  type LetterCategory,
} from "@/lib/letters";
import { createLetter, updateLetter, getLetter } from "@/lib/mock/letters-store";
import { renderLetter, LetterPrintButton } from "@/components/letters";
import { LetterStatusBadge, LetterTypeChip } from "@/components/letters/badges";
import { toast } from "sonner";
import {
  Save,
  RotateCcw,
  Eye,
  FileSignature,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  UserCheck,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Lock,
  User,
  LayoutGrid,
  Columns2,
  FileCheck2,
  CheckCircle2,
  Shield,
  HelpCircle,
} from "lucide-react";

const STATUSES: LetterStatus[] = ["Draft", "Sent", "Signed", "Archived"];
const today = () => new Date().toISOString().slice(0, 10);

const SIGNATORY_PRESETS = [
  { name: currentUser?.name ?? "HR Manager", designation: "HR Operations Lead" },
  { name: "Rahman Kabir", designation: "Managing Director & CEO" },
  { name: "Nusrat Jahan", designation: "Head of People & Culture" },
  { name: "Tariqul Islam", designation: "General Manager (Admin & Legal)" },
];

function NewLetterPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const existing = editId ? getLetter(editId) : undefined;

  const [type, setType] = useState(existing?.type ?? "offer");
  const [employeeId, setEmployeeId] = useState(existing?.employeeId ?? "");
  const [subject, setSubject] = useState(existing?.subject ?? defaultSubject(getLetterType("offer")!));
  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? today());
  const [effectiveDate, setEffectiveDate] = useState(existing?.effectiveDate ?? today());
  const [status, setStatus] = useState<LetterStatus>(existing?.status ?? "Draft");
  const [body, setBody] = useState(existing?.body ?? "");
  const [fields, setFields] = useState<Record<string, string>>(existing?.fields ?? {});
  
  // UI view controls: split (side-by-side), form (full width form), preview (full width preview)
  const [viewMode, setViewMode] = useState<"split" | "form" | "preview">("split");
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");

  const cfg = getLetterType(type)!;
  const emp = employees.find((e) => e.id === employeeId);

  // Template fields + signatories
  const formFields = useMemo(
    () => [...cfg.templateFields, "signatoryName", "signatoryDesignation"],
    [cfg],
  );

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        value: e.id,
        label: `${e.name} (${e.employeeId}) · ${e.designation} [${e.department}]`,
      })),
    [],
  );

  const letterTypeOptions = useMemo(
    () =>
      LETTER_TYPES.map((t) => ({
        value: t.id,
        label: `${t.name} — ${getCategoryShort(t.category)}`,
      })),
    [],
  );

  const statusOptions = useMemo(
    () =>
      STATUSES.map((s) => ({
        value: s,
        label: s,
      })),
    [],
  );

  const changeType = (next: string) => {
    const c = getLetterType(next)!;
    setType(next);
    setSubject(defaultSubject(c));
    const name = emp?.name ?? "";
    setBody(defaultBody(c, name, effectiveDate, fields));
    setTemplateDialogOpen(false);
    toast.info(`Switched template to ${c.name}`);
  };

  const autoFillFromProfile = (targetEmp = emp) => {
    if (!targetEmp) return;
    setFields((prev) => {
      const next = { ...prev };
      // Map relevant employee fields if currently empty
      if (!next.department && targetEmp.department) next.department = targetEmp.department;
      if (!next.designation && targetEmp.designation) next.designation = targetEmp.designation;
      if (!next.confirmedDesignation && targetEmp.designation) next.confirmedDesignation = targetEmp.designation;
      if (!next.currentDesignation && targetEmp.designation) next.currentDesignation = targetEmp.designation;
      if (!next.fromRole && targetEmp.designation) next.fromRole = targetEmp.designation;
      if (!next.reportingTo && targetEmp.reportsTo) next.reportingTo = targetEmp.reportsTo;
      if (!next.reportingManager && targetEmp.reportsTo) next.reportingManager = targetEmp.reportsTo;
      if (!next.currentReportingTo && targetEmp.reportsTo) next.currentReportingTo = targetEmp.reportsTo;
      if (!next.dutyStation && targetEmp.workLocation) next.dutyStation = targetEmp.workLocation;
      if (!next.workLocation && targetEmp.workLocation) next.workLocation = targetEmp.workLocation;
      if (!next.officeLocation && targetEmp.workLocation) next.officeLocation = targetEmp.workLocation;
      if (!next.fromLocation && targetEmp.workLocation) next.fromLocation = targetEmp.workLocation;
      if (!next.startDate && targetEmp.joinDate) next.startDate = targetEmp.joinDate;
      if (!next.joiningDate && targetEmp.joinDate) next.joiningDate = targetEmp.joinDate;
      if (!next.proposedJoiningDate && targetEmp.joinDate) next.proposedJoiningDate = targetEmp.joinDate;
      if (!next.monthlyGrossSalary && targetEmp.baseSalary) next.monthlyGrossSalary = String(targetEmp.baseSalary);
      if (!next.currentGrossSalary && targetEmp.baseSalary) next.currentGrossSalary = String(targetEmp.baseSalary);
      if (!next.prevGross && targetEmp.baseSalary) next.prevGross = String(targetEmp.baseSalary);
      if (!next.salary && targetEmp.baseSalary) next.salary = String(targetEmp.baseSalary);
      if (!next.employmentType) next.employmentType = "Full-Time Permanent";
      return next;
    });
  };

  const changeEmployee = (id: string) => {
    setEmployeeId(id);
    const targetEmp = employees.find((e) => e.id === id);
    if (targetEmp) {
      autoFillFromProfile(targetEmp);
      if (!body || body === defaultBody(cfg, "", effectiveDate, {})) {
        setBody(defaultBody(cfg, targetEmp.name, effectiveDate, fields));
      }
      toast.success(`Selected ${targetEmp.name} and auto-populated fields`);
    }
  };

  const resetBody = () => {
    setBody(defaultBody(cfg, emp?.name ?? "", effectiveDate, fields));
    toast.info("Opening paragraph reset to standard template wording");
  };

  const setField = (k: string, v: string) => {
    setFields((p) => ({ ...p, [k]: v }));
  };

  const applySignatory = (preset: { name: string; designation: string }) => {
    setFields((p) => ({
      ...p,
      signatoryName: preset.name,
      signatoryDesignation: preset.designation,
    }));
    toast.success(`Signatory set to ${preset.name}`);
  };

  const insertToken = (token: string) => {
    setBody((prev) => `${prev} ${token}`);
  };

  const draft: HRLetter = {
    id: existing?.id ?? "LTR-2026-NEW",
    type,
    employeeId,
    employeeIdCode: emp?.employeeId ?? "—",
    employeeName: emp?.name ?? "[Employee Name]",
    employeeEmail: emp?.email ?? "",
    employeeDepartment: emp?.department ?? "—",
    employeeDesignation: emp?.designation ?? "—",
    subject,
    issueDate,
    effectiveDate,
    status,
    body,
    fields,
    createdBy: currentUser?.name ?? "HR Admin",
    createdAt: existing?.createdAt ?? today(),
  };

  const save = () => {
    if (!employeeId) {
      toast.error("Please select an employee for this letter.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (existing) {
      updateLetter(existing.id, {
        type,
        employeeId,
        employeeName: emp?.name ?? existing.employeeName,
        employeeEmail: emp?.email ?? existing.employeeEmail,
        employeeDepartment: emp?.department ?? existing.employeeDepartment,
        employeeDesignation: emp?.designation ?? existing.employeeDesignation,
        subject,
        issueDate,
        effectiveDate,
        status,
        body,
        fields,
      });
      toast.success("Letter updated successfully");
      router.push(`/letters/${existing.id}`);
    } else {
      const created = createLetter({
        type,
        employeeId,
        employeeName: emp?.name ?? "",
        employeeEmail: emp?.email ?? "",
        subject,
        issueDate,
        effectiveDate,
        body,
        fields,
        status,
      });
      toast.success("Letter issued successfully");
      router.push(`/letters/${created.id}`);
    }
  };

  const TypeIcon = cfg.icon;

  const filteredLetterTypes = useMemo(() => {
    if (selectedCategoryTab === "all") return LETTER_TYPES;
    return LETTER_TYPES.filter((t) => t.category === selectedCategoryTab);
  }, [selectedCategoryTab]);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title={existing ? "Edit HR Letter" : "Compose HR Letter"}
        icon={FileSignature}
        iconColor="indigo"
        description={
          existing
            ? `Editing document ${existing.id} · ${cfg.name}`
            : "Generate official, formatted corporate letters with automated data prefilling and live print preview."
        }
        backHref={existing ? `/letters/${existing.id}` : "/letters"}
        backLabel={existing ? "Back to Document" : "Back to Letters"}
      >
        {/* View Mode controls on medium+ screens */}
        <div className="hidden items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-xs md:flex">
          <Button
            type="button"
            variant={viewMode === "split" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
            onClick={() => setViewMode("split")}
          >
            <Columns2 className="size-3.5" /> Split View
          </Button>
          <Button
            type="button"
            variant={viewMode === "form" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
            onClick={() => setViewMode("form")}
          >
            <LayoutGrid className="size-3.5" /> Form Only
          </Button>
          <Button
            type="button"
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="size-3.5" /> Full Preview
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl md:hidden"
          onClick={() => setViewMode((m) => (m === "preview" ? "form" : "preview"))}
        >
          <Eye className="size-4" /> {viewMode === "preview" ? "Edit Form" : "Preview"}
        </Button>

        <LetterPrintButton
          letter={draft}
          variant="outline"
          label="Print / PDF"
          className="h-10 rounded-xl font-medium"
        />

        <Button
          className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          onClick={save}
        >
          <Save className="size-4" /> {existing ? "Save Changes" : "Issue Letter"}
        </Button>
      </PageHeader>

      {/* Main Grid: Form Left, Workbench Preview Right */}
      <div
        className={
          viewMode === "split"
            ? "grid gap-6 lg:grid-cols-12"
            : viewMode === "form"
              ? "max-w-4xl mx-auto space-y-6"
              : "space-y-6"
        }
      >
        {/* =================================================================== */}
        {/* LEFT / FORM COLUMN */}
        {/* =================================================================== */}
        <div
          className={
            viewMode === "split"
              ? "space-y-6 lg:col-span-6 xl:col-span-5"
              : viewMode === "preview"
                ? "hidden"
                : "space-y-6"
          }
        >
          {/* Active Template Banner Card */}
          <Card className="overflow-hidden border-border/80">
            <CardHeader className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent p-5 dark:from-blue-950/20 dark:via-indigo-950/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${cfg.bgColor}`}
                  >
                    <TypeIcon className={`size-6 ${cfg.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {cfg.name}
                      </h3>
                      <Badge variant="outline" className="text-[11px] font-semibold">
                        {getCategoryLabel(cfg.category)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
                  </div>
                </div>

                {/* Dialog to visually browse all 17 templates */}
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-medium" />}>
                    <FileCheck2 className="size-3.5 text-blue-600" /> Change Template
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Letter Template</DialogTitle>
                      <DialogDescription>
                        Choose from 17 standardized HR letter templates across hiring, employment terms, discipline, and separation.
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs
                      value={selectedCategoryTab}
                      onValueChange={setSelectedCategoryTab}
                      className="w-full mt-2"
                    >
                      <TabsList className="w-full flex flex-wrap justify-start gap-1 p-1 h-auto bg-muted">
                        <TabsTrigger value="all" className="text-xs">
                          All ({LETTER_TYPES.length})
                        </TabsTrigger>
                        {LETTER_CATEGORIES.map((cat) => (
                          <TabsTrigger key={cat} value={cat} className="text-xs">
                            {getCategoryShort(cat)} (
                            {LETTER_TYPES.filter((t) => t.category === cat).length})
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <div className="grid gap-2.5 pt-4 sm:grid-cols-2">
                        {filteredLetterTypes.map((t) => {
                          const IconComp = t.icon;
                          const isSelected = t.id === type;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => changeType(t.id)}
                              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-blue-500 hover:shadow-xs ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-600"
                                  : "border-border bg-card hover:bg-muted/40"
                              }`}
                            >
                              <div
                                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${t.bgColor}`}
                              >
                                <IconComp className={`size-4.5 ${t.color}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-foreground">
                                    {t.name}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                  {t.description}
                                </p>
                                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                                  <span className="font-medium text-slate-600 dark:text-slate-400">
                                    {t.templateFields.length} fields
                                  </span>
                                  <span>•</span>
                                  <span>{getCategoryShort(t.category)}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: Employee Recipient & Auto-Fill Profile */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="size-4 text-blue-600" /> Employee Recipient
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select an employee to automatically link their record and populate details.
                  </CardDescription>
                </div>
                {emp && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    onClick={() => autoFillFromProfile(emp)}
                  >
                    <Sparkles className="size-3" /> Auto-fill from profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="employee-select" className="text-xs font-semibold">
                  Employee <span className="text-destructive">*</span>
                </Label>
                <SearchSelect
                  id="employee-select"
                  value={employeeId}
                  onChange={changeEmployee}
                  options={employeeOptions}
                  placeholder="Type to search employee by name, ID or department…"
                />
              </div>

              {/* Enhanced Employee Context Banner if selected */}
              {emp ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 border border-blue-200 dark:border-blue-800">
                      <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {emp.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-card shrink-0">
                          {emp.status}
                        </Badge>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <Briefcase className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.designation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.department}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.workLocation || "Headquarters"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">Joined {emp.joinDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                  <HelpCircle className="size-4 text-slate-400 shrink-0" />
                  <span>
                    No employee selected yet. Choose an employee above to preview customized terms.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Document Particulars & Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="size-4 text-blue-600" /> Letter Metadata & Workflow
              </CardTitle>
              <CardDescription className="text-xs">
                Configure issuance date, legal effective date, document status, and subject.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="letter-subject" className="text-xs font-semibold">
                    Subject Line <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => setSubject(defaultSubject(cfg))}
                  >
                    <RotateCcw className="size-2.5" /> Reset default
                  </Button>
                </div>
                <Input
                  id="letter-subject"
                  className="h-10 rounded-xl"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Official letter subject…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="issue-date" className="text-xs font-semibold">
                    Issue Date
                  </Label>
                  <Input
                    id="issue-date"
                    type="date"
                    className="h-10 rounded-xl"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Date stamped on the letterhead
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="effective-date" className="text-xs font-semibold">
                    Effective Date
                  </Label>
                  <Input
                    id="effective-date"
                    type="date"
                    className="h-10 rounded-xl"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Date terms become active
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="letter-status" className="text-xs font-semibold">
                  Workflow Status
                </Label>
                <SearchSelect
                  id="letter-status"
                  value={status}
                  onChange={(v) => v && setStatus(v as LetterStatus)}
                  options={statusOptions}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                <Lock className="size-3.5 text-slate-500 shrink-0" />
                <span>
                  All letters carry formal <strong className="font-semibold text-foreground">Private & Confidential</strong> classification by default.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Template-Specific Particulars */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-blue-600" /> {cfg.name} Particulars
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Dynamic terms and clauses rendered in the official letter body.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {cfg.templateFields.length} Parameters
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {cfg.templateFields.map((k) => {
                  const isDate = isDateField(k);
                  const isSalary =
                    k.toLowerCase().includes("salary") ||
                    k.toLowerCase().includes("gross") ||
                    k.toLowerCase().includes("basic") ||
                    k.toLowerCase().includes("allowance") ||
                    k.toLowerCase().includes("rent") ||
                    k.toLowerCase().includes("medical") ||
                    k.toLowerCase().includes("conveyance");
                  const isLong =
                    k === "reason" ||
                    k === "description" ||
                    k === "responsibilities" ||
                    k === "severanceDetails" ||
                    k === "summaryOfAllegation" ||
                    k === "briefAllegation" ||
                    k === "natureOfAllegation";

                  return (
                    <div
                      key={k}
                      className={
                        isLong
                          ? "space-y-1.5 sm:col-span-2"
                          : "space-y-1.5"
                      }
                    >
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`field-${k}`}
                          className="text-xs font-medium text-foreground"
                        >
                          {labelize(k)}
                        </Label>
                        {isSalary && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            BDT (৳)
                          </span>
                        )}
                      </div>

                      {isLong ? (
                        <Textarea
                          id={`field-${k}`}
                          className="min-h-20 rounded-xl text-xs"
                          value={fields[k] ?? ""}
                          onChange={(e) => setField(k, e.target.value)}
                          placeholder={`Enter ${labelize(k).toLowerCase()}…`}
                        />
                      ) : isDate ? (
                        <Input
                          id={`field-${k}`}
                          type="date"
                          className="h-10 rounded-xl text-xs"
                          value={fields[k] ?? ""}
                          onChange={(e) => setField(k, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={`field-${k}`}
                          type={isSalary ? "number" : "text"}
                          className="h-10 rounded-xl text-xs"
                          value={fields[k] ?? ""}
                          onChange={(e) => setField(k, e.target.value)}
                          placeholder={
                            isSalary ? "e.g. 75000" : `Enter ${labelize(k).toLowerCase()}…`
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Signatory & Authorization */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <UserCheck className="size-4 text-blue-600" /> Authorized Signatory
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Signatory details printed at the bottom of the formal letter.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Quick Select Signatory:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SIGNATORY_PRESETS.map((p) => (
                    <Button
                      key={p.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-lg font-normal"
                      onClick={() => applySignatory(p)}
                    >
                      {p.name} · <span className="text-muted-foreground">{p.designation}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="signatory-name" className="text-xs font-semibold">
                    Signatory Name
                  </Label>
                  <Input
                    id="signatory-name"
                    className="h-10 rounded-xl text-xs"
                    value={fields.signatoryName ?? ""}
                    onChange={(e) => setField("signatoryName", e.target.value)}
                    placeholder="e.g. Rahman Kabir"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signatory-designation" className="text-xs font-semibold">
                    Signatory Designation
                  </Label>
                  <Input
                    id="signatory-designation"
                    className="h-10 rounded-xl text-xs"
                    value={fields.signatoryDesignation ?? ""}
                    onChange={(e) => setField("signatoryDesignation", e.target.value)}
                    placeholder="e.g. Managing Director & CEO"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Opening Paragraph & Custom Body */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileSignature className="size-4 text-blue-600" /> Opening Paragraph & Text
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize the salutation and opening statement. Tokens like{" "}
                    <code className="text-blue-600 font-mono text-[11px]">{`{COMPANY}`}</code>{" "}
                    are automatically filled.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={resetBody}
                >
                  <RotateCcw className="size-3.5" /> Reset wording
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Token insertion helper buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-[11px] font-medium mr-1">Insert Token:</span>
                <button
                  type="button"
                  onClick={() => insertToken("{COMPANY}")}
                  className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] font-mono hover:bg-muted"
                >
                  {`{COMPANY}`}
                </button>
                <button
                  type="button"
                  onClick={() => insertToken(emp?.name ?? "[Employee Name]")}
                  className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] font-mono hover:bg-muted"
                >
                  [Employee Name]
                </button>
                <button
                  type="button"
                  onClick={() => insertToken(fields.designation || emp?.designation || "[Designation]")}
                  className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] font-mono hover:bg-muted"
                >
                  [Designation]
                </button>
                <button
                  type="button"
                  onClick={() => insertToken(effectiveDate)}
                  className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] font-mono hover:bg-muted"
                >
                  [Effective Date]
                </button>
              </div>

              <Textarea
                className="min-h-36 rounded-xl leading-relaxed text-sm font-normal"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type the formal opening paragraph…"
              />
            </CardContent>
          </Card>
        </div>

        {/* =================================================================== */}
        {/* RIGHT / LIVE PREVIEW WORKBENCH */}
        {/* =================================================================== */}
        <div
          className={
            viewMode === "split"
              ? "lg:col-span-6 xl:col-span-7 lg:sticky lg:top-6 lg:self-start space-y-3"
              : viewMode === "form"
                ? "hidden"
                : "max-w-5xl mx-auto space-y-3"
          }
        >
          {/* Workbench Header Toolbar */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <FileSignature className="size-4" />
              </span>
              <div>
                <span className="text-xs font-semibold text-foreground">
                  Live A4 Document Sheet
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] text-muted-foreground">
                  Official Header · Standard Margins
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md"
                  onClick={() => setPreviewZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <span className="w-10 text-center font-mono text-[11px] text-muted-foreground">
                  {Math.round(previewZoom * 100)}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md"
                  onClick={() => setPreviewZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </Button>
              </div>

              {/* Fullscreen view toggle */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-xs"
                onClick={() => setViewMode((m) => (m === "preview" ? "split" : "preview"))}
              >
                <Maximize2 className="size-3.5" />
                {viewMode === "preview" ? "Exit Fullscreen" : "Expand"}
              </Button>

              <LetterPrintButton
                letter={draft}
                variant="default"
                size="sm"
                label="Print Preview"
                className="h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-medium"
              />
            </div>
          </div>

          {/* Workbench Canvas Surface */}
          <div className="max-h-[84vh] overflow-auto rounded-2xl border border-slate-200/80 bg-slate-200/60 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-8 shadow-inner">
            <div
              className="mx-auto origin-top transition-transform duration-150"
              style={{
                transform: `scale(${previewZoom})`,
                width: "fit-content",
              }}
            >
              {/* Paper Elevation */}
              <div className="rounded-sm bg-white shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10">
                {renderLetter(draft)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewLetterPage() {
  return (
    <Suspense fallback={null}>
      <NewLetterPageInner />
    </Suspense>
  );
}
