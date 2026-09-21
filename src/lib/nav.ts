import {
  LayoutDashboard,
  Users,
  UserRound,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CalendarClock,
  Wallet,
  Receipt,
  Plane,
  BadgeCheck,
  Target,
  LineChart,
  Settings,
  IdCard,
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
  items: NavItem[];
};

// Sidebar information architecture — mirrors the Frappe HR module set.
export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Employee",
    items: [
      { title: "My Profile", href: "/profile", icon: IdCard },
      { title: "My Attendance", href: "/my-attendance", icon: CalendarClock },
      { title: "My Salary Slips", href: "/payroll/slips", icon: Wallet },
    ],
  },
  {
    label: "Human Resources",
    items: [
      { title: "Employees", href: "/employees", icon: Users },
      { title: "Departments", href: "/departments", icon: Building2 },
      { title: "Designations", href: "/designations", icon: Briefcase },
      { title: "Attendance", href: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Time & Leave",
    items: [
      { title: "Leave Applications", href: "/leave", icon: CalendarDays },
      { title: "Leave Balances", href: "/leave/balances", icon: UserRound },
      { title: "Approvals", href: "/leave/approvals", icon: BadgeCheck, badge: "3" },
    ],
  },
  {
    label: "Payroll",
    items: [
      { title: "Salary Structures", href: "/payroll", icon: Wallet },
      { title: "Salary Slips", href: "/payroll/slips", icon: Receipt },
      { title: "Payroll Processing", href: "/payroll/processing", icon: LineChart },
    ],
  },
  {
    label: "Expenses",
    items: [
      { title: "Expense Claims", href: "/expenses", icon: Receipt },
      { title: "New Claim", href: "/expenses/new", icon: Plane },
      { title: "Approvals", href: "/expenses/approvals", icon: BadgeCheck, badge: "2" },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { title: "Job Openings", href: "/recruitment/jobs", icon: Briefcase },
      { title: "Applications", href: "/recruitment/applications", icon: Users },
    ],
  },
  {
    label: "Performance",
    items: [
      { title: "Appraisals", href: "/performance/appraisals", icon: Target },
      { title: "Goals", href: "/performance/goals", icon: LineChart },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];
