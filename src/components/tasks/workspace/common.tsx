"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Flag, Inbox, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { personName } from "@/lib/tasks/domain";
import { taskStatus } from "@/lib/tasks/workspace-model";
import type { WorkspaceState, WorkspaceTask } from "@/lib/tasks/workspace-types";
import { cn } from "@/lib/utils";

export function WorkLabel({ children, label }: { children: ReactNode; label: string }) { return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>; }
export function WorkModal({ title, description, children, onClose, wide = false }: { title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className={cn("max-h-[90dvh] overflow-y-auto", wide && "sm:max-w-3xl")}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description ?? "Changes are saved in this browser's demo workspace."}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>;
}
export function WorkEmpty({ title = "A little room for something great", description = "Create your first task to get the work moving.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 text-center"><div className="chip bg-primary/10 p-4"><Inbox className="size-7 text-primary" /></div><h3 className="text-base font-semibold">{title}</h3><p className="max-w-md text-sm text-muted-foreground">{description}</p>{action}</div>;
}
const personColors = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700"];
export function WorkPeople({ state, ids, size = "sm" }: { state: WorkspaceState; ids: string[]; size?: "sm" | "lg" }) {
  return <div className="flex items-center -space-x-1.5">{ids.slice(0, 4).map((id) => { const person = state.people.find((p) => p.id === id); const color = state.people.findIndex((p) => p.id === id); return <Tooltip key={id}><TooltipTrigger render={<Avatar className={cn("border-2 border-card", size === "lg" ? "size-9" : "size-6")} />}><AvatarFallback className={cn("text-[10px] font-semibold", personColors[Math.max(0, color) % personColors.length])}>{person?.name.split(" ").map((s) => s[0]).slice(0, 2).join("") ?? "?"}</AvatarFallback></TooltipTrigger><TooltipContent>{personName(state, id)}</TooltipContent></Tooltip>; })}{ids.length > 4 && <Avatar className="size-6 border-2 border-card"><AvatarFallback className="text-[9px]">+{ids.length - 4}</AvatarFallback></Avatar>}{!ids.length && <span className="text-xs text-muted-foreground">Unassigned</span>}</div>;
}
export function WorkStatusBadge({ state, task }: { state: WorkspaceState; task: WorkspaceTask }) { const status = taskStatus(state, task); return <Badge variant="outline" className="gap-1.5 border-transparent text-[10px] font-medium" style={{ color: status?.color, backgroundColor: `${status?.color ?? "#64748b"}14` }}><span className="size-1.5 rounded-full" style={{ background: status?.color }} />{status?.name ?? task.status}</Badge>; }
export function WorkPriority({ value, label = false }: { value: string; label?: boolean }) { return <span className={cn("inline-flex items-center gap-1 text-[11px]", value === "Urgent" ? "text-rose-500" : value === "High" ? "text-amber-500" : value === "Medium" ? "text-blue-500" : "text-slate-400")} title={`${value} priority`}><Flag className="size-3.5" fill={value === "Urgent" ? "currentColor" : "none"} />{label && value}</span>; }
export type WorkAction = { label: string; onClick: () => void; icon?: ReactNode; danger?: boolean; disabled?: boolean };
export function WorkMenu({ actions, label = "More actions" }: { actions: WorkAction[]; label?: string }) { return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} className="size-7 shrink-0" />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-48">{actions.map((a, i) => <DropdownMenuItem key={`${a.label}-${i}`} disabled={a.disabled} variant={a.danger ? "destructive" : "default"} onClick={a.onClick}>{a.icon}{a.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>; }
export function OrderButtons({ up, down, first, last }: { up: () => void; down: () => void; first: boolean; last: boolean }) { return <div className="flex"><Button type="button" variant="ghost" size="icon-sm" aria-label="Move up" disabled={first} onClick={up}><ArrowUp className="size-3" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="Move down" disabled={last} onClick={down}><ArrowDown className="size-3" /></Button></div>; }
export { DropdownMenuSeparator };
