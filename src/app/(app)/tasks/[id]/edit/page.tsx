import { TaskFormPage } from "@/components/tasks/task-form";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskFormPage id={id} />;
}
