"use server";
import { GameResult, UnlimitedGame } from "@/types";
import { createClient } from "@/utils/supabase/server";

// CRUD actions on game_results or extra_games in supabase
export async function getAllGameResults(): Promise<GameResult[] | null> {
  const supabase = createClient();
  const { data: gameResultsData, error: gameError } = await supabase
    .from("game_results")
    .select("*");

  if (gameError) {
    console.error("Error fetching game results:", gameError);
    throw gameError;
  }

  if (!gameResultsData || gameResultsData.length === 0) return null;
  return gameResultsData as GameResult[];
}

export async function getAllExtraGameResults(): Promise<
  UnlimitedGame[] | null
> {
  const supabase = createClient();
  const { data: extraGamesData, error: gameError } = await supabase
    .from("extra_games")
    .select("*");

  if (gameError) {
    console.error("Error fetching extra game results:", gameError);
    throw gameError;
  }

  if (!extraGamesData || extraGamesData.length === 0) return null;
  return extraGamesData as UnlimitedGame[];
}

interface SaveGameResultParams {
  articleTitle: string;
  isVictory: boolean;
  score: number;
  userId: string;
  isUnlimited: boolean;
  attempts: number;
  daily_game_id?: string | null;
}

export async function saveGameResult({
  articleTitle,
  isVictory,
  score,
  userId,
  isUnlimited,
  attempts,
  daily_game_id,
}: SaveGameResultParams): Promise<void> {
  const supabase = createClient();

  // Normalize attempts value to ensure it's within bounds
  const normalizedAttempts = Math.min(Math.max(1, attempts), 10);

  try {
    // Start a transaction by using multiple operations
    const gameResult: GameResult = {
      id: crypto.randomUUID(),
      user_id: userId,
      attempt_date: new Date().toISOString(),
      score: Math.max(0, Math.min(score, 100)), // Normalize score between 0 and 100
      isVictory: isVictory,
      type: isUnlimited ? "unlimited" : "daily",
      article_title: articleTitle,
      attempts: normalizedAttempts,
      daily_game_id: daily_game_id ?? null,
    };

    // First, insert the game result
    const { error: gameResultError } = await supabase
      .from("game_results")
      .insert(gameResult);

    if (gameResultError) {
      console.error("Game result error details:", gameResultError);
      throw new Error(`Error saving game result: ${gameResultError.message}`);
    }

    // If this is an unlimited game, also add it to the unlimited_games table
    if (isUnlimited) {
      const unlimitedGame = {
        article_title: articleTitle,
        user_id: userId,
        created_at: new Date().toISOString(),
        attempts: normalizedAttempts,
      };

      const { error: unlimitedGameError } = await supabase
        .from("unlimited_games")
        .insert(unlimitedGame);

      if (unlimitedGameError) {
        throw new Error(
          `Error saving unlimited game: ${unlimitedGameError.message}`
        );
      }
    }
  } catch (error) {
    console.error("Error in saveGameResult:", error);
    throw error;
  }
}
