"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllGameResults } from "@/actions/game-actions";
import { GameResult, Profile, User } from "@/types";

export const useAllGameResults = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<
    GameResult[] | null,
    Error
  >({
    queryKey: ["allGameResults"],
    queryFn: async () => {
      const games = await getAllGameResults();
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
