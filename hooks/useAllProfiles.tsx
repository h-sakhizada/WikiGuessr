"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProfiles } from "@/actions/profile-actions";
import { Profile } from "@/types";

export function useAllProfiles() {
  return useQuery<Profile[] | null, Error>({
    queryKey: ["allProfilea"],
    queryFn: async () => {
      const profiles = await getAllProfiles();
      if (!profiles) {
        console.log("No profiles found");
      }
      return profiles;
    },
    retry: false, // Don't retry
  });
}
