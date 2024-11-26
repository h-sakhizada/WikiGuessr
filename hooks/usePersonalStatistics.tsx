import {
  getUserDailyCurrentAndBestStreak,
  getUserDailyGamesPlayed,
  getUserDailyTotalScore,
  getUserDailyWins,
  getUserUnlimitedCurrentAndBestStreak,
  getUserUnlimitedGamesPlayed,
  getUserUnlimitedTotalScore,
  getUserUnlimitedWins,
} from "@/actions/user-actions";
import { useQuery } from "@tanstack/react-query";

export function useUserUnlimitedGamesPlayed(userId?: string) {
  return useQuery<number, Error>({
    queryKey: ["unlimitedGamesPlayed", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return NaN;
        }
        const count = await getUserUnlimitedGamesPlayed(userId);
        return count;
      } catch (error) {
        console.error("Error fetching user unlimited games played:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserDailyGamesPlayed(userId?: string) {
  return useQuery<number, Error>({
    queryKey: ["dailyGamesPlayed", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return NaN;
        }
        const count = await getUserDailyGamesPlayed(userId);
        return count;
      } catch (error) {
        console.error("Error fetching user daily games played:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserUnlimitedWins(userId?: string) {
  return useQuery<number, Error>({
    queryKey: ["unlimitedWins", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return NaN;
        }
        const count = await getUserUnlimitedWins(userId);
        return count;
      } catch (error) {
        console.error("Error fetching user unlimited wins:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserDailyWins(userId?: string) {
  return useQuery<number, Error>({
    queryKey: ["dailyWins", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return NaN;
        }
        const count = await getUserDailyWins(userId);
        return count;
      } catch (error) {
        console.error("Error fetching user daily wins:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserUnlimitedStreak(userId?: string) {
  return useQuery<
    {
      currentStreak: number;
      bestStreak: number;
    },
    Error
  >({
    queryKey: ["unlimitedStreak", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return { currentStreak: NaN, bestStreak: NaN };
        }
        const streaks = await getUserUnlimitedCurrentAndBestStreak(userId);
        return streaks;
      } catch (error) {
        console.error("Error fetching user unlimited streak:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserDailyStreak(userId?: string) {
  return useQuery<
    {
      currentStreak: number;
      bestStreak: number;
    },
    Error
  >({
    queryKey: ["dailyStreak", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return { currentStreak: NaN, bestStreak: NaN };
        }
        const streaks = await getUserDailyCurrentAndBestStreak(userId);
        return streaks;
      } catch (error) {
        console.error("Error fetching user daily streak:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserDailyTotalScore(userId?: string) {
  return useQuery<number, Error>({
    queryKey: ["dailyTotalScore", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return NaN;
        }
        const count = await getUserDailyTotalScore(userId);
        return count;
      } catch (error) {
        console.error("Error fetching user daily total score:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}

export function useUserUnlimitedTotalScore(userId?: string) {
  return useQuery<number, Error>({
    queryKey: ["unlimitedTotalScore", userId],
    queryFn: async () => {
      try {
        if (!userId) {
          return NaN;
        }
        const count = await getUserUnlimitedTotalScore(userId);
        return count;
      } catch (error) {
        console.error("Error fetching user unlimited total score:", error);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: true,
    staleTime: 0,
  });
}
