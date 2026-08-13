import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Activity, ListTodo, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { fetchProjects, projectsQueryKey, type ProjectStatus } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Backdoor Presales" },
      {
        name: "description",
        content:
          "Track total projects, active engagements and pending presales tasks at a glance in Backdoor.",
      },
      { property: "og:title", content: "Dashboard — Backdoor Presales" },
      {
        property: "og:description",
        content: "Presales portfolio metrics, active engagements and pending tasks.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  });

  const active = projects.filter((p) => p.status === "In Progress" || p.status === "Planning");
  const pendingTasks = projects.reduce((sum, p) => sum + p.pending_tasks, 0);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: FolderKanban, hint: "All engagements" },
    {
      label: "Active Projects",
      value: active.length,
      icon: Activity,
      hint: "Planning + in progress",
    },
    { label: "Pending Tasks", value: pendingTasks, icon: ListTodo, hint: "Across all projects" },
  ];

  const recent = [...projects]
    .sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""))
    .slice(0, 5);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Presales portfolio overview"
      actions={
        <Button asChild>
          <Link to="/projects">
            View projects <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="surface-panel rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-display mt-2 text-4xl font-semibold tracking-tight">
                  {isLoading ? "—" : value}
                </p>
              </div>
              <span className="rounded-lg border border-border bg-secondary p-2 text-primary">
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <section className="surface-panel mt-6 rounded-xl border border-border">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold">Recent projects</h2>
          <Link to="/projects" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </header>
        <ul className="divide-y divide-border">
          {recent.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.project_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.project_id} · {p.customer} · {p.presales_engineer}
                </p>
              </div>
              <StatusBadge status={p.status as ProjectStatus} />
              <span className="text-xs text-muted-foreground">{p.pending_tasks} tasks</span>
            </li>
          ))}
          {!isLoading && recent.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No projects yet — create your first one from the Projects page.
            </li>
          )}
        </ul>
      </section>
    </AppShell>
  );
}
