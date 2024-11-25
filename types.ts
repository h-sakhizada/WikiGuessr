import { Database } from "./database.types";

export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type DailyGame = Database["public"]["Tables"]["daily_games"]["Row"];

export type UnlimitedGame =
  Database["public"]["Tables"]["unlimited_games"]["Row"];
export type GameResult = Database["public"]["Tables"]["game_results"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];

export type UserBadges = {
  meta: Database["public"]["Tables"]["badge_user_junction"]["Row"][];
  badges: Database["public"]["Tables"]["badges"]["Row"][];
};
