import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ENGINEERS,
  STATUSES,
  createProject,
  projectsQueryKey,
  updateProject,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "@/lib/projects";

const EMPTY: ProjectInput = {
  customer: "",
  opportunity: "",
  project_name: "",
  presales_engineer: ENGINEERS[0]!,
  status: "Planning",
  start_date: "",
  end_date: "",
  description: "",
  pending_tasks: 0,
};

export function ProjectDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProjectInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setForm({
        customer: project.customer,
        opportunity: project.opportunity,
        project_name: project.project_name,
        presales_engineer: project.presales_engineer,
        status: project.status as ProjectStatus,
        start_date: project.start_date,
        end_date: project.end_date,
        description: project.description,
        pending_tasks: project.pending_tasks,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, project]);

  const mutation = useMutation({
    mutationFn: async (values: ProjectInput) => {
      const payload: ProjectInput = {
        ...values,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
      };
      if (project) await updateProject(project.id, payload);
      else await createProject(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      toast.success(project ? `${project.project_id} updated` : "Project created");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {project ? `Edit ${project.project_id}` : "Create project"}
          </DialogTitle>
          <DialogDescription>
            Capture the presales engagement details for this opportunity.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Project Name" className="sm:col-span-2">
            <Input
              required
              value={form.project_name}
              onChange={(e) => set("project_name", e.target.value)}
              placeholder="SD-WAN Refresh — 42 Branch Sites"
            />
          </Field>
          <Field label="Customer">
            <Input
              required
              value={form.customer}
              onChange={(e) => set("customer", e.target.value)}
              placeholder="Northwind Logistics"
            />
          </Field>
          <Field label="Opportunity">
            <Input
              required
              value={form.opportunity}
              onChange={(e) => set("opportunity", e.target.value)}
              placeholder="OPP-88231"
            />
          </Field>
          <Field label="Presales Engineer">
            <Select
              value={form.presales_engineer}
              onValueChange={(v) => set("presales_engineer", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENGINEERS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Start Date">
            <Input
              type="date"
              value={form.start_date ?? ""}
              onChange={(e) => set("start_date", e.target.value)}
            />
          </Field>
          <Field label="End Date">
            <Input
              type="date"
              value={form.end_date ?? ""}
              onChange={(e) => set("end_date", e.target.value)}
            />
          </Field>
          <Field label="Pending Tasks">
            <Input
              type="number"
              min={0}
              value={form.pending_tasks}
              onChange={(e) => set("pending_tasks", Number(e.target.value))}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Scope, deliverables and current standing."
            />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
