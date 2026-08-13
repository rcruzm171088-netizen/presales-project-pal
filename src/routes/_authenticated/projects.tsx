import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectDialog } from "@/components/ProjectDialog";
import { ProjectDetailsDialog } from "@/components/ProjectDetailsDialog";
import {
  deleteProject,
  fetchProjects,
  projectsQueryKey,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Backdoor Presales" },
      {
        name: "description",
        content:
          "Create, edit, search and delete presales projects with customer, opportunity, engineer and status details.",
      },
      { property: "og:title", content: "Projects — Backdoor Presales" },
      {
        property: "og:description",
        content: "Manage the full presales project register in one place.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  });

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [viewing, setViewing] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      toast.success("Project deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [
        p.project_id,
        p.customer,
        p.opportunity,
        p.project_name,
        p.presales_engineer,
        p.status,
        p.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [projects, query]);

  return (
    <AppShell
      title="Projects"
      subtitle={`${filtered.length} of ${projects.length} projects`}
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> New project
        </Button>
      }
    >
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ID, customer, opportunity, engineer…"
          className="pl-9"
        />
      </div>

      <div className="surface-panel mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Project ID</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Opportunity</th>
              <th className="px-4 py-3 font-medium">Engineer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="align-top hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {p.project_id}
                </td>
                <td className="max-w-[280px] px-4 py-3">
                  <p className="font-medium">{p.project_name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                </td>
                <td className="px-4 py-3">{p.customer}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {p.opportunity}
                </td>
                <td className="px-4 py-3">{p.presales_engineer}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status as ProjectStatus} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.start_date ?? "—"}
                  <br />
                  {p.end_date ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${p.project_name}`}
                      onClick={() => setViewing(p)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${p.project_name}`}
                      onClick={() => {
                        setEditing(p);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${p.project_name}`}
                      onClick={() => setPendingDelete(p)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  Loading projects…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  {query ? `No projects match “${query}”.` : "No projects yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editing} />
      <ProjectDetailsDialog project={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.project_id} — {pendingDelete?.project_name} will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) removeMutation.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
