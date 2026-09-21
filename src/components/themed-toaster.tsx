"use client";

import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

// Sonner ships its own theme switch; feed it the active theme so toasts match
// manual light/dark toggles (not just the OS preference).
export function ThemedToaster() {
  const { theme, resolvedTheme } = useTheme();
  const toastTheme = (theme ?? resolvedTheme) as "light" | "dark" | "system" | undefined;
  return <Toaster position="top-right" theme={toastTheme} />;
}
