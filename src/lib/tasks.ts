import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { TaskStatus } from "@/lib/constants";

export type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  task_assignees?: { user_id: string }[];
};

export type TaskInput = {
  project_id: string | null;
  title: string;
  description: string;
  priority: string;
  due_date: string | null;
  status: TaskStatus;
};

export const tasksQueryKey = ["tasks"] as const;

export async function fetchTasks(projectId?: string): Promise<Task[]> {
  let q = supabase
    .from("tasks")
    .select("*, task_assignees(user_id)")
    .order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function createTask(input: TaskInput, assignees: string[]) {
  const { data, error } = await supabase.from("tasks").insert(input).select("id").single();
  if (error) throw error;
  if (assignees.length) {
    const { error: aErr } = await supabase
      .from("task_assignees")
      .insert(assignees.map((user_id) => ({ task_id: data.id, user_id })));
    if (aErr) throw aErr;
  }
}

export async function updateTask(id: string, input: Partial<TaskInput>, assignees?: string[]) {
  const patch: Record<string, unknown> = { ...input };
  if (input.status === "Completada") patch['completed_at'] = new Date().toISOString();
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw error;
  if (assignees) {
    await supabase.from("task_assignees").delete().eq("task_id", id);
    if (assignees.length) {
      await supabase
        .from("task_assignees")
        .insert(assignees.map((user_id) => ({ task_id: id, user_id })));
    }
  }
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export function isOverdue(task: { due_date: string | null; status: string }) {
  if (!task.due_date || task.status === "Completada") return false;
  return task.due_date < new Date().toISOString().slice(0, 10);
}
