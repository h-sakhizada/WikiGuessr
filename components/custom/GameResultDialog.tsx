import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Timer,
  Brain,
  Share2,
  BarChart2,
  Star,
  XCircle,
  Lightbulb,
  Scale,
} from "lucide-react";
import Confetti from "react-confetti";

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
}

const dummyDailyStats: GameStats = {
  gamesPlayed: 42,
  gamesWon: 35,
  currentStreak: 7,
  bestStreak: 12,
  averageGuesses: 3.2,
};

const dummyUnlimitedStats: GameStats = {
  gamesPlayed: 156,
  gamesWon: 123,
  currentStreak: 15,
  bestStreak: 25,
  averageGuesses: 3.8,
};

const StatBox = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="flex flex-col items-center p-4 bg-secondary/10 rounded-lg">
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

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
}: GameResultDialogProps) => {
  const stats = isDaily ? dummyDailyStats : dummyUnlimitedStats;

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
      <DialogContent className="sm:max-w-md ">
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
              <span>
                You got it in {numberOfGuesses}{" "}
                {numberOfGuesses === 1 ? "guess" : "guesses"}!
              </span>
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

        <div className="grid grid-cols-2 gap-4 my-4">
          <StatBox label="Games Played" value={stats.gamesPlayed} />
          <StatBox
            label="Win Rate"
            value={`${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`}
          />
          <StatBox label="Current Streak" value={stats.currentStreak} />
          <StatBox label="Best Streak" value={stats.bestStreak} />
        </div>

        <div className="flex gap-2 justify-center mt-6">
          {/* <Button onClick={onClose} variant="secondary" className="group">
            Close
          </Button> */}
          {/* {isDaily && (
            <Button
              onClick={() => {
                // Implement share functionality
                const shareText = `WikiGuesser Daily Challenge\n${
                  isVictory
                    ? `Got it in ${numberOfGuesses} guesses!\nFinal Score: ${scoreBreakdown?.finalScore || 0}`
                    : "Better luck next time!"
                }\nPlay at: wikiguesser.com`;
                navigator.clipboard.writeText(shareText);
              }}
              className="group"
            >
              Share
              <Share2 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          )} */}
          <Button
            onClick={() => window.open(article.url, "_blank")}
            variant="outline"
            className="group"
          >
            Read Article
            <BarChart2 className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {isDaily && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <Timer className="inline-block mr-2 h-4 w-4" />
            Next daily challenge in:{" "}
            <span className="font-semibold">12:34:56</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
