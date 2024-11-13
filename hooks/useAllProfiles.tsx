"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsersAndProfiles } from "@/actions/profile-actions";
import { Profile, User } from "@/types";

export type ProfileWithUser = Profile & User;

export const useAdminAllProfiles = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<
    ProfileWithUser[],
    Error
  >({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      const profiles = await getAllUsersAndProfiles();
      if (!profiles || profiles.length === 0) {
        console.log("No profiles found");
      }
      return profiles;
    },
    retry: false,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
