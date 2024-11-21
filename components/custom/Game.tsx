import { addRandomBadgeToUserCollection } from "@/actions/badge-actions";
import { addVictory } from "@/actions/profile-actions";
import { useProfile } from "@/hooks/useProfile";
import { FuzzyMatcher } from "@/lib/FuzzyMatcher";
import { WikiArticleHints } from "@/utils/wiki_utils";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Flag, Lightbulb, RefreshCw, Search, Trophy } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../loading-spinner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { GameResultDialog } from "./GameResultDialog";

interface GameProps {
  article: WikiArticleHints;
  refetchArticle: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<WikiArticleHints, Error>>;
  isUnlimited: boolean;
  title: string;
}

interface GuessResult {
  isMatch: boolean;
  message: string;
  type: "success" | "error";
  iconTheme: {
    primary: string;
    secondary: string;
  };
}

interface ScoreBreakdown {
  baseScore: number;
  hintPenalty: number;
  guessPenalty: number;
  similarityMultiplier: number;
  finalScore: number;
}

export default function Game(props: GameProps) {
  const profile = useProfile();
  const [currentHint, setCurrentHint] = useState(1);
  const [guess, setGuess] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [currentScore, setCurrentScore] = useState(100);
  const [finalScore, setFinalScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(
    null
  );
  const fuzzyMatcher = new FuzzyMatcher();

  if (profile.isLoading) {
    return <LoadingSpinner />;
  }
  if (!profile.data) {
    return redirect("/sign-in");
  }

  const calculateScoreBreakdown = (
    hintsUsed: number,
    incorrectAttempts: number,
    similarity: number
  ): ScoreBreakdown => {
    const baseScore = 100;
    const hintPenalty = Math.max(0, (hintsUsed - 1) * 20);
    const guessPenalty = incorrectAttempts * 10;
    const remainingScore = Math.max(0, baseScore - hintPenalty - guessPenalty);
    const finalScore = Math.round(remainingScore * similarity);

    return {
      baseScore,
      hintPenalty,
      guessPenalty,
      similarityMultiplier: similarity,
      finalScore,
    };
  };

  const endGame = (isWin: boolean, scoreValue: number = 0) => {
    setCurrentHint(6);
    setIsVictory(isWin);
    setShowResult(true);
    setFinalScore(scoreValue);
    setScoreBreakdown(null);
  };

  const showNextHint = () => {
    if (currentHint < 5) {
      const newScore = Math.max(0, currentScore - 20);
      setCurrentScore(newScore);
      setCurrentHint((prev) => Math.min(prev + 1, 6));

      if (newScore === 0) {
        endGame(false);
      }
    }
  };

  const resetHints = () => {
    setCurrentHint(1);
    setGuess("");
    setIncorrectGuesses(0);
    setCurrentScore(100);
    setFinalScore(0);
    setScoreBreakdown(null);
    props.refetchArticle();
  };
  const checkGuess = (): void => {
    if (guess.trim().length === 0) {
      toast.error("Please enter a guess!", {
        iconTheme: { primary: "red", secondary: "white" },
        duration: 1000,
      });
      return;
    }

    if (currentHint > 5 || !props.article) {
      return;
    }

    const match = fuzzyMatcher.match(guess, props.article.fullTitle);

    const getGuessResult = (similarity: number): GuessResult => {
      if (similarity === 1) {
        return {
          isMatch: true,
          message: "Perfect guess!",
          type: "success",
          iconTheme: { primary: "green", secondary: "white" },
        };
      }
      if (similarity >= 0.8) {
        return {
          isMatch: true,
          message: "Close enough! You got it!",
          type: "success",
          iconTheme: { primary: "green", secondary: "white" },
        };
      }
      if (similarity >= 0.2) {
        return {
          isMatch: false,
          message: "Sooo close!",
          type: "error",
          iconTheme: { primary: "orange", secondary: "white" },
        };
      }
      return {
        isMatch: false,
        message: "Nope! Try again.",
        type: "error",
        iconTheme: { primary: "red", secondary: "white" },
      };
    };

    const result = getGuessResult(match.similarity);

    if (result.type === "success") {
      const breakdown = calculateScoreBreakdown(
        currentHint,
        incorrectGuesses,
        Math.floor(match.similarity * 100) / 100
      );
      setScoreBreakdown(breakdown);
      setFinalScore(breakdown.finalScore);
      setCurrentHint(6);
      setIsVictory(true);
      setShowResult(true);
      addVictory(props.article.fullTitle);
      setVictoryMessage(`${result.message}`);

      try {
        const badgePromise = addRandomBadgeToUserCollection();
        if (badgePromise) {
          badgePromise.then(() => {
            toast.success("Badge awarded! 🎉", {
              iconTheme: { primary: "green", secondary: "white" },
            });
          });
        }
      } catch (error) {
        console.error("Error adding badge:", error);
        return;
      }
    } else {
      setIncorrectGuesses((prev) => prev + 1);
      const newScore = Math.max(0, currentScore - 10);
      setCurrentScore(newScore);

      if (newScore === 0) {
        endGame(false);
        return;
      }

      toast.error(result.message, {
        iconTheme: result.iconTheme,
      });

      if (currentHint === 5) {
        endGame(false);
      }
    }
  };

  const handleGiveUp = () => {
    endGame(false);
  };

  return (
    <div className="flex flex-col">
      <Toaster />
      <GameResultDialog
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        isVictory={isVictory}
        numberOfGuesses={incorrectGuesses + 1}
        isDaily={!props.isUnlimited}
        article={{
          fullTitle: props.article?.fullTitle || "",
          url: props.article?.url || "",
        }}
        victoryMessage={victoryMessage}
        scoreBreakdown={scoreBreakdown}
      />
      <main className="flex-1 container sm:mx-auto sm:px-4 py-8 px-0 ">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {props.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-4 py-2 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold">
                    Current Score: {currentScore}
                  </span>
                </div>
                {finalScore > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-green-600">
                      Final Score: {finalScore}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="guess"
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Enter your guess..."
                  className="flex-grow text-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      checkGuess();
                    }
                  }}
                  disabled={currentScore === 0 || currentHint === 6}
                />
                {isVictory || currentHint === 6 ? (
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={() => setShowResult(true)}
                    className="group"
                  >
                    <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform text-yellow-500" />
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={checkGuess}
                    disabled={currentHint > 5 || currentScore === 0}
                    className="group"
                  >
                    <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                )}
                {props.isUnlimited && (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={resetHints}
                    className="group"
                  >
                    New Article
                    <RefreshCw className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <HintSection title="Related Topics" isVisible={currentHint >= 1}>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {props.article?.hint1.map((link, index) => (
                <li key={index}>{link}</li>
              ))}
            </ul>
          </HintSection>

          <HintSection title="Image" isVisible={currentHint >= 2}>
            {props.article?.hint2 ? (
              <div className="flex justify-center">
                <Image
                  src={props.article.hint2}
                  alt="Article image"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No image available for this article. This one's a toughie! 🤔
              </p>
            )}
          </HintSection>

          <HintSection
            title="Additional Information"
            isVisible={currentHint >= 3}
          >
            {props.article?.hint3 && formatInfoBox(props.article.hint3)}
          </HintSection>

          <HintSection title="More Related Links" isVisible={currentHint >= 4}>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {props.article?.hint4.map((link) => <li key={link}>{link}</li>)}
            </ul>
          </HintSection>

          <HintSection title="Summary" isVisible={currentHint >= 5}>
            <p className="text-muted-foreground leading-relaxed">
              {props.article?.hint5}
            </p>
          </HintSection>
        </div>

        <div className="flex justify-center">
          {currentHint === 5 ? (
            <Button
              size="lg"
              onClick={handleGiveUp}
              className="group flex items-center gap-2"
              variant="destructive"
            >
              Give Up
              <Flag className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={showNextHint}
              className="group flex items-center gap-2"
              variant="secondary"
              disabled={currentScore <= 20}
            >
              Show Next Hint
              <Lightbulb className="h-4 w-4 group-hover:text-yellow-400 transition-colors" />
              <span className="text-sm text-red-500">-20 points</span>
            </Button>
          )}
        </div>

        {currentHint === 1 && (
          <section className="bg-secondary/10 rounded-lg p-8 mt-12">
            <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
            <p className="text-lg text-muted-foreground">
              Get up to 5 hints to guess today's Wikipedia article. The fewer
              hints you need, the better! Each hint costs 20 points and each
              wrong guess costs 10 points. Start with 100 points and try to keep
              your score high! The game ends if your score reaches 0.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

const HintSection = ({
  title,
  isVisible,
  children,
}: {
  title: string;
  isVisible: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isVisible ? " opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
      }`}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-2">
            {title}
            <Lightbulb className="h-6 w-6 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};

interface InfoboxProps {
  info: Record<string, any>;
}
const WikipediaInfobox = ({ info }: InfoboxProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-secondary/10">
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(info).map(([key, value]) => (
            <tr key={key} className="border-b last:border-b-0">
              <th className="p-2 text-left font-semibold bg-secondary/20 w-1/3 align-top">
                {key.replace(/_/g, " ").charAt(0).toUpperCase() +
                  key.replace(/_/g, " ").slice(1)}
              </th>
              <td className="p-2">
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside">
                    {value.map((item, index) => (
                      <li key={index}>{item.toString()}</li>
                    ))}
                  </ul>
                ) : (
                  <span>{value.toString()}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatInfoBox = (hint3: string) => {
  try {
    if (!hint3) {
      return (
        <p className="text-muted-foreground text-center py-4">
          Uh oh! Looks like there's no additional data for this article. You're
          on your own for this one! 🎲
        </p>
      );
    }

    const info = JSON.parse(hint3);
    if (Object.keys(info).length === 0) {
      return (
        <p className="text-muted-foreground text-center py-4">
          Uh oh! Looks like there's no additional data for this article. You're
          on your own for this one! 🎲
        </p>
      );
    }

    return <WikipediaInfobox info={info} />;
  } catch (error) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Uh oh! Looks like there's no additional data for this article. You're on
        your own for this one! 🎲
      </p>
    );
  }
};
