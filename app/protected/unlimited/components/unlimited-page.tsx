"use client";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import Game from "@/components/custom/Game";
import LoadingSpinner from "@/components/loading-spinner";
import useRandomWikipediaArticle from "@/hooks/useRandomWikipediaArticle";

interface GuessResult {
  isMatch: boolean;
  message: string;
  type: "success" | "error";
  iconTheme: {
    primary: string;
    secondary: string;
  };
}

export default function UnlimitedClientPage() {
  const {
    data: article,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useRandomWikipediaArticle();

  if (error) {
    return <div>Error fetching random Wikipedia article</div>;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return <div>No article found</div>;
  }

  if (isFetching) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Breadcrumb />
      <Game
        article={article}
        refetchArticle={refetch}
        isUnlimited={true}
        title="Unlimited Wikipedia Challenge"
      />
    </>
  );
}
