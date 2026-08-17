import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];

export type ClientInput = {
  name: string;
  legal_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  sector: string;
  status: string;
};

export const clientsQueryKey = ["clients"] as const;

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createClient(input: ClientInput) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Debes iniciar sesión.");
  const { error } = await supabase.from("clients").insert({ ...input, created_by: userId });
  if (error) throw error;
}

export async function updateClient(id: string, input: ClientInput) {
  const { error } = await supabase.from("clients").update(input).eq("id", id);
  if (error) throw error;
}
