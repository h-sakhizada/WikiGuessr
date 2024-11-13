"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllProfiles } from "@/actions/profile-actions";
import { Profile } from "@/types";

export const useAdminAllProfiles = () => {
  const queryClient = useQueryClient();

  const { data: allProfiles, isLoading } = useQuery<Profile[] | null, Error>({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      const profiles = await getAllProfiles();
      if (!profiles) {
        console.log("No profiles found");
      }
      return profiles;
    },
    retry: false, // Don't retry
  });

  return {
    allProfiles,
  };
};
