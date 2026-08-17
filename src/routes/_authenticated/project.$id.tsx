import { createFileRoute } from "@tanstack/react-router";
import ProjectDetail from "@/pages/ProjectDetail";

export const Route = createFileRoute(
  "/_authenticated/project/$id"
)({
  component: ProjectPage,
});

function ProjectPage() {
  return <ProjectDetail />;
}
