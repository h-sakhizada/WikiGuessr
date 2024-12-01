"use server";
import { User } from "@/types";
import { createClient } from "@/utils/supabase/server";

//  Actions to perform CRUD operations on users in supabase.
//------------------------------------------------------------------------------------------
export async function getUser(uuid?: string): Promise<User | null> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    uuid = user?.id;
  }

  if (!uuid) return null;

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", uuid)
    .maybeSingle();

  if (userError) {
    console.error("Error fetching user data:", userError);
    throw userError;
  }

  return userData;
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*");

  if (userError) {
    console.error("Error fetching users:", userError);
    throw userError;
  }

  return userData;
}

export async function deleteUser(uuid?: string): Promise<boolean> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) {
    console.error("No UUID provided or found for the user.");
    return false;
  }

  const { error } = await supabase.from("users").delete().eq("id", uuid);

  if (error) {
    console.error("Error deleting user:", error);
    return false;
  }

  return true;
}

export async function editUser(user: Partial<User>): Promise<User> {
  const supabase = createClient();

  // Only include the fields that are present in users table

  const { data, error } = await supabase.from("users").upsert(user).single();

  if (error) {
    console.error("Error updating user:", error);
    throw error;
  }

  return data as User;
}

// Premium / Free Helper Methods
//-------------------------------------------------------
export async function setUserToPremium(uuid?: string): Promise<void> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return;

  const { error } = await supabase
    .from("users")
    .update({ is_premium: true })
    .eq("id", uuid);

  if (error) {
    console.error("Error setting user to premium:", error);
    throw error;
  }
}

export async function setUserToFree(uuid?: string): Promise<void> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return;

  const { error } = await supabase
    .from("users")
    .update({ is_premium: false })
    .eq("id", uuid);

  if (error) {
    console.error("Error setting user to free:", error);
    throw error;
  }
}

export async function togglePremium(
  uuid: string,
  isPremium: boolean
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({ is_premium: !isPremium }) // Toggle the premium status
    .eq("id", uuid);

  if (error) {
    console.error("Error updating premium status:", error);
    return false;
  }

  return true;
}

// Badge_User helper function to change selected badge
export async function setSelectedBadge(badgeId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  var userId = user?.id;

  const { error: resetError } = await supabase
    .from("badge_user_junction")
    .update({ badge_selected: false })
    .eq("user_id", userId);

  if (resetError) {
    console.error("Error resetting badge selection:", resetError);
    throw resetError;
  }

  const { error, data } = await supabase
    .from("badge_user_junction")
    .update({ badge_selected: true })
    .match({ badge_id: badgeId, user_id: userId })
    .single();

  if (error) {
    console.error("Error updating badge selection:", error);
    throw error;
  }
}
export async function getSelectedBadge(): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  var userId = user?.id;

  if (!userId) return null; // No user is signed in

  const { data, error } = await supabase
    .from("badge_user_junction")
    .select("badge_id")
    .eq("user_id", userId)
    .eq("badge_selected", true)
    .single();

  if (error) {
    console.error("Error fetching selected badge:", error);
    throw error;
  }

  return data ? data.badge_id : null;
}

// User statistics helper functions

export async function getUserUnlimitedGamesPlayed(
  userId: string
): Promise<number> {
  const supabase = createClient();

  const { error, count } = await supabase
    .from("unlimited_games")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching unlimited games:", error);
    throw error;
  }

  return count ?? 0;
}

export async function getUserDailyGamesPlayed(userId: string): Promise<number> {
  const supabase = createClient();

  const { error, count } = await supabase
    .from("game_results")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("type", "daily");

  if (error) {
    console.error("Error fetching daily games:", error);
    throw error;
  }

  return count ?? 0;
}

export async function getUserUnlimitedWins(userId: string): Promise<number> {
  const supabase = createClient();

  const { error, count } = await supabase
    .from("game_results")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("isVictory", true)
    .eq("type", "unlimited");

  if (error) {
    console.error("Error fetching unlimited wins:", error);
    throw error;
  }

  return count ?? 0;
}

export async function getUserDailyWins(userId: string): Promise<number> {
  const supabase = createClient();

  const { error, count } = await supabase
    .from("game_results")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("isVictory", true)
    .eq("type", "daily");

  if (error) {
    console.error("Error fetching daily wins:", error);
    throw error;
  }

  return count ?? 0;
}

export async function getUserUnlimitedCurrentAndBestStreak(
  userId: string
): Promise<{ currentStreak: number; bestStreak: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select("isVictory")
    .eq("user_id", userId)
    .eq("type", "unlimited")
    .order("attempt_date", { ascending: true });

  if (error) {
    console.error("Error fetching unlimited game results:", error);
    throw error;
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let consecutiveWins = 0;

  for (const game of data) {
    if (game.isVictory) {
      consecutiveWins++;
      if (consecutiveWins > bestStreak) {
        bestStreak = consecutiveWins;
      }
    } else {
      consecutiveWins = 0;
    }
  }

  currentStreak = consecutiveWins;

  return { currentStreak, bestStreak };
}

export async function getUserDailyCurrentAndBestStreak(
  userId: string
): Promise<{ currentStreak: number; bestStreak: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select("isVictory")
    .eq("user_id", userId)
    .eq("type", "daily")
    .order("attempt_date", { ascending: true });

  if (error) {
    console.error("Error fetching daily game results:", error);
    throw error;
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let consecutiveWins = 0;

  for (const game of data) {
    if (game.isVictory) {
      consecutiveWins++;
      if (consecutiveWins > bestStreak) {
        bestStreak = consecutiveWins;
      }
    } else {
      consecutiveWins = 0;
    }
  }

  currentStreak = consecutiveWins;

  return { currentStreak, bestStreak };
}

export async function getUserDailyTotalScore(userId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select("score")
    .eq("user_id", userId)
    .eq("type", "daily");

  if (error) {
    console.error("Error fetching daily game results:", error);
    throw error;
  }

  let totalScore = 0;

  for (const game of data) {
    totalScore += game.score;
  }

  return totalScore;
}

export async function getUserUnlimitedTotalScore(
  userId: string
): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select("score")
    .eq("user_id", userId)
    .eq("type", "unlimited");

  if (error) {
    console.error("Error fetching unlimited game results:", error);
    throw error;
  }

  let totalScore = 0;

  for (const game of data) {
    totalScore += game.score;
  }

  return totalScore;
}
