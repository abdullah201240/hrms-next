import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/shared/export-button";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Wallet,
  Receipt,
  UserPlus,
  Target,
  Building2,
  Briefcase,
  Settings,
  BarChart3,
  Bell,
  User,
  KeyRound,
  FileText,
  UserMinus,
  ArrowLeftRight,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  GitBranch,
  HeartPulse,
  FolderKanban,
  PieChart,
  ArrowLeft,
} from "lucide-react";

/** Tinted rounded icon-chip palettes (bg + foreground, light + dark). */
export const CHIP: Record<string, string> = {
  blue: "bg-blue-50/90 text-blue-600 border border-blue-100/90 dark:bg-blue-950/60 dark:border-blue-800/50 dark:text-blue-400",
  indigo: "bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe] dark:bg-blue-950/60 dark:border-blue-800/50 dark:text-blue-400",
  sky: "bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] dark:bg-sky-950/60 dark:border-sky-800/50 dark:text-sky-400",
  emerald: "bg-[#f2faf6] text-[#10b981] border border-[#d7f3e4] dark:bg-emerald-950/60 dark:border-emerald-800/50 dark:text-emerald-400",
  amber: "bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] dark:bg-amber-950/60 dark:border-amber-800/50 dark:text-amber-400",
  rose: "bg-[#fef2f2] text-[#f43f5e] border border-[#fee2e2] dark:bg-rose-950/60 dark:border-rose-800/50 dark:text-rose-400",
  violet: "bg-[#f5f3ff] text-[#7c3aed] border border-[#ede9fe] dark:bg-violet-950/60 dark:border-violet-800/50 dark:text-violet-400",
  teal: "bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1] dark:bg-teal-950/60 dark:border-teal-800/50 dark:text-teal-400",
  purple: "bg-[#faf5ff] text-[#8b5cf6] border border-[#f3e8ff] dark:bg-purple-950/60 dark:border-purple-800/50 dark:text-purple-400",
};

/**
 * Derive a contextual header icon + tint from the page title, so every screen
 * gets the mockup's icon-chip treatment without per-page wiring.
 */
export function detectIcon(title: string): { Icon: LucideIcon; color: string } {
  const t = title.toLowerCase();
  const pick = (
    re: RegExp,
    Icon: LucideIcon,
    color: string,
  ): { Icon: LucideIcon; color: string } | null => (re.test(t) ? { Icon, color } : null);

  return (
    pick(/attendance|timesheet|roster|check-?in|checkin|mark attend/, CalendarCheck, "blue") ||
    pick(/leave|holiday|vacation|balance|encash|block-?list/, CalendarDays, "blue") ||
    pick(/payroll|salary|wage|structure|slip|payslip|processing/, Wallet, "blue") ||
    pick(/expense|claim|reimburse|settlement/, Receipt, "blue") ||
    pick(/recruit|job|applicant|candidate|hiring|pipeline|opening/, UserPlus, "blue") ||
    pick(/performance|appraisal|goal|review|feedback|rating/, Target, "blue") ||
    pick(/skill/, Sparkles, "blue") ||
    pick(/training|program|event|course/, GraduationCap, "blue") ||
    pick(/department|division/, Building2, "blue") ||
    pick(/designation|grade|role/, Briefcase, "blue") ||
    pick(/employee|staff|headcount|people|workforce|self-?service/, Users, "blue") ||
    pick(/separation|resignation|exit|departure|intern/, UserMinus, "blue") ||
    pick(/transfer|promotion|relocate/, ArrowLeftRight, "blue") ||
    pick(/onboarding|offer|contract|joining|appointment|document/, FileText, "blue") ||
    pick(/insurance|medical|health|claim status/, HeartPulse, "blue") ||
    pick(/project/, FolderKanban, "blue") ||
    pick(/org-?chart|structure|hierarchy/, GitBranch, "blue") ||
    pick(/report|analytic|summary|dashboard/, BarChart3, "blue") ||
    pick(/chart|graph/, PieChart, "blue") ||
    pick(/notification/, Bell, "blue") ||
    pick(/setting|config|preference|company|organization|branch|default|setup/, Settings, "blue") ||
    pick(/password|security|account/, KeyRound, "blue") ||
    pick(/profile|my |account/, User, "blue") || { Icon: LayoutGrid, color: "blue" }
  );
}

export function PageHeader({
  title,
  description,
  children,
  icon,
  iconColor,
  showExport = false,
  exportWhat,
  backHref,
  backLabel,
  badge,
  avatar,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  showExport?: boolean;
  exportWhat?: string;
  backHref?: string;
  backLabel?: string;
  badge?: ReactNode;
  avatar?: ReactNode;
}) {
  const derived = detectIcon(title);
  const Icon = icon ?? derived.Icon;
  const chip = CHIP[iconColor ?? derived.color] ?? CHIP.blue;

  return (
    <div className="relative">
      {/* Exact atmospheric organic background wave matching reference mockup in top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 -z-10 h-72 w-[440px] overflow-hidden opacity-90 select-none transition-opacity dark:opacity-40"
      >
        <svg
          viewBox="0 0 400 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-4 -top-8 h-full w-full"
        >
          <path
            d="M120 0C180 40 220 110 270 140C320 170 380 160 410 150V0H120Z"
            className="fill-[#eaf0fa] dark:fill-blue-950/30"
            fillOpacity="0.7"
          />
          <path
            d="M200 0C250 50 280 90 330 110C370 125 410 115 430 100V0H200Z"
            className="fill-[#dbe6f8] dark:fill-indigo-950/20"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      {backHref ? (
        <div className="mb-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit gap-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            render={<Link href={backHref} />}
          >
            <ArrowLeft className="size-3.5" /> {backLabel ?? "Back"}
          </Button>
        </div>
      ) : null}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          {avatar ? (
            avatar
          ) : (
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${chip}`}>
              <Icon className="size-5 stroke-[2.2]" />
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
              {badge}
            </div>
            {description ? (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {children}
          {showExport ? <ExportButton what={exportWhat ?? title.toLowerCase()} /> : null}
        </div>
      </div>
    </div>
  );
}
