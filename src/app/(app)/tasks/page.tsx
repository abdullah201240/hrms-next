import { TasksPage } from "@/components/tasks/task-views";

export default async function Page({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  return <TasksPage projectId={project} />;
}
