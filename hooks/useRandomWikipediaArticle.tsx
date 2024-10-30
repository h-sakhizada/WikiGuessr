import { useQuery } from "@tanstack/react-query";
import wiki, {
  mobileSections,
  relatedResult,
  title,
  wikiSummary,
} from "wikipedia";
import { WikiArticleHints, formatWikiHints } from "@/utils/wiki_utils";

export const getArticleTitle = (
  result: string | wikiSummary | title | relatedResult | mobileSections
): string => {
  if (typeof result === "string") return result;

  if ("title" in result && typeof result.title === "string") {
    return result.title;
  }

  if (
    "titles" in result &&
    result.titles !== null &&
    typeof result.titles === "object" &&
    "canonical" in result.titles &&
    typeof result.titles.canonical === "string"
  ) {
    return result.titles.canonical;
  }

  throw new Error("Unable to extract title from random article result");
};

const useRandomWikipediaArticle = () => {
  return useQuery<WikiArticleHints, Error>({
    queryKey: ["randomWikipediaArticle"],
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    queryFn: async () => {
      try {
        const randomArticle = await wiki.random();
        const articleTitle = getArticleTitle(randomArticle);

        const page = await wiki.page(articleTitle);
        const [summary, links, info] = await Promise.all([
          page.summary(),
          page.links(),
          page.infobox(),
        ]);

        return formatWikiHints(summary, links, info);
      } catch (error) {
        console.error("Error fetching random Wikipedia article:", error);
        throw error;
      }
    },
  });
};

export default useRandomWikipediaArticle;
