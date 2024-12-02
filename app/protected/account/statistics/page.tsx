"use client";

import Breadcrumb from "@/components/custom/Breadcrumbs";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useUserDailyGamesPlayed,
  useUserDailyStreak,
  useUserDailyTotalScore,
  useUserDailyWins,
  useUserUnlimitedGamesPlayed,
  useUserUnlimitedStreak,
  useUserUnlimitedTotalScore,
  useUserUnlimitedWins,
} from "@/hooks/usePersonalStatistics";
import { useUser } from "@/hooks/useUser";
import {
  Award,
  Brain,
  Clock,
  Crown,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { redirect } from "next/navigation";

const getStatStatus = (label: string, value: number) => {
  if (value === undefined || value === null) return null;

  const thresholds = {
    "Total Score": {
      mythical: 50000,
      legendary: 25000,
      epic: 10000,
      rare: 5000,
      common: 1000,
    },
    "Games Played": {
      mythical: 1000,
      legendary: 500,
      epic: 250,
      rare: 100,
      common: 25,
    },
    "Win Rate": { mythical: 95, legendary: 85, epic: 75, rare: 65, common: 50 },
    "Total Wins": {
      mythical: 500,
      legendary: 250,
      epic: 100,
      rare: 50,
      common: 10,
    },
    "Current Streak": {
      mythical: 100,
      legendary: 50,
      epic: 25,
      rare: 10,
      common: 5,
    },
    "Best Streak": {
      mythical: 100,
      legendary: 50,
      epic: 25,
      rare: 10,
      common: 5,
    },
  };

  const statThresholds = thresholds[label as keyof typeof thresholds];
  if (!statThresholds) return null;

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (numericValue >= statThresholds.mythical) {
    return {
      type: "MYTHICAL",
      glow: "shadow-[inset_0_2px_15px_rgba(236,72,153,0.3)] dark:shadow-[inset_0_2px_15px_rgba(236,72,153,0.25)]",
      icon: <Crown className="h-4 w-4" />,
      containerClass:
        "bg-gradient-to-r from-pink-600/30 via-fuchsia-600/30 to-purple-600/30 dark:from-pink-400/20 dark:via-fuchsia-400/20 dark:to-purple-400/20 border-pink-400 dark:border-pink-500 text-pink-700 dark:text-pink-400 animate-gradient backdrop-blur-md",
    };
  } else if (numericValue >= statThresholds.legendary) {
    return {
      type: "LEGENDARY",
      glow: "shadow-[inset_0_2px_15px_rgba(234,179,8,0.3)] dark:shadow-[inset_0_2px_15px_rgba(234,179,8,0.25)]",
      icon: <Crown className="h-4 w-4" />,
      containerClass:
        "bg-gradient-to-r from-yellow-400/30 via-amber-400/30 to-orange-400/30 dark:from-yellow-400/20 dark:via-amber-400/20 dark:to-orange-400/20 border-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-400 backdrop-blur-md",
    };
  } else if (numericValue >= statThresholds.epic) {
    return {
      type: "EPIC",
      glow: "shadow-[inset_0_2px_15px_rgba(147,51,234,0.3)] dark:shadow-[inset_0_2px_15px_rgba(147,51,234,0.25)]",
      icon: <Award className="h-4 w-4" />,
      containerClass:
        "bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-fuchsia-500/30 dark:from-violet-400/20 dark:via-purple-400/20 dark:to-fuchsia-400/20 border-purple-400 dark:border-purple-500 text-purple-700 dark:text-purple-400 backdrop-blur-md",
    };
  } else if (numericValue >= statThresholds.rare) {
    return {
      type: "RARE",
      glow: "shadow-[inset_0_2px_15px_rgba(59,130,246,0.3)] dark:shadow-[inset_0_2px_15px_rgba(59,130,246,0.25)]",
      icon: <Star className="h-4 w-4" />,
      containerClass:
        "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    };
  } else if (numericValue >= statThresholds.common) {
    return {
      type: "COMMON",
      glow: "shadow-[inset_0_2px_15px_rgba(34,197,94,0.3)] dark:shadow-[inset_0_2px_15px_rgba(34,197,94,0.25)]",
      icon: <Target className="h-4 w-4" />,
      containerClass:
        "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
    };
  }
  return {
    type: "NOVICE",
    glow: "",
    icon: null,
    containerClass:
      "bg-primary/10 border-primary/20 text-primary-700 dark:text-primary-400",
  };
};
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
}) => {
  const status = getStatStatus(
    label,
    typeof value === "string" ? parseFloat(value) : (value as number)
  );

  return (
    <div
      className={`relative flex items-center space-x-4 p-4 bg-secondary/10 rounded-lg transition-shadow duration-300 ${status?.glow || ""}`}
    >
      {status && (
        <div
          className={`absolute -top-3 -right-3 px-2 py-1 rounded-full border ${status.containerClass} 
            flex items-center gap-1 font-semibold text-xs shadow-sm backdrop-blur-sm`}
        >
          {status.icon}
          <span className="tracking-wide">{status.type}</span>
        </div>
      )}
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
};

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

  const getDailyWinCountMessage = (wins: number) => {
    if (wins === 0) return "🌱 Start your daily winning journey!";
    if (wins === 1) return "🎯 First win of the day secured!";
    if (wins === 2) return "✌️ Double trouble - two wins down!";
    if (wins === 3) return "🎨 Triple threat achieved!";
    if (wins === 4) return "🎲 Four-tune favors the bold!";
    if (wins === 5) return "🖐️ High five - you're on fire!";
    if (wins < 10) return "🌟 Perfect 10!";
    if (wins < 15) return "🎮 Double-digit destroyer!";
    if (wins < 20) return "🎪 The show goes on!";
    if (wins < 25) return "🎯 Precision perfect!";
    if (wins < 30) return "🎨 Making wiki art!";
    if (wins < 40) return "🏃 Marathon winner in action!";
    if (wins < 50) return "🌪️ Tornado of triumphs!";
    if (wins < 60) return "🌟 Stellar performance!";
    if (wins < 70) return "🎸 Wiki rockstar status!";
    if (wins < 80) return "🌋 Eruption of excellence!";
    if (wins < 90) return "⚡ Power level rising!";
    if (wins < 100) return "🔥 Century mark approaching!";
    if (wins < 150) return "🦸 Beyond mortal limits!";
    if (wins < 200) return "🌌 Cosmic achievement unlocked!";
    return "✨ Wiki deity status achieved!";
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

  const getTotalUnlimitedWinsMessage = (wins: number) => {
    if (wins === 0) return "🌱 Your wiki journey begins here!";
    if (wins < 5) return "🎲 The first steps of a champion!";
    if (wins < 10) return "🎯 Building momentum!";
    if (wins < 25) return "📚 Wiki warrior in training!";
    if (wins < 50) return "🎮 Level up - you're getting there!";
    if (wins < 100) return "⭐ Triple digits on the horizon!";
    if (wins < 250) return "🏅 Century club member!";
    if (wins < 500) return "🎓 Wiki scholar status!";
    if (wins < 1000) return "👑 Approaching the millennium mark!";
    if (wins < 2500) return "🏆 Wiki master extraordinaire!";
    if (wins < 5000) return "⚡ Legendary achievement unlocked!";
    return "🦸 Wiki immortality achieved!";
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
              label="Total Wins"
              value={dailyWins ?? 0}
              icon={<Trophy className="h-5 w-5 text-yellow-500" />}
              isLoading={dailyWinsLoading}
              subValue={
                dailyWins
                  ? getDailyWinCountMessage(dailyWins)
                  : "🌱 Start your daily winning journey!"
              }
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
              label="Total Wins"
              value={unlimitedWins ?? 0}
              icon={<Trophy className="h-5 w-5 text-yellow-500" />}
              isLoading={unlimitedWinsLoading}
              subValue={
                unlimitedWins
                  ? getTotalUnlimitedWinsMessage(unlimitedWins)
                  : "🌱 Your wiki journey begins here!"
              }
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
