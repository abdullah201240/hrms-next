import { TaskFormPage } from "@/components/tasks/task-form";

export default async function Page({ searchParams }: { searchParams: Promise<{ project?: string; parent?: string }> }) {
  const { project, parent } = await searchParams;
  return <TaskFormPage projectId={project} parentId={parent} />;
}
