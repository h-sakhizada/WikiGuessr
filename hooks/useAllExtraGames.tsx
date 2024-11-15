"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllExtraGameResults } from "@/actions/game-actions";
import { ExtraGame } from "@/types";


export const useAllExtraGames = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<
    ExtraGame[] | null,
    Error
  >({
    queryKey: ["allExtraGames"],
    queryFn: async () => {
      const games = await getAllExtraGameResults();
      if (!games || games.length === 0) {
        console.log("No extra game results found");
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
