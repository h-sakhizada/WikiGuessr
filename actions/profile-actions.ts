"use server";
import { Profile } from "@/types";
import { createClient } from "@/utils/supabase/server";

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

export async function setProfileToPremium(uuid?: string): Promise<void> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return;

  const { error } = await supabase
    .from("profile")
    .update({ is_premium: true })
    .eq("id", uuid);

  if (error) {
    console.error("Error setting profile to premium:", error);
    throw error;
  }
}

export async function setProfileToFree(uuid?: string): Promise<void> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return;

  const { error } = await supabase
    .from("profile")
    .update({ is_premium: false })
    .eq("id", uuid);

  if (error) {
    console.error("Error setting profile to free:", error);
    throw error;
  }
}

export async function getVictories(uuid?: string): Promise<[]> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return [];

  const { data, error: selectError } = await supabase
    .from("profile")
    .select("victories")
    .eq("id", uuid)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    console.error("Error fetching profile:", selectError);
    throw selectError;
  }
  return data?.victories ?? [];
}

export async function addVictory(
  victory: string,
  uuid?: string
): Promise<void> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return;

  const victories = await getVictories(uuid);
  const updatedVictories = victories ? [...victories, victory] : [victory];
  const { error: updateError } = await supabase
    .from("profile")
    .update({ victories: updatedVictories })
    .eq("id", uuid);

  if (updateError) {
    console.error("Error processing game results:", updateError);
    throw updateError;
  }
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("profile").select("*");

  if (error) {
    console.error("Error fetching all profiles:", error);
    throw error;
  }

  return data as Profile[];
}
