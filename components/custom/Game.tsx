import { addRandomBadgeToUserCollection } from "@/actions/badge-actions";
import { saveGameResult } from "@/actions/game-actions";
import { useProfile } from "@/hooks/useProfile";
import { FuzzyMatcher } from "@/lib/FuzzyMatcher";
import { WikiArticleHints } from "@/utils/wiki_utils";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Flag, Lightbulb, RefreshCw, Search, Trophy } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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
  dailyGameId?: string | null;
}

interface GameState {
  currentHint: number;
  attempts: number;
  score: number;
  isGameOver: boolean;
  isVictory: boolean;
}

interface ScoreBreakdown {
  baseScore: number;
  hintPenalty: number;
  guessPenalty: number;
  similarityMultiplier: number;
  finalScore: number;
}
interface SavedGameState extends GameState {
  articleTitle: string;
  timestamp: number;
}

const GAME_STATE_KEY = "wikigame_state";
const GAME_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function Game(props: GameProps) {
  const getSavedGameState = (): SavedGameState | null => {
    try {
      const saved = localStorage.getItem(GAME_STATE_KEY);
      if (!saved) return null;

      const state = JSON.parse(saved) as SavedGameState;

      // Check if the saved state has expired
      if (Date.now() - state.timestamp > GAME_EXPIRY_TIME) {
        clearSavedGameState();
        return null;
      }

      return state;
    } catch (error) {
      console.error("Error loading game state:", error);
      return null;
    }
  };

  const profile = useProfile();
  const [gameState, setGameState] = useState<GameState>(
    getSavedGameState() ?? {
      currentHint: 1,
      attempts: 0,
      score: 100,
      isGameOver: false,
      isVictory: false,
    }
  );
  const [guess, setGuess] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(
    null
  );
  const fuzzyMatcher = new FuzzyMatcher();

  // Load saved game state on component mount
  useEffect(() => {
    const savedState = getSavedGameState();
    if (savedState && savedState.articleTitle === props.article.fullTitle) {
      setGameState({
        currentHint: savedState.currentHint,
        attempts: savedState.attempts,
        score: savedState.score,
        isGameOver: savedState.isGameOver,
        isVictory: savedState.isVictory,
      });
    } else {
      // Clear expired or irrelevant saved state
      clearSavedGameState();
    }
  }, [props.article.fullTitle]);

  // Save game state whenever it changes
  useEffect(() => {
    if (props.article.fullTitle) {
      saveGameState({
        ...gameState,
        articleTitle: props.article.fullTitle,
        timestamp: Date.now(),
      });
    }
  }, [gameState, props.article.fullTitle]);

  const saveGameState = (state: SavedGameState) => {
    try {
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const clearSavedGameState = () => {
    try {
      localStorage.removeItem(GAME_STATE_KEY);
    } catch (error) {
      console.error("Error clearing game state:", error);
    }
  };

  if (profile.isLoading) return <LoadingSpinner />;
  if (!profile.data) return redirect("/sign-in");

  const calculateScoreBreakdown = (
    hintsUsed: number,
    attempts: number,
    similarity: number
  ): ScoreBreakdown => {
    const baseScore = 100;
    const hintPenalty = Math.max(0, (hintsUsed - 1) * 20);
    // For correct guesses, we don't want to count the successful attempt as a penalty
    const guessPenalty = Math.max(0, (attempts - 1) * 10); // Subtract 1 to not penalize the successful guess
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

  const endGame = async (
    isWin: boolean,
    scoreValue: number = 0,
    breakdown?: ScoreBreakdown
  ) => {
    // Don't increment attempts here since it's already been incremented in checkGuess
    setGameState((prev) => ({
      ...prev,
      currentHint: 6,
      isGameOver: true,
      isVictory: isWin,
    }));

    setShowResult(true);
    setFinalScore(scoreValue);
    setScoreBreakdown(breakdown || null);
    setVictoryMessage(
      isWin ? "Congratulations! You got it!" : "Better luck next time!"
    );

    if (!profile.data) {
      toast.error("Failed to save game result");
      return;
    }

    try {
      // Get the current attempts value from gameState
      const validAttempts = Math.min(Math.max(1, gameState.attempts + 1), 10);

      await saveGameResult({
        articleTitle: props.article.fullTitle,
        isVictory: isWin,
        score: Math.max(0, Math.min(scoreValue, 100)),
        userId: profile.data.user_id,
        isUnlimited: props.isUnlimited,
        attempts: validAttempts,
        daily_game_id: props.isUnlimited ? null : props.dailyGameId,
      });
    } catch (error) {
      console.error("Error saving game result:", error);
      toast.error("Failed to save game result");
    }
  };

  const showNextHint = () => {
    if (gameState.currentHint < 5) {
      const newScore = Math.max(0, gameState.score - 20);
      setGameState((prev) => ({
        ...prev,
        currentHint: Math.min(prev.currentHint + 1, 6),
        score: newScore,
      }));

      if (newScore === 0) {
        endGame(false, newScore);
      }
    }
  };

  const resetGame = () => {
    setGameState({
      currentHint: 1,
      attempts: 0,
      score: 100,
      isGameOver: false,
      isVictory: false,
    });
    setGuess("");
    setFinalScore(0);
    setScoreBreakdown(null);
    props.refetchArticle();
  };

  const handleGiveUp = () => {
    // Increment attempts before giving up
    setGameState((prev) => ({
      ...prev,
      attempts: prev.attempts + 1,
    }));
    endGame(false, 0);
  };

  const checkGuess = async (): Promise<void> => {
    if (guess.trim().length === 0) {
      toast.error("Please enter a guess!", {
        iconTheme: { primary: "red", secondary: "white" },
        duration: 1000,
      });
      return;
    }

    if (gameState.currentHint > 5 || !props.article) return;

    const match = fuzzyMatcher.match(guess, props.article.fullTitle);
    const isCorrect = match.similarity >= 0.8;

    if (isCorrect) {
      // For correct guesses, use current attempts for score calculation
      // This way, only previous wrong guesses are penalized
      const breakdown = calculateScoreBreakdown(
        gameState.currentHint,
        gameState.attempts, // Use current attempts, not incremented
        Math.floor(match.similarity * 100) / 100
      );

      // Update attempts after calculating score
      setGameState((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
      }));

      endGame(true, breakdown.finalScore, breakdown);

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
      }
    } else {
      // For wrong guesses, increment attempts first
      const newAttempts = gameState.attempts + 1;
      const newScore = Math.max(0, gameState.score - 10);

      setGameState((prev) => ({
        ...prev,
        score: newScore,
        attempts: newAttempts,
      }));

      if (newScore === 0 || gameState.currentHint === 5) {
        endGame(false, newScore);
      } else {
        const message =
          match.similarity >= 0.2 ? "Sooo close!" : "Nope! Try again.";
        toast.error(message, {
          iconTheme: {
            primary: match.similarity >= 0.2 ? "orange" : "red",
            secondary: "white",
          },
        });
      }
    }
  };

  const getVictoryMessage = () => {
    if (victoryMessage) return victoryMessage;
    if (gameState.isVictory) {
      return "Congratulations! You got it!";
    }
    return "Better luck next time!";
  };

  return (
    <div className="flex flex-col">
      <Toaster />
      <GameResultDialog
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        isVictory={gameState.isVictory}
        numberOfGuesses={gameState.attempts}
        isDaily={!props.isUnlimited}
        article={{
          fullTitle: props.article?.fullTitle || "",
          url: props.article?.url || "",
        }}
        victoryMessage={getVictoryMessage()}
        scoreBreakdown={scoreBreakdown}
      />
      <main className="flex-1 container sm:mx-auto sm:px-4 py-8 px-0">
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
                    Current Score: {gameState.score}
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
                  disabled={
                    gameState.score === 0 || gameState.currentHint === 6
                  }
                />
                {gameState.isVictory || gameState.currentHint === 6 ? (
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
                    disabled={
                      gameState.currentHint > 5 || gameState.score === 0
                    }
                    className="group"
                  >
                    <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                )}
                {props.isUnlimited && (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={resetGame}
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
          <HintSection
            title="Related Topics"
            isVisible={gameState.currentHint >= 1}
          >
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {props.article?.hint1.map((link, index) => (
                <li key={index}>{link}</li>
              ))}
            </ul>
          </HintSection>

          <HintSection title="Image" isVisible={gameState.currentHint >= 2}>
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
            isVisible={gameState.currentHint >= 3}
          >
            {props.article?.hint3 && formatInfoBox(props.article.hint3)}
          </HintSection>

          <HintSection
            title="More Related Links"
            isVisible={gameState.currentHint >= 4}
          >
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {props.article?.hint4.map((link) => <li key={link}>{link}</li>)}
            </ul>
          </HintSection>

          <HintSection title="Summary" isVisible={gameState.currentHint >= 5}>
            <p className="text-muted-foreground leading-relaxed">
              {props.article?.hint5}
            </p>
          </HintSection>
        </div>

        <div className="flex justify-center">
          {gameState.currentHint === 5 ? (
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
              disabled={gameState.score <= 20}
            >
              Show Next Hint
              <Lightbulb className="h-4 w-4 group-hover:text-yellow-400 transition-colors" />
              <span className="text-sm text-red-500">-20 points</span>
            </Button>
          )}
        </div>

        {gameState.currentHint === 1 && (
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

interface HintSectionProps {
  title: string;
  isVisible: boolean;
  children: React.ReactNode;
}

const HintSection = ({ title, isVisible, children }: HintSectionProps) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isVisible ? "opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
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

export default Game;
