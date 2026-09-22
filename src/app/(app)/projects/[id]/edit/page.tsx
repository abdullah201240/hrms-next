import { ProjectFormPage } from "@/components/tasks/project-form";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectFormPage id={id} />;
}
