"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Flag, Inbox, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { personName } from "@/lib/tasks/domain";
import { taskStatus } from "@/lib/tasks/workspace-model";
import type { WorkspaceState, WorkspaceTask } from "@/lib/tasks/workspace-types";
import { cn } from "@/lib/utils";

export function WorkLabel({
  children,
  label,
  hint,
}: {
  children: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground/80">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function WorkModal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-h-[90dvh] overflow-y-auto rounded-2xl border-border bg-card p-6 shadow-xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description ?? "Changes are saved in this browser's demo workspace."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function WorkEmpty({
  title = "A little room for something great",
  description = "Create your first task to get the work moving.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3.5 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-xs ring-1 ring-blue-100 dark:from-blue-950/40 dark:to-indigo-950/30 dark:text-blue-400 dark:ring-blue-900/40">
        <Inbox className="size-7" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

const personColors = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300",
];

export function WorkPeople({
  state,
  ids,
  size = "sm",
}: {
  state: WorkspaceState;
  ids: string[];
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "size-6 text-[10px]",
    md: "size-7 text-[11px]",
    lg: "size-9 text-xs",
  };

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
      {ids.slice(0, 4).map((id) => {
        const person = state.people.find((p) => p.id === id);
        const colorIdx = Math.abs(id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
        return (
          <Tooltip key={id}>
            <TooltipTrigger
              render={
                <Avatar
                  className={cn(
                    "border-2 border-background shadow-2xs transition-transform hover:z-10 hover:scale-110",
                    sizeClasses[size],
                  )}
                />
              }
            >
              <AvatarFallback
                className={cn("font-bold", personColors[colorIdx % personColors.length])}
              >
                {person?.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("") ?? "?"}
              </AvatarFallback>
            </TooltipTrigger>
            <TooltipContent className="text-xs font-medium">
              {personName(state, id)}
            </TooltipContent>
          </Tooltip>
        );
      })}
      {ids.length > 4 && (
        <Avatar className={cn("border-2 border-background bg-muted", sizeClasses[size])}>
          <AvatarFallback className="font-semibold text-muted-foreground text-[10px]">
            +{ids.length - 4}
          </AvatarFallback>
        </Avatar>
      )}
      {!ids.length && (
        <span className="text-xs text-muted-foreground/80 italic">Unassigned</span>
      )}
    </div>
  );
}

export function WorkStatusBadge({
  state,
  task,
  className,
}: {
  state: WorkspaceState;
  task: WorkspaceTask;
  className?: string;
}) {
  const status = taskStatus(state, task);
  const color = status?.color ?? "#64748b";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold border transition-colors",
        className,
      )}
      style={{
        color: color,
        backgroundColor: `${color}14`,
        borderColor: `${color}30`,
      }}
    >
      <span className="size-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="truncate">{status?.name ?? task.status}</span>
    </Badge>
  );
}

export function WorkPriority({
  value,
  label = false,
  className,
}: {
  value: string;
  label?: boolean;
  className?: string;
}) {
  const styles: Record<string, { badge: string; icon: string; text: string }> = {
    Urgent: {
      badge: "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
      icon: "text-rose-600 dark:text-rose-400",
      text: "Urgent",
    },
    High: {
      badge: "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
      icon: "text-amber-600 dark:text-amber-400",
      text: "High",
    },
    Medium: {
      badge: "bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
      icon: "text-blue-600 dark:text-blue-400",
      text: "Medium",
    },
    Low: {
      badge: "bg-slate-50 text-slate-600 border-slate-200/70 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/40",
      icon: "text-slate-400 dark:text-slate-500",
      text: "Low",
    },
  };

  const cur = styles[value] ?? styles.Low;

  if (label) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
          cur.badge,
          className,
        )}
      >
        <Flag className={cn("size-3 shrink-0", cur.icon)} fill="currentColor" />
        <span>{cur.text}</span>
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center", cur.icon, className)}
      title={`${value} priority`}
    >
      <Flag className="size-3.5" fill={value === "Urgent" ? "currentColor" : "none"} />
    </span>
  );
}

export type WorkAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

export function WorkMenu({
  actions,
  label = "More actions",
}: {
  actions: WorkAction[];
  label?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className="size-7 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48 rounded-xl p-1 shadow-lg">
        {actions.map((a, i) => (
          <DropdownMenuItem
            key={`${a.label}-${i}`}
            disabled={a.disabled}
            variant={a.danger ? "destructive" : "default"}
            onClick={a.onClick}
            className="gap-2 text-xs font-medium cursor-pointer"
          >
            {a.icon}
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrderButtons({
  up,
  down,
  first,
  last,
}: {
  up: () => void;
  down: () => void;
  first: boolean;
  last: boolean;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Move up"
        className="size-6 rounded-md text-muted-foreground hover:text-foreground"
        disabled={first}
        onClick={up}
      >
        <ArrowUp className="size-3" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Move down"
        className="size-6 rounded-md text-muted-foreground hover:text-foreground"
        disabled={last}
        onClick={down}
      >
        <ArrowDown className="size-3" />
      </Button>
    </div>
  );
}

export { DropdownMenuSeparator };
