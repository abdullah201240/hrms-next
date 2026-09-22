import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";

/** Tinted rounded icon-chip palettes (bg + foreground, light + dark). */
export const CHIP: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300",
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300",
};

/**
 * Derive a contextual header icon + tint from the page title, so every screen
 * gets the mockup's icon-chip treatment without per-page wiring. Callers can
 * still override via the explicit `icon` / `iconColor` props.
 */
export function detectIcon(title: string): { Icon: LucideIcon; color: string } {
  const t = title.toLowerCase();
  const pick = (
    re: RegExp,
    Icon: LucideIcon,
    color: string,
  ): { Icon: LucideIcon; color: string } | null => (re.test(t) ? { Icon, color } : null);

  return (
    pick(/attendance|timesheet|roster|check-?in|checkin|mark attend/, CalendarCheck, "emerald") ||
    pick(/leave|holiday|vacation|balance|encash|block-?list/, CalendarDays, "amber") ||
    pick(/payroll|salary|wage|structure|slip|payslip|processing/, Wallet, "indigo") ||
    pick(/expense|claim|reimburse|settlement/, Receipt, "rose") ||
    pick(/recruit|job|applicant|candidate|hiring|pipeline|opening/, UserPlus, "sky") ||
    pick(/performance|appraisal|goal|review|feedback|rating/, Target, "violet") ||
    pick(/skill/, Sparkles, "teal") ||
    pick(/training|program|event|course/, GraduationCap, "purple") ||
    pick(/department|division/, Building2, "sky") ||
    pick(/designation|grade|role/, Briefcase, "indigo") ||
    pick(/employee|staff|headcount|people|workforce|self-?service/, Users, "indigo") ||
    pick(/separation|resignation|exit|departure|intern/, UserMinus, "rose") ||
    pick(/transfer|promotion|relocate/, ArrowLeftRight, "amber") ||
    pick(/onboarding|offer|contract|joining|appointment|document/, FileText, "sky") ||
    pick(/insurance|medical|health|claim status/, HeartPulse, "rose") ||
    pick(/project/, FolderKanban, "indigo") ||
    pick(/org-?chart|structure|hierarchy/, GitBranch, "violet") ||
    pick(/report|analytic|summary|dashboard/, BarChart3, "sky") ||
    pick(/chart|graph/, PieChart, "purple") ||
    pick(/notification/, Bell, "amber") ||
    pick(/setting|config|preference|company|organization|branch|default|setup/, Settings, "indigo") ||
    pick(/password|security|account/, KeyRound, "rose") ||
    pick(/profile|my |account/, User, "teal") || { Icon: LayoutGrid, color: "indigo" }
  );
}

export function PageHeader({
  title,
  description,
  children,
  icon,
  iconColor,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
}) {
  const derived = detectIcon(title);
  const Icon = icon ?? derived.Icon;
  const chip = CHIP[iconColor ?? derived.color] ?? CHIP.indigo;

  return (
    <div className="relative overflow-hidden pb-5">
      {/* Decorative soft gradient blobs (mockup header treatment). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-20 size-60 rounded-full bg-gradient-to-br from-indigo-300/35 via-sky-200/30 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-40 -top-12 size-40 rounded-full bg-gradient-to-br from-violet-300/25 to-transparent blur-3xl"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`chip flex size-12 shrink-0 items-center justify-center ${chip}`}>
            <Icon className="size-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
