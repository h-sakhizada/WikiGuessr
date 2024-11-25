// actions/leaderboard-actions.ts
"use server";

import {
  DailyGameResult,
  GameCounts,
  LeaderboardEntry,
  WeeklyResult,
} from "@/app/protected/leaderboard/types";
import { User } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function getDailyLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const today = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // First get todays game
  const { data: latestGame, error: latestGameError } = await supabase
    .from("daily_games")
    .select("*")
    .eq("day_of_game", today)
    .limit(1);

  if (latestGameError) throw latestGameError;

  // Then get the leaderboard for that game
  const { data: dailyScores, error } = await supabase
    .from("game_results")
    .select(
      `
      id,
      user_id,
      score,
      users!inner (
        username
      ),
      daily_games!inner (
        id,
        day_of_game,
        article_title
      )
    `
    )
    .eq("type", "daily")
    .eq("daily_game_id", latestGame[0].id)
    .order("score", { ascending: false })
    .limit(10);

  if (error) throw error;

  return (dailyScores as unknown as DailyGameResult[]).map((entry) => ({
    user_id: entry.user_id,
    username: entry.users.username || "Unknown User",
    score: entry.score,
    games_played: 1,
    avg_score: entry.score,
  }));
}

export async function getWeeklyDailyLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createClient();

  // Get all daily games from the past week
  const { data, error } = await supabase
    .from("game_results")
    .select(
      `
      user_id,
      score,
      users!inner (
        *
      )
    `
    )
    .eq("type", "daily")
    .gte(
      "attempt_date",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) throw error;

  // Group and aggregate the data using JavaScript
  const groupedData = data.reduce(
    (acc, curr) => {
      const userId = curr.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: (curr.users as unknown as User)?.username || "Unknown User",
          total_score: 0,
          games_played: 0,
        };
      }
      acc[userId].total_score += curr.score;
      acc[userId].games_played += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        user_id: string;
        username: string;
        total_score: number;
        games_played: number;
      }
    >
  );

  // Convert to array and sort by total score
  return Object.values(groupedData)
    .map((entry) => ({
      user_id: entry.user_id,
      username: entry.username || "Unknown User",
      score: entry.total_score,
      games_played: entry.games_played,
      avg_score: entry.total_score / entry.games_played,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function getWeeklyUnlimitedLeaderboard(): Promise<
  LeaderboardEntry[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select(
      `
      user_id,
      score,
      users!inner (
        *
      )
    `
    )
    .eq("type", "unlimited")
    .gte(
      "attempt_date",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) throw error;

  const groupedData = data.reduce(
    (acc, curr) => {
      const userId = curr.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: (curr.users as unknown as User)?.username || "Unknown User",
          total_score: 0,
          games_played: 0,
        };
      }
      acc[userId].total_score += curr.score;
      acc[userId].games_played += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        user_id: string;
        username: string;
        total_score: number;
        games_played: number;
      }
    >
  );

  return Object.values(groupedData)
    .map((entry) => ({
      user_id: entry.user_id,
      username: entry.username || "Unknown User",
      score: entry.total_score,
      games_played: entry.games_played,
      avg_score: entry.total_score / entry.games_played,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function getAlltimeDailyLeaderboard(): Promise<
  LeaderboardEntry[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select(
      `
      user_id,
      score,
      users!inner (
        *
      )
    `
    )
    .eq("type", "daily");

  if (error) throw error;

  const groupedData = data.reduce(
    (acc, curr) => {
      const userId = curr.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: (curr.users as unknown as User)?.username || "Unknown User",
          total_score: 0,
          games_played: 0,
        };
      }
      acc[userId].total_score += curr.score;
      acc[userId].games_played += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        user_id: string;
        username: string;
        total_score: number;
        games_played: number;
      }
    >
  );

  return Object.values(groupedData)
    .map((entry) => ({
      user_id: entry.user_id,
      username: entry.username || "Unknown User",
      score: entry.total_score,
      games_played: entry.games_played,
      avg_score: entry.total_score / entry.games_played,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function getAlltimeUnlimitedLeaderboard(): Promise<
  LeaderboardEntry[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select(
      `
      user_id,
      score,
      users!inner (
        *
      )
    `
    )
    .eq("type", "unlimited");

  if (error) throw error;

  const groupedData = data.reduce(
    (acc, curr) => {
      const userId = curr.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: (curr.users as unknown as User)?.username || "Unknown User",
          total_score: 0,
          games_played: 0,
        };
      }
      acc[userId].total_score += curr.score;
      acc[userId].games_played += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        user_id: string;
        username: string;
        total_score: number;
        games_played: number;
      }
    >
  );

  return Object.values(groupedData)
    .map((entry) => ({
      user_id: entry.user_id,
      username: entry.username || "Unknown User",
      score: entry.total_score,
      games_played: entry.games_played,
      avg_score: entry.total_score / entry.games_played,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function getWeeklyGameCounts(): Promise<GameCounts> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("game_results")
    .select("type")
    .gte(
      "attempt_date",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) throw error;

  const daily = data.filter((g) => g.type === "daily").length;
  const unlimited = data.filter((g) => g.type === "unlimited").length;

  return {
    daily,
    unlimited,
    total: daily + unlimited,
  };
}

export async function getAlltimeGameCounts(): Promise<GameCounts> {
  const supabase = createClient();

  const { data, error } = await supabase.from("game_results").select("type");

  if (error) throw error;

  const daily = data.filter((g) => g.type === "daily").length;
  const unlimited = data.filter((g) => g.type === "unlimited").length;

  return {
    daily,
    unlimited,
    total: daily + unlimited,
  };
}
