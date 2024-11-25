// hooks/useLeaderboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAlltimeDailyLeaderboard,
  getAlltimeGameCounts,
  getAlltimeUnlimitedLeaderboard,
  getDailyLeaderboard,
  getWeeklyDailyLeaderboard,
  getWeeklyGameCounts,
  getWeeklyUnlimitedLeaderboard,
  //   getWeeklyDailyLeaderboard,
  //   getWeeklyUnlimitedLeaderboard,
  //   getAlltimeDailyLeaderboard,
  //   getAlltimeUnlimitedLeaderboard,
  //   getWeeklyGameCounts,
  //   getAlltimeGameCounts,
} from "@/actions/leaderboard-actions";
import { LeaderboardEntry } from "@/app/protected/leaderboard/types";

export function useDailyLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", "daily"],
    queryFn: () => getDailyLeaderboard(),
    refetchInterval: 300000,
  });
}

export function useWeeklyDailyLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "weekly-daily"],
    queryFn: () => getWeeklyDailyLeaderboard(),
    refetchInterval: 300000,
  });
}

export function useWeeklyUnlimitedLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "weekly-unlimited"],
    queryFn: () => getWeeklyUnlimitedLeaderboard(),
    refetchInterval: 300000,
  });
}

export function useAlltimeDailyLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "alltime-daily"],
    queryFn: () => getAlltimeDailyLeaderboard(),
    refetchInterval: 300000,
  });
}

export function useAlltimeUnlimitedLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "alltime-unlimited"],
    queryFn: () => getAlltimeUnlimitedLeaderboard(),
    refetchInterval: 300000,
  });
}

export function useWeeklyGameCounts() {
  return useQuery({
    queryKey: ["leaderboard", "weekly-counts"],
    queryFn: () => getWeeklyGameCounts(),
    refetchInterval: 300000,
  });
}

export function useAlltimeGameCounts() {
  return useQuery({
    queryKey: ["leaderboard", "alltime-counts"],
    queryFn: () => getAlltimeGameCounts(),
    refetchInterval: 300000,
  });
}
