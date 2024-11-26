"use client";

import { getAllGameResults } from "@/actions/game-actions";
import { GameResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useAllGameResults = () => {
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
