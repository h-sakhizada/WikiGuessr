"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllExtraGameResults } from "@/actions/game-actions";
import { UnlimitedGame } from "@/types";

export const useAllExtraGames = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<
    UnlimitedGame[] | null,
    Error
  >({
    queryKey: ["allExtraGames"],
    queryFn: async () => {
      const games = await getAllExtraGameResults();
      if (!games || games.length === 0) {
        return null;
      }
      return games;
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
