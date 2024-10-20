import { Database } from "./database.types";

export type ProfileBadges = {
  meta: Database["public"]["Tables"]["badge_profile_junction"]["Row"][];
  badges: Database["public"]["Tables"]["badge"]["Row"][];
};

export type Profile = Database["public"]["Tables"]["profile"]["Row"];

export type Badge = Database["public"]["Tables"]["badge"]["Row"];
