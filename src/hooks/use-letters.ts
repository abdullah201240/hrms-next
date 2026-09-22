"use client";

import { useSyncExternalStore } from "react";
import { getLetters, subscribeLetters } from "@/lib/mock/letters-store";
import type { HRLetter } from "@/lib/letters";

/** Reactive HR Letters list — reflects anything added / edited in the SPA session. */
export function useLetters(): HRLetter[] {
  return useSyncExternalStore(subscribeLetters, getLetters, getLetters);
}
