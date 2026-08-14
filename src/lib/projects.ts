import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInput = {
  customer: string;
  opportunity: string;
  project_name: string;
  presales_engineer: string;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  description: string;
  pending_tasks: number;
};

export type ProjectStatus =
  | "En Proceso"
  | "Ganado"
  | "Perdido"
  | "Cancelado"
  | "Standby";

export const STATUSES = [
  "En Proceso",
  "Ganado",
  "Perdido",
  "Cancelado",
  "Standby",
];

export const ENGINEERS = [
  "Ana Villalobos",
  "Marcus Deane",
  "Priya Raghavan",
  "Tomás Ferreira",
  "Julia Kowalski",
  "Daniel Okafor",
];

export const projectsQueryKey = ["projects"] as const;

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProject(input: ProjectInput) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("You must be signed in to create a project.");
  const { error } = await supabase.from("projects").insert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function updateProject(id: string, input: ProjectInput) {
  const { error } = await supabase.from("projects").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
/****/
export async function fetchPresalesUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      is_active
    `)
    .eq("is_active", true)
    .order("full_name");

  if (error) throw error;

  return data ?? [];
}
