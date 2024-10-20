"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/actions/profile-actions";
import { Profile } from "@/types";

export function useProfile(uuid?: string) {
  return useQuery<Profile | null, Error>({
    queryKey: ["profile", uuid],
    queryFn: async () => {
      const profile = await getProfile(uuid);
      if (!profile) {
        console.log("No profile found for user:", uuid);
      }
      return profile;
    },
    retry: false, // Don't retry if no profile is found
  });
}
