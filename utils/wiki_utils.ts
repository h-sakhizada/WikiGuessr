import { relatedResult, wikiSummary } from "wikipedia";

interface WikiLink {
  title?: string;
  [key: string]: unknown;
}

export const isWikiLink = (link: unknown): link is WikiLink => {
  return typeof link === "object" && link !== null && "title" in link;
};

export const createTitleRedactor = (title: string) => {
  const words = title.split(" ");
  const redactedWords = words.map(
    (word) => word.charAt(0) + "_".repeat(word.length - 1)
  );
  const redactedTitle = redactedWords.join(" ");

  return (text: string) => {
    return text.replace(new RegExp(title, "gi"), redactedTitle);
  };
};

export const formatRelated = (related: relatedResult): string[] => {
  // return the first 5 related links
  return related.pages
    .slice(0, 5)
    .map((page) => page.title.split("_").join(" "));
};

export const formatTitleInitials = (title: string): string => {
  return title
    .split(" ")
    .map((word) => word[0])
    .join(". ");
};

export const formatInfobox = (
  info: Record<string, any> | null,
  redactTitle: (text: string) => string
): string => {
  return info ? redactTitle(JSON.stringify(info)) : "No infobox available";
};

export const getWikiArticleUrl = (title: string): string => {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
};

export interface WikiArticleHints {
  hint1: string[]; // Some of the links on the page
  hint2: string | null; // The image URL
  hint3: string; // Right panel information with title redacted
  hint4: string; // Title with only first letters of each word
  hint5: string; // Entire summary with title redacted
  fullTitle: string; // The full title (for reference)
  url: string; // The full Wikipedia URL
}

export const formatWikiHints = (
  summary: wikiSummary,
  related: relatedResult,
  info: Record<string, any> | null
): WikiArticleHints => {
  const redactTitle = createTitleRedactor(summary.title);

  return {
    hint1: formatRelated(related),
    hint2: summary.thumbnail?.source || null,
    hint3: formatInfobox(info, redactTitle),
    hint4: formatTitleInitials(summary.title),
    hint5: redactTitle(summary.extract),
    fullTitle: summary.title,
    url: getWikiArticleUrl(summary.title),
  };
};
