import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ProjectStatus } from "@/lib/constants";

export type { ProjectStatus } from "@/lib/constants";
export { PROJECT_STATUSES as STATUSES, PRESALES_ENGINEERS as ENGINEERS } from "@/lib/constants";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type ProjectInput = {
  project_name: string;
  client_id: string | null;
  customer: string;
  legal_name: string;
  client_contact: string;
  client_email: string;
  client_phone: string;
  sales_rep: string;
  business_line: string;
  presales_engineer: string;
  presales_engineer_id: string | null;
  presales_lead_id: string | null;
  opportunity: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  priority: string;
};

export const projectsQueryKey = ["projects"] as const;
export const profilesQueryKey = ["profiles"] as const;

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProject(input: ProjectInput) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Debes iniciar sesión para crear un proyecto.");
  const { error } = await supabase.from("projects").insert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function updateProject(id: string, input: Partial<ProjectInput>) {
  const { error } = await supabase.from("projects").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchPresalesUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return data ?? [];
}
