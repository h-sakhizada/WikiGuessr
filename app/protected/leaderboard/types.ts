export interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  games_played: number;
  avg_score: number;
}

export interface DailyGameResult {
  id: string;
  user_id: string;
  score: number;
  users: {
    username: string;
  };
  daily_games: {
    id: string;
    day_of_game: string;
    article_title: string;
  };
}

export interface WeeklyResult {
  id: string;
  user_id: string;
  users: {
    username: string;
  };
  score: number;
  games_played: number;
}
export interface GameCounts {
  daily: number;
  unlimited: number;
  total: number;
}

export interface VictoryStats {
  daily: number;
  unlimited: number;
  total: number;
  names: string[];
}
