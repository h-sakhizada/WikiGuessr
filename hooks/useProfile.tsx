"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAndProfile } from "@/actions/profile-actions";
import { Profile } from "@/types";

export function useProfile(uuid?: string) {
  return useQuery<Profile | null, Error>({
    queryKey: ["profile", uuid],
    queryFn: async () => {
      const profile = await getUserAndProfile(uuid);
      if (!profile) {
        return null;
      }
      return profile;
    },
    retry: false, // Don't retry if no profile is found
  });
}
