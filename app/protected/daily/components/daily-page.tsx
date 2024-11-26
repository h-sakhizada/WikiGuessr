"use client";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import Game from "@/components/custom/Game";
import { SecureGameWrapper } from "@/components/custom/SecureGameWrapper";
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
    <>
      <Breadcrumb />
      <SecureGameWrapper
        isUnlimited={false}
        dailyGameId={article.daily_game_id}
      >
        <Game
          article={article}
          refetchArticle={refetch}
          isUnlimited={false}
          title="Daily Wikipedia Challenge"
          dailyGameId={article.daily_game_id}
        />
      </SecureGameWrapper>
    </>
  );
}
