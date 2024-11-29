"use server";
import { Badge, UserBadges } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function getBadgesForUser(
  uuid?: string
): Promise<UserBadges | null> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return null;

  const { data, error } = await supabase
    .from("badge_user_junction")
    .select("*, badge:badge_id(*)")
    .eq("user_id", uuid);

  if (error) {
    console.error("Error fetching badges:", error);
    throw error;
  }

  if (!data || data.length === 0) return null;

  const userBadges: UserBadges = {
    meta: data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      badge_id: item.badge_id,
      created_at: item.created_at,
      badge_selected: item.badge_selected,
    })),
    badges: data
      .map((item) => item.badge)
      .filter((badge): badge is Badge => badge !== null),
  };

  return userBadges;
}

export async function getAllBadges(): Promise<Badge[] | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("is_premium", { ascending: false });

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
    .from("badge_user_junction")
    .insert({ badge_id: badgeId, user_id: uuid, badge_selected: false });

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

  const uBadges = await getBadgesForUser();
  const userBadges = uBadges?.badges as Badge[];

  const aBadges = await getAllBadges();
  let badgePool = aBadges?.filter((b) => !b.is_premium);

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
