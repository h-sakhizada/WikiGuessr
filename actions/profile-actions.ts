"use server";
import { Profile, User } from "@/types";
import { createClient } from "@/utils/supabase/server";

//  Actions to perform CRUD operations on profiles in supabase.
//------------------------------------------------------------------------------------------
export async function getUserAndProfile(
  uuid?: string
): Promise<(Profile & User) | null> {
  const supabase = createClient();

  if (!uuid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uuid = user?.id;
  }

  if (!uuid) return null;
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", uuid)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw profileError;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", uuid)
    .maybeSingle();

  if (userError) {
    console.error("Error fetching user data:", userError);
    throw userError;
  }

  return { ...profileData, ...userData };
}

export async function getAllUsersAndProfiles(): Promise<(Profile & User)[]> {
  const supabase = createClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*");

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    throw profileError;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*");

  if (userError) {
    console.error("Error fetching users:", userError);
    throw userError;
  }

  // Merge the profile and user data based on user_id/id
  const mergedData = profileData.map((profile) => {
    const matchingUser = userData.find((user) => user.id === profile.user_id);
    return {
      ...profile,
      ...matchingUser,
    };
  });

  return mergedData as (Profile & User)[];
}

export async function deleteProfile(uuid?: string): Promise<boolean> {
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

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("user_id", uuid);

  if (error) {
    console.error("Error deleting profile:", error);
    return false;
  }

  return true;
}

export async function editProfile(profile: Profile): Promise<Profile> {
  const supabase = createClient();

  // Only include the fields that are present in profiles table
  const updateData = {
    user_id: profile.user_id,
    username: profile.username,
    avatar: profile.avatar,
    bio: profile.bio,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(updateData)
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data as Profile;
}

//  Helper actions to modify specific columns in the profile table.
//------------------------------------------------------------------------------------------

// Premium / Free Helper Methods
//-------------------------------------------------------
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
    .from("users")
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
    .from("users")
    .update({ is_premium: false })
    .eq("id", uuid);

  if (error) {
    console.error("Error setting profile to free:", error);
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

// Badge_Profile helper function to change selected badge
export async function setSelectedBadge(badgeId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  var userId = user?.id;

  const { error: resetError } = await supabase
    .from("badge_profile_junction")
    .update({ badge_selected: false })
    .eq("profile_id", userId);

  if (resetError) {
    console.error("Error resetting badge selection:", resetError);
    throw resetError;
  }

  const { error, data } = await supabase
    .from("badge_profile_junction")
    .update({ badge_selected: true })
    .match({ badge_id: badgeId, profile_id: userId })
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
    .from("badge_profile_junction")
    .select("badge_id")
    .eq("profile_id", userId)
    .eq("badge_selected", true)
    .single();

  if (error) {
    console.error("Error fetching selected badge:", error);
    throw error;
  }

  return data ? data.badge_id : null;
}
