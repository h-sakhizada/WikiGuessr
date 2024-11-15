"use server";
import { GameResult, ExtraGame } from "@/types";
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

    return gameResultsData as (GameResult)[];
}


export async function getAllExtraGameResults(): Promise<ExtraGame[] | null> {
    const supabase = createClient();

    const { data: extraGamesData, error: gameError } = await supabase
        .from("extra_games")
        .select("*");

    if (gameError) {
        console.error("Error fetching extra game results:", gameError);
        throw gameError;
    }

    if (!extraGamesData || extraGamesData.length === 0) return null;

    return extraGamesData as (ExtraGame)[];
}