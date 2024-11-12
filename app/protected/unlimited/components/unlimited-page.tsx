"use client";
import { addRandomBadgeToUserCollection } from "@/actions/badge-actions";
import { addVictory } from "@/actions/profile-actions";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useDailyGame from "@/hooks/useDailyGame";
import { useProfile } from "@/hooks/useProfile";
import useRandomWikipediaArticle from "@/hooks/useRandomWikipediaArticle";
import { FuzzyMatcher } from "@/lib/FuzzyMatcher";
import { ExternalLink, Lightbulb, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface InfoboxProps {
  info: Record<string, any>;
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
        isVisible ? "max-h-[1000px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
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

const formatHint3 = (hint3: string) => {
  try {
    const info = JSON.parse(hint3);
    return <WikipediaInfobox info={info} />;
  } catch (error) {
    console.error("Error parsing hint3:", error);
    return <p>{hint3}</p>;
  }
};

export default function UnlimitedCLientPage() {
  const user = useProfile();
  const {
    data: article,
    isLoading,
    error,
    refetch,
  } = useRandomWikipediaArticle();
  const [currentHint, setCurrentHint] = useState(1);
  const [guess, setGuess] = useState("");

  const fuzzyMatcher = new FuzzyMatcher();

  if (user.isLoading || isLoading) {
    return <LoadingSpinner />;
  }
  if (!user.data) {
    return redirect("/sign-in");
  }
  if (error) {
    return <div>Error fetching random Wikipedia article</div>;
  }

  const showNextHint = () => {
    setCurrentHint((prev) => Math.min(prev + 1, 6));
  };

  const resetHints = () => {
    setCurrentHint(1);
    setGuess("");
    refetch();
  };

  const checkGuess = (): void => {
    if (guess.trim().length === 0) {
      toast.error("Please enter a guess!", {
        iconTheme: { primary: "red", secondary: "white" },
        duration: 1000,
      });
      return;
    }

    if (currentHint > 5 || !article) {
      return;
    }

    const match = fuzzyMatcher.match(article.fullTitle, guess);

    const getGuessResult = (similarity: number): GuessResult => {
      // Exact or near-exact match
      if (similarity === 1) {
        return {
          isMatch: true,
          message: "You got it! Perfect match!",
          type: "success",
          iconTheme: { primary: "green", secondary: "white" },
        };
      }

      if (similarity >= 0.95) {
        return {
          isMatch: true,
          message: "You got it!",
          type: "success",
          iconTheme: { primary: "green", secondary: "white" },
        };
      }
      // Close enough to count
      if (similarity >= 0.8) {
        return {
          isMatch: true,
          message: "Yeah, close enough! You got it!",
          type: "success",
          iconTheme: { primary: "green", secondary: "white" },
        };
      }
      // Very close but not quite
      if (similarity >= 0.2) {
        return {
          isMatch: false,
          message: "Sooo close!",
          type: "error",
          iconTheme: { primary: "orange", secondary: "white" },
        };
      }
      // Not close enough
      return {
        isMatch: false,
        message: "Nope! Try again.",
        type: "error",
        iconTheme: { primary: "red", secondary: "white" },
      };
    };

    const result = getGuessResult(match.similarity);

    // Show appropriate toast
    if (result.type === "success") {
      toast.success(result.message, {
        iconTheme: result.iconTheme,
      });
      setCurrentHint(6);
      addVictory(article.fullTitle);
      toast.promise(addRandomBadgeToUserCollection(), {
        loading: "Awarding Badge...",
        success: (data) =>
          data
            ? "A new badge has been added to your profile!"
            : "No available badges!",
        error: "Error adding badge!",
      });
    } else {
      toast.error(result.message, {
        iconTheme: result.iconTheme,
      });
      setCurrentHint((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col">
      <Toaster />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Unlimited Wikipedia Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                id="guess"
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess..."
                className="flex-grow text-lg"
              />
              <Button
                variant="default"
                size="default"
                onClick={checkGuess}
                disabled={currentHint > 5}
                className="group"
              >
                <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={resetHints}
                className="group"
              >
                New Article
                <RefreshCw className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <HintSection title="Related Topics" isVisible={currentHint >= 1}>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {article?.hint1.map((link, index) => <li key={index}>{link}</li>)}
            </ul>
          </HintSection>

          <HintSection title="Image" isVisible={currentHint >= 2}>
            {article?.hint2 && (
              <div className="flex justify-center">
                <Image
                  src={article.hint2}
                  alt="Article image"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </HintSection>

          <HintSection
            title="Additional Information"
            isVisible={currentHint >= 3}
          >
            {article?.hint3 && formatHint3(article.hint3)}
          </HintSection>

          <HintSection title="Title Initials" isVisible={currentHint >= 4}>
            <p className="text-lg text-muted-foreground">{article?.hint4}</p>
          </HintSection>

          <HintSection title="Summary" isVisible={currentHint >= 5}>
            <p className="text-muted-foreground leading-relaxed">
              {article?.hint5}
            </p>
          </HintSection>

          <HintSection title="Answer" isVisible={currentHint >= 6}>
            <p className="text-lg">
              The answer was:{" "}
              <span className="font-medium">{article?.fullTitle}</span>
            </p>
          </HintSection>

          <div className="flex justify-center pt-4">
            {currentHint < 5 ? (
              <Button size="lg" onClick={showNextHint} className="group">
                Show Next Hint
                <Lightbulb className="ml-2 h-4 w-4 group-hover:text-yellow-400 transition-colors" />
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  disabled={currentHint > 5}
                  onClick={showNextHint}
                  className="group"
                >
                  Reveal Answer
                  <Lightbulb className="ml-2 h-4 w-4 group-hover:text-yellow-400 transition-colors" />
                </Button>
                <Button
                  disabled={currentHint < 6}
                  onClick={() => window.open(article?.url, "_blank")}
                  variant="secondary"
                  className="group"
                >
                  Visit Page
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <section className="bg-secondary/10 rounded-lg p-8 mt-12">
          <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
          <p className="text-lg text-muted-foreground">
            Get up to 5 hints to guess today's Wikipedia article. The fewer
            hints you need, the better! New challenge every day.
          </p>
        </section>
      </main>
    </div>
  );
}
