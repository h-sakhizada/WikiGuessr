"use server";
import { createClient } from "@/utils/supabase/server";

export interface Profile {
  id: string;
  username: string;
  email: string;
}
export async function getProfile(uuid?: string): Promise<Profile | null> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return null;

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", uuid)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error);
    throw error;
  }

  return data as Profile | null;
}

export async function editProfile(profile: Profile): Promise<Profile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profile")
    .upsert(profile)
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data as Profile;
}
