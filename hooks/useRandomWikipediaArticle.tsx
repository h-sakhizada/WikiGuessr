import { useQuery } from "@tanstack/react-query";
import wiki, {
  mobileSections,
  relatedResult,
  title,
  wikiSummary,
} from "wikipedia";

interface WikiArticleHints {
  hint1: string[]; // Some of the links on the page
  hint2: string | null; // The image URL
  hint3: string; // Right panel information with title redacted
  hint4: string; // Title with only first letters of each word
  hint5: string; // Entire summary with title redacted
  fullTitle: string; // The full title (for reference)
  url: string; // The full Wikipedia URL
}

interface WikiLink {
  title?: string;
  [key: string]: unknown;
}

const getArticleTitle = (
  result: string | wikiSummary | title | relatedResult | mobileSections
): string => {
  if (typeof result === "string") return result;
  if ("title" in result && typeof result.title === "string")
    return result.title;
  if (
    "titles" in result &&
    result.titles !== null &&
    typeof result.titles === "object" &&
    "canonical" in result.titles &&
    typeof result.titles.canonical === "string"
  )
    return result.titles.canonical;
  throw new Error("Unable to extract title from random article result");
};

const isWikiLink = (link: unknown): link is WikiLink => {
  return typeof link === "object" && link !== null && "title" in link;
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

        const redactTitle = (text: string) => {
          const words = summary.title.split(" ");
          const redactedWords = words.map(
            (word) => word.charAt(0) + "_".repeat(word.length - 1)
          );
          const redactedTitle = redactedWords.join(" ");
          return text.replace(new RegExp(summary.title, "gi"), redactedTitle);
        };

        const hint1 = (links as unknown[])
          .slice(0, 5)
          .map((link) =>
            typeof link === "string"
              ? link
              : isWikiLink(link)
                ? link.title || "Unknown link"
                : "Unknown link"
          );
        const hint2 = summary.thumbnail?.source || null;
        const hint3 = info
          ? redactTitle(JSON.stringify(info))
          : "No infobox available";
        const hint4 = summary.title
          .split(" ")
          .map((word) => word[0])
          .join(". ");
        const hint5 = redactTitle(summary.extract);

        return {
          hint1,
          hint2,
          hint3,
          hint4,
          hint5,
          fullTitle: summary.title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`,
        };
      } catch (error) {
        console.error("Error fetching random Wikipedia article:", error);
        throw error;
      }
    },
  });
};

export default useRandomWikipediaArticle;
