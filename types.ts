import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type DailyGame = Database["public"]["Tables"]["daily_games"]["Row"];

export type UnlimitedGame =
  Database["public"]["Tables"]["unlimited_games"]["Row"];
export type GameResult = Database["public"]["Tables"]["game_results"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];

export type ProfileBadges = {
  meta: Database["public"]["Tables"]["badge_profile_junction"]["Row"][];
  badges: Database["public"]["Tables"]["badges"]["Row"][];
};

export type ProfileWithUser = Profile & User;
