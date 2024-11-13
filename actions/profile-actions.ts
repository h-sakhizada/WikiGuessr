"use server";
import { Profile } from "@/types";
import { createClient } from "@/utils/supabase/server";

//  Actions to perform CRUD operations on profiles in supabase.
//------------------------------------------------------------------------------------------
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

export async function getAllProfiles(): Promise<Profile[]> {
	const supabase = createClient();

	const { data, error } = await supabase.from("profile").select("*");

	if (error) {
		console.error("Error fetching all profiles:", error);
		throw error;
	}

	return data as Profile[];
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

	const { error } = await supabase.from("profile").delete().eq("id", uuid);

	if (error) {
		console.error("Error deleting profile:", error);
		return false;
	}

	return true;
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

export async function togglePremium(
	uuid: string,
	isPremium: boolean
): Promise<boolean> {
	const supabase = createClient();

	const { error } = await supabase
		.from("profile")
		.update({ is_premium: !isPremium }) // Toggle the premium status
		.eq("id", uuid);

	if (error) {
		console.error("Error updating premium status:", error);
		return false;
	}

	return true;
}

// Victory Helper Methods
//-------------------------------------------------------
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
