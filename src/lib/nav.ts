import {
  LayoutDashboard,
  IdCard,
  CalendarClock,
  Wallet,
  Users,
  Building2,
  Briefcase,
  Award,
  Layers,
  Network,
  CalendarCheck,
  CalendarDays,
  Clock,
  MapPin,
  UserCheck,
  UserX,
  Repeat,
  Activity,
  BadgeCheck,
  Target,
  Milestone,
  Ban,
  HandCoins,
  Shield,
  FileText,
  TrendingUp,
  Receipt,
  Plane,
  Car,
  Kanban,
  MessagesSquare,
  FileSignature,
  ClipboardList,
  UserPlus,
  GitBranch,
  LineChart,
  BarChart3,
  Settings,
  UserCog,
  BookOpen,
  SlidersHorizontal,
  ClipboardCheck,
  Mail,
  Wrench,
  ListChecks,
  Calculator,
  Bell,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

// Sidebar information architecture — mirrors the Frappe HR workspace set
// (HR Setup, Shift & Attendance, Leaves, Payroll, Expenses, Recruitment,
// Performance, Reports).
export const navSections: NavSection[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Employee (Self-Service)",
    icon: IdCard,
    items: [
      { title: "My Profile", href: "/profile", icon: IdCard },
      { title: "My Tasks", href: "/my-tasks", icon: ListChecks },
      { title: "My Attendance", href: "/my-attendance", icon: CalendarClock },
      { title: "My Salary Slips", href: "/payroll/slips", icon: Wallet },
      { title: "My Timesheets", href: "/attendance/my-timesheets", icon: ClipboardList },
      { title: "My Leave", href: "/my-leave", icon: CalendarDays },
      { title: "My Salary", href: "/my-salary", icon: Wallet },
      { title: "My Expense Claims", href: "/my-claims", icon: Receipt },
      { title: "My Advances", href: "/my-advance", icon: HandCoins },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Change Password", href: "/change-password", icon: KeyRound },
    ],
  },
  {
    label: "Human Resources",
    icon: Users,
    items: [
      { title: "Employees", href: "/employees", icon: Users },
      { title: "Departments", href: "/departments", icon: Building2 },
      { title: "Designations", href: "/designations", icon: Briefcase },
      { title: "Employment Types", href: "/employment-types", icon: Briefcase },
      { title: "Employee Grades", href: "/employee-grades", icon: Award },
      { title: "Employee Groups", href: "/employee-groups", icon: Layers },
      { title: "Branches", href: "/branches", icon: GitBranch },
      { title: "Company", href: "/company", icon: Building2 },
      { title: "Organizational Chart", href: "/org-chart", icon: Network },
    ],
  },
  {
    label: "Projects & Tasks",
    icon: Kanban,
    items: [
      { title: "All Tasks", href: "/tasks", icon: ClipboardList },
      { title: "Projects", href: "/projects", icon: Kanban },
      { title: "Project Templates", href: "/projects/templates", icon: Layers },
    ],
  },
  {
    label: "Letters",
    icon: FileSignature,
    items: [
      { title: "All Letters", href: "/letters", icon: FileText },
      { title: "New Letter", href: "/letters/new", icon: FileSignature },
    ],
  },
  {
    label: "Attendance",
    icon: CalendarClock,
    items: [
      { title: "Attendance", href: "/attendance", icon: CalendarCheck },
      { title: "Mark Attendance", href: "/attendance/mark-attendance", icon: ClipboardCheck },
      { title: "Daily Work Summary", href: "/attendance/daily-work-summary", icon: Mail },
      { title: "Employee Checkin", href: "/attendance/checkin", icon: Clock },
      { title: "Attendance Requests", href: "/attendance/attendance-requests", icon: UserCheck },
      { title: "Compensatory Leave", href: "/attendance/compensatory-leave", icon: UserX },
      { title: "Timesheets", href: "/attendance/timesheets", icon: ClipboardList },
    ],
  },
  {
    label: "Leaves",
    icon: CalendarDays,
    items: [
      { title: "Leave Applications", href: "/leave", icon: CalendarDays },
      { title: "My Leave Balances", href: "/leave/balances", icon: Wallet },
      { title: "Apply Leave", href: "/leave/apply", icon: Plane },
      { title: "Approvals", href: "/leave/approvals", icon: BadgeCheck, badge: "3" },
      { title: "Leave Types", href: "/leave/types", icon: Layers },
      { title: "Leave Ledger", href: "/leave/ledger", icon: BookOpen },
      { title: "Leave Adjustment", href: "/leave/adjustment", icon: SlidersHorizontal },
      { title: "Earned Leave Schedule", href: "/leave/earned-leave-schedule", icon: CalendarClock },
      { title: "Leave Allocation", href: "/leave/allocations", icon: UserCheck },
      { title: "Leave Period", href: "/leave/periods", icon: CalendarClock },
      { title: "Leave Policy", href: "/leave/policies", icon: Shield },
      { title: "Policy Assignment", href: "/leave/policy-assignments", icon: UserCog },
      { title: "Holidays", href: "/leave/holidays", icon: CalendarCheck },
      { title: "Holiday List Assignment", href: "/leave/holiday-list-assignment", icon: UserCheck },
      { title: "Leave Block List", href: "/leave/block-list", icon: Ban },
      { title: "Leave Encashment", href: "/leave/encashment", icon: HandCoins },
      { title: "Leave Control Panel", href: "/leave/control-panel", icon: Target },
    ],
  },
  {
    label: "Payroll",
    icon: Wallet,
    items: [
      { title: "Salary Templates", href: "/payroll", icon: Wallet },
      { title: "Assign Salary", href: "/payroll/assignments", icon: UserCog },
      { title: "Salary Slips", href: "/payroll/slips", icon: Receipt },
      { title: "Payroll Run", href: "/payroll/processing", icon: LineChart },
    ],
  },
  {
    label: "Expenses",
    icon: Receipt,
    items: [
      { title: "Expense Claims", href: "/expenses", icon: Receipt },
      { title: "New Claim", href: "/expenses/new", icon: Plane },
      { title: "Approvals", href: "/expenses/approvals", icon: BadgeCheck, badge: "2" },
      { title: "Expense Claim Types", href: "/expenses/types", icon: Layers },
      { title: "Full & Final Statement", href: "/expenses/full-and-final", icon: Calculator },
      { title: "Vehicle Service", href: "/expenses/vehicle-service", icon: Wrench },
      { title: "Travel Requests", href: "/expenses/travel-requests", icon: Car },
      { title: "Purpose of Travel", href: "/expenses/purpose-of-travel", icon: Layers },
    ],
  },
  {
    label: "Recruitment",
    icon: Briefcase,
    items: [
      { title: "Job Openings", href: "/recruitment/jobs", icon: Briefcase },
      { title: "Job Applicants", href: "/recruitment/applications", icon: Users },
      { title: "Hiring Pipeline", href: "/recruitment/pipeline", icon: Kanban },
      { title: "Interviews", href: "/recruitment/interviews", icon: MessagesSquare },
      { title: "Interview Rounds", href: "/recruitment/interview-rounds", icon: Layers },
      { title: "Interview Types", href: "/recruitment/interview-types", icon: SlidersHorizontal },
      { title: "Job Offers", href: "/recruitment/offers", icon: FileSignature },
      { title: "Appointment Letters", href: "/recruitment/appointment-letters", icon: FileText },
      { title: "Job Opening Templates", href: "/recruitment/job-opening-templates", icon: FileText },
      { title: "Job Offer Term Templates", href: "/recruitment/job-offer-term-templates", icon: FileSignature },
      { title: "Appointment Letter Templates", href: "/recruitment/appointment-letter-templates", icon: FileText },
      { title: "Job Requisitions", href: "/recruitment/requisitions", icon: ClipboardList },
      { title: "Staffing Plans", href: "/recruitment/staffing-plans", icon: Target },
      { title: "Employee Referrals", href: "/recruitment/referrals", icon: UserPlus },
    ],
  },
  {
    label: "Performance",
    icon: Target,
    items: [
      { title: "Appraisals", href: "/performance/appraisals", icon: Target },
      { title: "Appraisal Cycles", href: "/performance/cycles", icon: CalendarClock },
      { title: "Appraisal Templates", href: "/performance/templates", icon: FileText },
      { title: "KRA", href: "/performance/kra", icon: Milestone },
      { title: "Goals", href: "/performance/goals", icon: Activity },
      { title: "Promotions", href: "/performance/promotions", icon: TrendingUp },
      { title: "Performance Feedback", href: "/performance/feedback", icon: MessagesSquare },
      { title: "Feedback Criteria", href: "/performance/feedback-criteria", icon: ListChecks },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [{ title: "Reports", href: "/reports", icon: BarChart3 }],
  },
  {
    label: "System",
    icon: Settings,
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

/**
 * Resolves the single active nav href for a pathname using longest-match
 * (most-specific) wins. A route matches an item when it is exactly the href or
 * a descendant of it (href + "/"), but only the LONGEST matching href is
 * returned so that nested sibling routes never light up their parent too —
 * e.g. /attendance/mark-attendance activates "Mark Attendance" only, not also
 * "Attendance" (/attendance). Returns null when nothing matches.
 */
export function resolveActiveHref(pathname: string): string | null {
  let best: string | null = null;
  for (const section of navSections) {
    for (const item of section.items) {
      const h = item.href;
      const matches =
        pathname === h || (h !== "/dashboard" && pathname.startsWith(h + "/"));
      if (matches && (best === null || h.length > best.length)) best = h;
    }
  }
  return best;
}
