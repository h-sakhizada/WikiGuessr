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

export async function getAllBadges(): Promise<Badge[] | null> {
  const supabase = createClient();

  const { data, error } = await supabase.from("badge").select("*");

  if (error) {
    console.error("Error fetching badges:", error);
    throw error;
  }

  if (!data || data.length === 0) return null;

  return data as Badge[];
}

export async function addBadgeToUserCollection(
  badgeId: string,
  uuid?: string
): Promise<boolean> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return false;

  const { error } = await supabase
    .from("badge_profile_junction")
    .insert({ badge_id: badgeId, profile_id: uuid, badge_selected: false });

  if (error) {
    console.error("Error processing game results:", error);
    throw error;
  }
  return true;
}

export async function addRandomBadgeToUserCollection(
  uuid?: string
): Promise<boolean> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return false;

  const payload = await getBadgesForUser();
  const userBadges = payload?.badges as Badge[];

  let badgePool = await getAllBadges();

  if (!badgePool || badgePool.length === 0) return false;

  if (userBadges && userBadges.length > 0) {
    badgePool = badgePool.filter(
      (badge) => !userBadges.some((userBadge) => userBadge.id === badge.id)
    );
    if (!badgePool || badgePool.length === 0) return false;
  }

  const awardedBadgeId =
    badgePool[Math.floor(Math.random() * badgePool.length)].id;

  const result = await addBadgeToUserCollection(awardedBadgeId);
  return result;
}
