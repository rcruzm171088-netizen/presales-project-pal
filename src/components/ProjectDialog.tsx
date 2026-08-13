import { useEffect, useState } from "react";
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
  useStore,
  type Project,
  type ProjectStatus,
} from "@/lib/projects-store";

type FormState = Omit<Project, "id">;

const EMPTY: FormState = {
  customer: "",
  opportunity: "",
  name: "",
  engineer: ENGINEERS[0],
  status: "Planning",
  startDate: "",
  endDate: "",
  description: "",
  pendingTasks: 0,
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
  const { addProject, updateProject } = useStore();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (project) {
      const { id: _id, ...rest } = project;
      setForm(rest);
    } else {
      setForm(EMPTY);
    }
  }, [open, project]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      updateProject(project.id, form);
      toast.success(`${project.id} updated`);
    } else {
      addProject(form);
      toast.success("Project created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? `Edit ${project.id}` : "Create project"}</DialogTitle>
          <DialogDescription>
            Capture the presales engagement details for this opportunity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Project Name" className="sm:col-span-2">
            <Input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
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
            <Select value={form.engineer} onValueChange={(v) => set("engineer", v)}>
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
              required
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field label="End Date">
            <Input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </Field>
          <Field label="Pending Tasks">
            <Input
              type="number"
              min={0}
              value={form.pendingTasks}
              onChange={(e) => set("pendingTasks", Number(e.target.value))}
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
            <Button type="submit">{project ? "Save changes" : "Create project"}</Button>
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
