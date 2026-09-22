"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor } from "lucide-react";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36 rounded-xl border border-slate-200/90 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-[#121826] dark:text-slate-100">
        <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" onClick={() => setTheme("light")}>
          <Sun className="size-3.5 mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" onClick={() => setTheme("dark")}>
          <Moon className="size-3.5 mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" onClick={() => setTheme("system")}>
          <Monitor className="size-3.5 mr-2" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
