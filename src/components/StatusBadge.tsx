import type { ProjectStatus } from "@/lib/projects";

const MAP: Record<ProjectStatus, string> = {
  Planning: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  "In Progress": "border-primary/40 bg-primary/10 text-primary",
  "On Hold": "border-warning/40 bg-warning/10 text-warning",
  Completed: "border-success/40 bg-success/10 text-success",
  Cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${MAP[status]}`}
    >
      {status}
    </span>
  );
}
