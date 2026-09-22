"use client";

import { useSyncExternalStore } from "react";
import {
  getLeaveApplications,
  subscribeLeaveApplications,
} from "@/lib/mock/leave-store";
import type { LeaveApplication } from "@/lib/mock/data";

/** Reactive Leave Application list — reflects anything added via /leave/apply. */
export function useLeaveApplications(): LeaveApplication[] {
  return useSyncExternalStore(
    subscribeLeaveApplications,
    getLeaveApplications,
    getLeaveApplications,
  );
}
