"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/mock/data";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

const initials = currentUser.name
  .split(" ")
  .map((n) => n[0])
  .slice(0, 2)
  .join("");

export function NavUser() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-9 gap-2 rounded-xl border border-slate-200/50 bg-white px-2.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800">
            <Avatar className="size-6">
              <AvatarFallback style={{ backgroundColor: currentUser.avatarColor }} className="text-[11px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-semibold sm:inline">{currentUser.name}</span>
            <ChevronDown className="size-3.5 text-slate-400 dark:text-slate-500" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60 rounded-xl border border-slate-200/50 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#121826] dark:text-slate-100">
        <DropdownMenuLabel className="grid px-2.5 py-1.5">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{currentUser.name}</span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{currentUser.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
        <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" render={<Link href="/profile" />}>
          <User className="size-3.5 mr-2" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" render={<Link href="/settings" />}>
          <Settings className="size-3.5 mr-2" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
        <DropdownMenuItem className="rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 cursor-pointer" render={<Link href="/login" />}>
          <LogOut className="size-3.5 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
