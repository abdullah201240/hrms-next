import { Suspense } from "react";
import { WorkspaceApp, WorkspaceLoading } from "@/components/tasks/workspace/workspace-app";

export default function WorkspacePage() {
  return <Suspense fallback={<WorkspaceLoading />}><WorkspaceApp /></Suspense>;
}
