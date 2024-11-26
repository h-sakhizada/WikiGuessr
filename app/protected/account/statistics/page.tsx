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
  subValue,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
  subValue?: string;
}) => (
  <div className="flex items-center space-x-4 p-4 bg-secondary/10 rounded-lg">
    <div className="p-2 bg-secondary/20 rounded-full">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <div className="flex flex-col items-start gap-1">
          <p className="text-2xl font-bold">{value}</p>
          {subValue && (
            <p className="text-sm text-muted-foreground">{subValue}</p>
          )}
        </div>
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

  // Games Played Messages
  const getDailyGamesPlayedMessage = (games: number) => {
    if (games === 0) return "👋 Welcome to the daily challenge!";
    if (games === 1) return "🎯 First daily in the books!";
    if (games < 5) return "🌱 Starting your daily ritual!";
    if (games < 10) return "📅 Making it part of your routine!";
    if (games < 15) return "⭐ Rising daily star!";
    if (games < 20) return "📚 Building that streak foundation!";
    if (games < 30) return "🎯 Daily dedication detected!";
    if (games < 50) return "🎮 Daily challenger extraordinaire!";
    if (games < 75) return "🌟 Part of your balanced breakfast!";
    if (games < 100) return "🏃 Marathon runner of daily challenges!";
    if (games < 150) return "🎓 Daily WikiGuessr Scholar!";
    if (games < 200) return "🦸 Daily challenge? More like daily triumph!";
    if (games < 300) return "👑 Ruling the daily kingdom!";
    if (games < 500) return "🌌 Your daily goals are astronomical!";
    return "🔮 Legend of the daily challenges!";
  };

  const getUnlimitedGamesPlayedMessage = (games: number) => {
    if (games === 0) return "👋 Ready to explore the wiki-verse?";
    if (games === 1) return "🎯 First game down, infinity to go!";
    if (games < 5) return "🌱 Testing the wiki waters!";
    if (games < 10) return "🎮 Getting into the groove!";
    if (games < 15) return "⭐ The wiki bug has bitten!";
    if (games < 20) return "🎲 Rolling through the articles!";
    if (games < 30) return "🎯 Wiki warrior in training!";
    if (games < 50) return "🚀 Blasting through the knowledge base!";
    if (games < 75) return "🌟 Wiki explorer level: Advanced!";
    if (games < 100) return "🏃 Running wild in the wiki wilderness!";
    if (games < 150) return "🎓 Wikipedia should hire you!";
    if (games < 200) return "🦸 The hero Wikipedia deserves!";
    if (games < 300) return "👑 Wiki royalty status achieved!";
    if (games < 500) return "🌌 Creating your own wiki universe!";
    return "🔮 The Wiki Whisperer has arrived!";
  };

  // Current Streak Messages
  const getDailyCurrentStreakMessage = (streak: number) => {
    if (streak === 0) return "😴 Time to start a new streak!";
    if (streak === 1) return "🌱 Every streak starts with one!";
    if (streak < 3) return "🎯 Building momentum!";
    if (streak < 5) return "📅 Making it a habit!";
    if (streak < 7) return "🔥 A week in sight!";
    if (streak < 10) return "⚡ Charging up that streak!";
    if (streak < 14) return "🌟 Two weeks of brilliance approaching!";
    if (streak < 20) return "🚀 Unstoppable force detected!";
    if (streak < 30) return "🏆 A month of mastery!";
    if (streak < 50) return "🦸 Local legend status achieved!";
    if (streak < 75) return "👑 Ruling the daily realm!";
    if (streak < 100) return "🌌 Cosmic streak energy!";
    return "🔮 The prophecy speaks of your streak!";
  };

  const getUnlimitedCurrentStreakMessage = (streak: number) => {
    if (streak === 0) return "🎲 Ready for a winning spree?";
    if (streak === 1) return "🎯 First win locked in!";
    if (streak < 3) return "🌱 Growing stronger!";
    if (streak < 5) return "🎮 Combo starting!";
    if (streak < 7) return "🔥 Getting fired up!";
    if (streak < 10) return "⚡ The wiki force flows through you!";
    if (streak < 14) return "🌟 Can't stop, won't stop!";
    if (streak < 20) return "🚀 Wiki streak goes brrrr!";
    if (streak < 30) return "🏆 Trophy case expanding!";
    if (streak < 50) return "🦸 Unlimited power!";
    if (streak < 75) return "👑 Streaking through the wiki-verse!";
    if (streak < 100) return "🌌 Beyond mortal comprehension!";
    return "🔮 The chosen one of WikiGuessr!";
  };

  // Best Streak Messages
  const getDailyBestStreakMessage = (streak: number) => {
    if (streak === 0) return "🌱 Your legacy begins here!";
    if (streak === 1) return "🎯 First milestone achieved!";
    if (streak < 3) return "📚 Learning the daily ropes!";
    if (streak < 5) return "⭐ Rising through the ranks!";
    if (streak < 7) return "📅 Week warrior in the making!";
    if (streak < 10) return "🎓 Mastering the daily grind!";
    if (streak < 14) return "🌟 Two weeks of fame!";
    if (streak < 20) return "🏆 Hall of fame material!";
    if (streak < 30) return "👑 Monthly monarch status!";
    if (streak < 50) return "🦸 Your legend grows stronger!";
    if (streak < 75) return "🌌 Astronomical achievement!";
    if (streak < 100) return "🔮 prophets speak of your streak!";
    return "⚡ The streak to end all streaks!";
  };

  const getUnlimitedBestStreakMessage = (streak: number) => {
    if (streak === 0) return "🎲 Fortune favors the bold!";
    if (streak === 1) return "🎯 The journey of a thousand wikis begins!";
    if (streak < 3) return "🎮 Getting that high score!";
    if (streak < 5) return "⭐ New challenger approaching!";
    if (streak < 7) return "🎲 Lucky number seven in sight!";
    if (streak < 10) return "🎓 PhD in Wiki-streaking!";
    if (streak < 14) return "🌟 Can't touch this!";
    if (streak < 20) return "🏆 Trophy collector extraordinaire!";
    if (streak < 30) return "👑 Unlimited streak works!";
    if (streak < 50) return "🦸 Is it possible to learn this power?";
    if (streak < 75) return "🌌 To infinity and beyond!";
    if (streak < 100) return "🔮 Wiki-streak singularity achieved!";
    return "⚡ The stuff of legends!";
  };

  // Win Percentage Messages
  const getDailyWinPercentageMessage = (percentage: number) => {
    if (percentage < 5) return "🎲 Room for daily improvement!";
    if (percentage < 10) return "🌱 Growing day by day!";
    if (percentage < 20) return "📈 Slow and steady progress!";
    if (percentage < 30) return "🎯 Finding your daily rhythm!";
    if (percentage < 40) return "📚 Daily practice makes perfect!";
    if (percentage < 50) return "⚖️ Balancing those daily wins!";
    if (percentage < 60) return "🌟 Daily consistency is key!";
    if (percentage < 70) return "🎓 Daily mastery approaching!";
    if (percentage < 80) return "🏆 Daily challenge champion!";
    if (percentage < 90) return "👑 Daily dominance achieved!";
    if (percentage < 95) return "🦸 Daily superhero status!";
    return "🫅 Bow to the daily king!";
  };

  const getUnlimitedWinPercentageMessage = (percentage: number) => {
    if (percentage < 5) return "🎲 Room for improvement!";
    if (percentage < 10) return "🌱 Growing those wiki muscles!";
    if (percentage < 20) return "📈 Stonks only go up from here!";
    if (percentage < 30) return "🎯 Well its better than 20% right??";
    if (percentage < 40) return "🎮 Leveling up that win rate!";
    if (percentage < 50)
      return "⚖️ You win some, you lose some! In this case it's pretty even!";
    if (percentage < 60) return "🌟 Victory: More than random chance!";
    if (percentage < 70) return "🎓 Wiki mastery intensifies!";
    if (percentage < 80) return "🏆 Elite guesser status!";
    if (percentage < 90) return "👑 Supreme victory achiever!";
    if (percentage < 95) return "🦸 Is it possible to learn this power?";
    return "⚡ Wiki perfection incarnate!";
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
              subValue={getDailyGamesPlayedMessage(dailyGames ?? 0)}
              icon={<Target className="h-5 w-5 text-red-500" />}
              isLoading={dailyGamesLoading}
            />
            <StatBox
              label="Win Rate"
              value={calculateWinRate(dailyWins ?? 0, dailyGames ?? 0)}
              subValue={getDailyWinPercentageMessage(
                Number(
                  calculateWinRate(dailyWins ?? 0, dailyGames ?? 0).replace(
                    "%",
                    ""
                  )
                )
              )}
              icon={<Sparkles className="h-5 w-5 text-purple-300" />}
              isLoading={dailyGamesLoading || dailyWinsLoading}
            />
            <StatBox
              label="Current Streak"
              value={dailyStreak?.currentStreak ?? 0}
              subValue={getDailyCurrentStreakMessage(
                dailyStreak?.currentStreak ?? 0
              )}
              icon={<Star className="h-5 w-5 text-primary" />}
              isLoading={dailyStreakLoading}
            />
            <StatBox
              label="Best Streak"
              value={dailyStreak?.bestStreak ?? 0}
              subValue={getDailyBestStreakMessage(dailyStreak?.bestStreak ?? 0)}
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
              subValue={getUnlimitedGamesPlayedMessage(unlimitedGames ?? 0)}
              icon={<Target className="h-5 w-5 text-red-500" />}
              isLoading={unlimitedGamesLoading}
            />
            <StatBox
              label="Win Rate"
              value={calculateWinRate(unlimitedWins ?? 0, unlimitedGames ?? 0)}
              subValue={getUnlimitedWinPercentageMessage(
                Number(
                  calculateWinRate(
                    unlimitedWins ?? 0,
                    unlimitedGames ?? 0
                  ).replace("%", "")
                )
              )}
              icon={<Sparkles className="h-5 w-5 text-purple-300" />}
              isLoading={unlimitedGamesLoading || unlimitedWinsLoading}
            />
            <StatBox
              label="Current Streak"
              value={unlimitedStreak?.currentStreak ?? 0}
              subValue={getUnlimitedCurrentStreakMessage(
                unlimitedStreak?.currentStreak ?? 0
              )}
              icon={<Star className="h-5 w-5 text-primary" />}
              isLoading={unlimitedStreakLoading}
            />
            <StatBox
              label="Best Streak"
              value={unlimitedStreak?.bestStreak ?? 0}
              subValue={getUnlimitedBestStreakMessage(
                unlimitedStreak?.bestStreak ?? 0
              )}
              icon={<Trophy className="h-5 w-5 text-blue-500" />}
              isLoading={unlimitedStreakLoading}
            />
          </div>
        </StatsSection>
      </div>
    </>
  );
}
