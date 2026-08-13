import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import type { Project, ProjectStatus } from "@/lib/projects";

export function ProjectDetailsDialog({
  project,
  onOpenChange,
}: {
  project: Project | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!project} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {project && (
          <>
            <DialogHeader>
              <DialogTitle>{project.project_name}</DialogTitle>
              <DialogDescription>
                {project.project_id} · {project.customer}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Status">
                <StatusBadge status={project.status as ProjectStatus} />
              </Detail>
              <Detail label="Presales Engineer">{project.presales_engineer}</Detail>
              <Detail label="Opportunity">{project.opportunity}</Detail>
              <Detail label="Pending Tasks">{project.pending_tasks}</Detail>
              <Detail label="Start Date">{project.start_date ?? "—"}</Detail>
              <Detail label="End Date">{project.end_date ?? "—"}</Detail>
              <Detail label="Description" className="sm:col-span-2">
                {project.description || "—"}
              </Detail>
              <Detail label="Created" className="sm:col-span-2">
                {new Date(project.created_at).toLocaleString()}
              </Detail>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`grid gap-1 ${className ?? ""}`}>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
