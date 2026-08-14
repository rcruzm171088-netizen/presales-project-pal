import type { ProjectStatus } from "@/lib/projects";

const MAP = {
  "En Proceso":
    "border-primary/40 bg-primary/10 text-primary",

  Ganado:
    "border-success/40 bg-success/10 text-success",

  Perdido:
    "border-destructive/40 bg-destructive/10 text-destructive",

  Cancelado:
    "border-muted/40 bg-muted/10 text-muted-foreground",

  Standby:
    "border-warning/40 bg-warning/10 text-warning",
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
