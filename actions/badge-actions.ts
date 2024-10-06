"use server";
import { createClient } from "@/utils/supabase/server";

export interface Badge {
	id: string;
	badge_id: string;
	profile_id: string;
}

export interface UserBadges
{
    badges: Badge[];
}

export async function getBadgesForUser(uuid?: string): Promise<UserBadges | null> {
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
		.select("*")
		.eq("profile_id", uuid)
		//.maybeSingle();

	if (error && error.code !== "PGRST116") {
		console.error("Error fetching profile:", error);
		throw error;
	}

    //console.log(data)
    //console.log(error)
	return data as UserBadges | null;
}