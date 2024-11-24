"use client";

import { useQuery } from "@tanstack/react-query";
import { getBadgesForUser } from "@/actions/badge-actions";
import { ProfileBadges } from "@/types";

export function useProfileSelectedBadges(uuid?: string) {
  return useQuery<ProfileBadges | null, Error>({
    queryKey: ["badge", uuid],
    queryFn: async () => {
      const badges = await getBadgesForUser(uuid);
      if (!badges) {
        return null;
      }
      return badges;
    },
    retry: false, // Don't retry if no profile is found
  });
}
