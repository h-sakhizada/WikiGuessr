"use client";

import Breadcrumb from "@/components/custom/Breadcrumbs";
import LoadingSpinner from "@/components/loading-spinner";
import { useUser } from "@/hooks/useUser";
import { redirect } from "next/navigation";
import { Brain, Trophy, Target, Star, Clock, Sparkles } from "lucide-react";
import {
  useUserUnlimitedGamesPlayed,
  useUserDailyGamesPlayed,
  useUserUnlimitedWins,
  useUserDailyWins,
  useUserUnlimitedStreak,
  useUserDailyStreak,
  useUserDailyTotalScore,
  useUserUnlimitedTotalScore,
} from "@/hooks/usePersonalStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatBox = ({
  label,
  value,
  icon,
  isLoading = false,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
}) => (
  <div className="flex items-center space-x-4 p-4 bg-secondary/10 rounded-lg">
    <div className="p-2 bg-secondary/20 rounded-full">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  </div>
);

const StatsSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-lg">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="grid gap-4">{children}</CardContent>
  </Card>
);

export default function StatisticsPage() {
  const { data: user, isLoading: userLoading } = useUser();

  const { data: unlimitedGames, isLoading: unlimitedGamesLoading } =
    useUserUnlimitedGamesPlayed(user?.id);
  const { data: unlimitedWins, isLoading: unlimitedWinsLoading } =
    useUserUnlimitedWins(user?.id);
  const { data: unlimitedStreak, isLoading: unlimitedStreakLoading } =
    useUserUnlimitedStreak(user?.id);

  const { data: dailyGames, isLoading: dailyGamesLoading } =
    useUserDailyGamesPlayed(user?.id);
  const { data: dailyWins, isLoading: dailyWinsLoading } = useUserDailyWins(
    user?.id
  );
  const { data: dailyStreak, isLoading: dailyStreakLoading } =
    useUserDailyStreak(user?.id);

  const { data: dailyTotalScore, isLoading: dailyTotalScoreLoading } =
    useUserDailyTotalScore(user?.id);
  const { data: unlimitedTotalScore, isLoading: unlimitedTotalScoreLoading } =
    useUserUnlimitedTotalScore(user?.id);

  if (userLoading) return <LoadingSpinner />;
  if (!user) return redirect("/sign-in");

  const calculateWinRate = (wins: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((wins / total) * 100)}%`;
  };

  return (
    <>
      <Breadcrumb />
      <div className="flex-1 w-full flex flex-col gap-6 p-3 sm:p-4 max-w-full mx-auto">
        <StatsSection
          title="Daily Challenge"
          icon={<Clock className="h-5 w-5 text-blue-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatBox
              label="Total Score"
              value={dailyTotalScore ?? 0}
              icon={<Trophy className="h-5 w-5 text-yellow-500" />}
              isLoading={dailyTotalScoreLoading}
            />
            <StatBox
              label="Games Played"
              value={dailyGames ?? 0}
              icon={<Target className="h-5 w-5 text-red-500" />}
              isLoading={dailyGamesLoading}
            />
            <StatBox
              label="Win Rate"
              value={calculateWinRate(dailyWins ?? 0, dailyGames ?? 0)}
              icon={<Sparkles className="h-5 w-5 text-purple-300" />}
              isLoading={dailyGamesLoading || dailyWinsLoading}
            />
            <StatBox
              label="Current Streak"
              value={dailyStreak?.currentStreak ?? 0}
              icon={<Star className="h-5 w-5 text-primary" />}
              isLoading={dailyStreakLoading}
            />
            <StatBox
              label="Best Streak"
              value={dailyStreak?.bestStreak ?? 0}
              icon={<Star className="h-5 w-5 text-blue-500" />}
              isLoading={dailyStreakLoading}
            />
          </div>
        </StatsSection>

        <StatsSection
          title="Unlimited Mode"
          icon={<Brain className="h-5 w-5 text-purple-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatBox
              label="Total Score"
              value={unlimitedTotalScore ?? 0}
              icon={<Trophy className="h-5 w-5 text-yellow-500" />}
              isLoading={unlimitedTotalScoreLoading}
            />
            <StatBox
              label="Games Played"
              value={unlimitedGames ?? 0}
              icon={<Target className="h-5 w-5 text-red-500" />}
              isLoading={unlimitedGamesLoading}
            />
            <StatBox
              label="Win Rate"
              value={calculateWinRate(unlimitedWins ?? 0, unlimitedGames ?? 0)}
              icon={<Sparkles className="h-5 w-5 text-purple-300" />}
              isLoading={unlimitedGamesLoading || unlimitedWinsLoading}
            />
            <StatBox
              label="Current Streak"
              value={unlimitedStreak?.currentStreak ?? 0}
              icon={<Star className="h-5 w-5 text-primary" />}
              isLoading={unlimitedStreakLoading}
            />
            <StatBox
              label="Best Streak"
              value={unlimitedStreak?.bestStreak ?? 0}
              icon={<Trophy className="h-5 w-5 text-blue-500" />}
              isLoading={unlimitedStreakLoading}
            />
          </div>
        </StatsSection>
      </div>
    </>
  );
}
