import { createClient } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfDay } from "date-fns";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DailyGame {
  id: bigint;
  created_at: string;
  day_of_game: string;
  article_title: string;
}

export interface DailyGameInput {
  day_of_game: string;
  article_title: string;
}

export const useAdminDailyGames = () => {
  const queryClient = useQueryClient();

  const { data: games, isLoading } = useQuery<DailyGame[], Error>({
    queryKey: ["adminDailyGames"],
    queryFn: async () => {
      const today = startOfDay(new Date());

      const { data, error } = await supabase
        .from("daily_games")
        .select("*")
        .gte("day_of_game", format(today, "yyyy-MM-dd"))
        .order("day_of_game", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const addGame = useMutation({
    mutationFn: async (newGame: DailyGameInput) => {
      const { data, error } = await supabase
        .from("daily_games")
        .insert(newGame)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyGames"] });
    },
  });

  const updateGame = useMutation({
    mutationFn: async ({
      id,
      game,
    }: {
      id: number;
      game: Partial<DailyGameInput>;
    }) => {
      const { data, error } = await supabase
        .from("daily_games")
        .update(game)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyGames"] });
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("daily_games")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyGames"] });
    },
  });

  return {
    games,
    isLoading,
    addGame,
    updateGame,
    deleteGame,
  };
};
