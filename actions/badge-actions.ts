"use server";
import { Badge, ProfileBadges } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function getBadgesForUser(
  uuid?: string
): Promise<ProfileBadges | null> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return null;

  const { data, error } = await supabase
    .from("badge_profile_junction")
    .select("*, badge:badge_id(*)")
    .eq("profile_id", uuid);

  if (error) {
    console.error("Error fetching badges:", error);
    throw error;
  }

  if (!data || data.length === 0) return null;

  const profileBadges: ProfileBadges = {
    meta: data.map((item) => ({
      id: item.id,
      profile_id: item.profile_id,
      badge_id: item.badge_id,
      created_at: item.created_at,
      badge_selected: item.badge_selected,
    })),
    badges: data
      .map((item) => item.badge)
      .filter((badge): badge is Badge => badge !== null),
  };

  return profileBadges;
}
