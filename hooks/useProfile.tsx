"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllUsersAndProfiles,
  getUserAndProfile,
} from "@/actions/profile-actions";
import { Profile, ProfileWithUser, User } from "@/types";

export function useProfile(uuid?: string) {
  return useQuery<(Profile & User) | null, Error>({
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

export const useAllProfiles = () => {
  const { data, isLoading, error, refetch } = useQuery<
    ProfileWithUser[] | null,
    Error
  >({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      const profiles = await getAllUsersAndProfiles();
      if (!profiles || profiles.length === 0) {
        return null;
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
