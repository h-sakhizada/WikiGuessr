import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUserDailyGamesPlayed,
  useUserDailyStreak,
  useUserDailyWins,
  useUserUnlimitedGamesPlayed,
  useUserUnlimitedStreak,
  useUserUnlimitedWins,
} from "@/hooks/usePersonalStatistics";
import { useUser } from "@/hooks/useUser";
import { WikiArticleHints } from "@/utils/wiki_utils";
import {
  QueryObserverResult,
  RefetchOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  BarChart2,
  Brain,
  ExternalLink,
  Lightbulb,
  Scale,
  Star,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import Confetti from "react-confetti";
import LoadingSpinner, { InlineLoadingSpinner } from "../loading-spinner";

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  averageGuesses: number;
}

interface ScoreBreakdown {
  baseScore: number;
  hintPenalty: number;
  guessPenalty: number;
  similarityMultiplier: number;
  finalScore: number;
}

interface GameResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isVictory: boolean;
  numberOfGuesses: number;
  isDaily: boolean;
  article: {
    fullTitle: string;
    url: string;
  };
  victoryMessage: string;
  scoreBreakdown?: ScoreBreakdown | null;
  getNewArticle: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<WikiArticleHints, Error>>;
}

const StatBox = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: UseQueryResult<number | string, Error> | number | string;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-2 bg-secondary/10 ">
        <InlineLoadingSpinner size="sm" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  if (typeof value === "number" || typeof value === "string") {
    return (
      <div className="flex flex-col items-center p-2 bg-secondary/10 ">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  if (value.isError) {
    return <span>Error loading stats</span>;
  }

  if (!value.data) {
    return <span>N/A</span>;
  }

  return (
    <div className="flex flex-col items-center p-2 bg-secondary/10 ">
      <span className="text-2xl font-bold">{value.data}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
};

const ScoreItem = ({
  label,
  value,
  icon,
  color = "text-foreground",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-semibold ${color}`}>{value}</span>
  </div>
);

export const GameResultDialog = ({
  isOpen,
  onClose,
  isVictory,
  numberOfGuesses,
  isDaily,
  article,
  victoryMessage,
  scoreBreakdown,
  getNewArticle,
}: GameResultDialogProps) => {
  const [timeUntilMidnight, setTimeUntilMidnight] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  const router = useRouter();

  setInterval(() => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const timeLeft = midnight.getTime() - now.getTime();
    const hours = Math.floor(timeLeft / 1000 / 60 / 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    setTimeUntilMidnight({ hours, minutes, seconds });
  }, 1000);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isVictory && isOpen && (
        <Confetti
          recycle={true}
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          gravity={0.1}
          initialVelocityY={10}
          initialVelocityX={10}
          tweenDuration={1000}
          opacity={0.8}
        />
      )}
      <DialogContent className="sm:max-w-md gap-0">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-2xl font-bold gap-2">
            {isVictory ? (
              <>
                <Trophy className="h-6 w-6 text-yellow-500" />
                {victoryMessage}
              </>
            ) : (
              <>
                <Brain className="h-6 w-6 text-blue-500" />
                Better luck next time!
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {isVictory ? (
              <div className="flex flex-col gap-2 items-center justify-center">
                <div>
                  You got it in {numberOfGuesses}{" "}
                  {numberOfGuesses === 1 ? "guess" : "guesses"}!
                </div>
                <div>
                  The answer was: <strong>{article.fullTitle}</strong>
                </div>
              </div>
            ) : (
              <span>
                The answer was: <strong>{article.fullTitle}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isVictory && scoreBreakdown && (
          <div className="bg-secondary/5 rounded-lg p-4 my-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Score Breakdown
            </h3>
            <div className="space-y-1">
              <ScoreItem
                label="Starting Score"
                value={`+${scoreBreakdown.baseScore}`}
                icon={<Star className="h-4 w-4 text-yellow-500" />}
              />
              {scoreBreakdown.hintPenalty > 0 && (
                <ScoreItem
                  label={`Hint Penalty (${scoreBreakdown.hintPenalty / 20} hints)`}
                  value={`-${scoreBreakdown.hintPenalty}`}
                  icon={<Lightbulb className="h-4 w-4" />}
                  color="text-red-500"
                />
              )}
              {scoreBreakdown.guessPenalty > 0 && (
                <ScoreItem
                  label={`Wrong Guesses (${scoreBreakdown.guessPenalty / 10})`}
                  value={`-${scoreBreakdown.guessPenalty}`}
                  icon={<XCircle className="h-4 w-4" />}
                  color="text-red-500"
                />
              )}
              <ScoreItem
                label="Accuracy Multiplier"
                value={`×${scoreBreakdown.similarityMultiplier}`}
                icon={<Scale className="h-4 w-4" />}
                color="text-blue-500"
              />
              <div className="border-t mt-2 pt-2">
                <ScoreItem
                  label="Final Score"
                  value={scoreBreakdown.finalScore.toPrecision(3)}
                  icon={<Trophy className="h-4 w-4 text-yellow-500" />}
                  color="text-green-600"
                />
              </div>
            </div>
          </div>
        )}

        {isDaily ? <DailyStats /> : <UnlimitedStats />}

        <div className="flex gap-2 justify-center mt-4">
          <Button
            onClick={() => router.push("/protected/leaderboard")}
            variant="outline"
            className="group"
          >
            Leaderboard
            <BarChart2 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
          <Button
            onClick={() => window.open(article.url, "_blank")}
            variant="outline"
            className="group"
          >
            Read Article
            <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>

        {isDaily ? (
          <DailyContent />
        ) : (
          <UnlimitedContent getNewArticle={getNewArticle} />
        )}
      </DialogContent>
    </Dialog>
  );
};

const DailyStats = () => {
  const user = useUser();
  const dailyGamesPlayed = useUserDailyGamesPlayed(user.data?.id);
  const dailyWins = useUserDailyWins(user.data?.id);
  const winRate = (() => {
    if (dailyWins.isLoading || dailyGamesPlayed.isLoading) {
      return "N/A";
    }

    if (dailyWins.isError || dailyGamesPlayed.isError) {
      return "Error";
    }

    if (!dailyWins.data || !dailyGamesPlayed.data) {
      return "N/A";
    }

    if (dailyGamesPlayed.data === 0) {
      return "0%";
    }
    return `${Math.round((dailyWins.data / dailyGamesPlayed.data) * 100)}%`;
  })();
  const streak = useUserDailyStreak(user.data?.id);
  const currentStreak = streak.data?.currentStreak ?? "N/A";
  const bestStreak = streak.data?.bestStreak ?? "N/A";

  if (user.isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <StatBox
        label="Daily Games Played"
        value={dailyGamesPlayed}
        isLoading={dailyGamesPlayed.isLoading || dailyGamesPlayed.isFetching}
      />
      <StatBox
        label="Win Rate"
        value={winRate}
        isLoading={
          dailyWins.isLoading ||
          dailyGamesPlayed.isLoading ||
          dailyGamesPlayed.isFetching ||
          dailyWins.isFetching
        }
      />
      <StatBox
        label="Current Streak"
        value={currentStreak}
        isLoading={streak.isLoading || streak.isFetching}
      />
      <StatBox
        label="Best Streak"
        value={bestStreak}
        isLoading={streak.isLoading || streak.isFetching}
      />
    </div>
  );
};
const UnlimitedStats = () => {
  const user = useUser();
  const unlimitedGamesPlayed = useUserUnlimitedGamesPlayed(user.data?.id);
  const unlimitedWins = useUserUnlimitedWins(user.data?.id);
  const winRate = (() => {
    if (unlimitedWins.isLoading || unlimitedGamesPlayed.isLoading) {
      return "N/A";
    }

    if (unlimitedWins.isError || unlimitedGamesPlayed.isError) {
      return "Error";
    }

    if (!unlimitedWins.data || !unlimitedGamesPlayed.data) {
      return "N/A";
    }

    if (unlimitedGamesPlayed.data === 0) {
      return "0%";
    }
    return `${Math.round((unlimitedWins.data / unlimitedGamesPlayed.data) * 100)}%`;
  })();
  const streak = useUserUnlimitedStreak(user.data?.id);
  const currentStreak = streak.data?.currentStreak ?? "N/A";
  const bestStreak = streak.data?.bestStreak ?? "N/A";

  if (user.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <StatBox
        label="Unlimited Games Played"
        value={unlimitedGamesPlayed}
        isLoading={
          unlimitedGamesPlayed.isLoading || unlimitedGamesPlayed.isFetching
        }
      />
      <StatBox
        label="Win Rate"
        value={winRate}
        isLoading={
          unlimitedWins.isLoading ||
          unlimitedGamesPlayed.isLoading ||
          unlimitedGamesPlayed.isFetching ||
          unlimitedWins.isFetching
        }
      />
      <StatBox
        label="Current Streak"
        value={currentStreak}
        isLoading={streak.isLoading || streak.isFetching}
      />
      <StatBox
        label="Best Streak"
        value={bestStreak}
        isLoading={streak.isLoading || streak.isFetching}
      />
    </div>
  );
};

const DailyContent = () => {
  const [timeUntilMidnight, setTimeUntilMidnight] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      const timeLeft = midnight.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / 1000 / 60 / 60);
      const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);
      setTimeUntilMidnight({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center text-sm text-muted-foreground mt-4">
      <Timer className="inline-block mr-2 h-4 w-4" />
      Next daily challenge in:{" "}
      <span className="font-semibold w-16">
        {timeUntilMidnight.hours}h {timeUntilMidnight.minutes}m{" "}
        {timeUntilMidnight.seconds}s
      </span>
    </div>
  );
};

const UnlimitedContent = ({
  getNewArticle,
}: {
  getNewArticle: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<WikiArticleHints, Error>>;
}) => {
  return (
    <div className="flex flex-col gap-4 items-center mt-4">
      <Button
        onClick={() => {
          getNewArticle();
        }}
        variant="default"
        className="group w-full"
      >
        Play Another Round
        <Brain className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
      </Button>
    </div>
  );
};
