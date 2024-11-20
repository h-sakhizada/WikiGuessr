"use client";
import Game from "@/components/custom/Game";
import LoadingSpinner from "@/components/loading-spinner";
import useDailyGame from "@/hooks/useDailyGame";

export default function DailyClientPage() {
  const { data: article, isLoading, error, refetch } = useDailyGame();

  if (error) {
    return <div>Error fetching random Wikipedia article</div>;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return <div>No article found</div>;
  }

  return (
    <Game
      article={article}
      refetchArticle={refetch}
      isUnlimited={false}
      title="Daily Wikipedia Challenge"
    />
  );
}
