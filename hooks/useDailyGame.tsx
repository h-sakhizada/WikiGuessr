import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import wiki from "wikipedia";
import { format } from "date-fns";
import { WikiArticleHints, formatWikiHints } from "@/utils/wiki_utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const useDailyGame = () => {
  return useQuery<WikiArticleHints, Error>({
    queryKey: ["dailyGame"],
    retry: false,
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), "yyyy-MM-dd");

        // Fetch today's article from Supabase
        const { data: dailyGame, error } = await supabase
          .from("daily_games")
          .select("*")
          .eq("day_of_game", today)
          .single();

        if (error) {
          throw error;
        }
        if (!dailyGame) throw new Error("No game found for today");

        // Fetch Wikipedia article data
        const page = await wiki.page(dailyGame.article_title);

        const [summary, related, info] = await Promise.all([
          page.summary(),
          page.related(),
          page.infobox(),
        ]);

        return formatWikiHints(summary, related, info);
      } catch (error) {
        console.error("Error fetching daily game:", error);
        throw error;
      }
    },
  });
};

export default useDailyGame;
