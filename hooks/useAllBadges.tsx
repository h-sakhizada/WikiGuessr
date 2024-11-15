"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBadges } from "@/actions/badge-actions";
import { Badge } from "@/types";

export const useAllBadges = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<Badge[] | null, Error>({
    queryKey: ["allBadges"],
    queryFn: async () => {
      const badges = await getAllBadges();
      if (!badges || badges.length === 0) {
        console.log("No badges found");
        return null;
      }
      return badges;
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
