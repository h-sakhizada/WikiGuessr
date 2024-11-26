import { getUserHasPlayedDailyGame } from "@/actions/game-actions";
import { useQuery } from "@tanstack/react-query";

export function useHasUserPlayedDailyGame(
  userId?: string | null,
  daily_game_id?: string | null
) {
  return useQuery<boolean, Error>({
    queryKey: ["hasUserPlayedDailyGame", userId, daily_game_id],
    queryFn: async () => {
      if (!userId || !daily_game_id) {
        return false;
      }
      try {
        const hasUserPlayedDailyGame: boolean = await getUserHasPlayedDailyGame(
          userId,
          daily_game_id
        );
        return hasUserPlayedDailyGame;
      } catch (error) {
        console.error("Error fetching daily game results:", error);
        throw error;
      }
    },
    // Only enable the query when we have both userId and daily_game_id
    enabled: Boolean(userId) && Boolean(daily_game_id),
    retry: true,
    staleTime: 0,
  });
}
