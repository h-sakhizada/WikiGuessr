import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHasUserPlayedDailyGame } from "@/hooks/useHasUserPlayedDailyGame";
import { useUser } from "@/hooks/useUser";
import { BarChart2, Clock, RefreshCw, UserCircle, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import LoadingSpinner from "../loading-spinner";

interface SecureGameWrapperProps {
  children: React.ReactNode;
  isUnlimited?: boolean;
  dailyGameId?: string | null;
}

const SecureGameWrapper = ({
  children,
  isUnlimited = false,
  dailyGameId = null,
}: SecureGameWrapperProps) => {
  const user = useUser();
  const { data: hasPlayed, isLoading: checkingPlayStatus } =
    useHasUserPlayedDailyGame(user.data?.id, dailyGameId);

  // Show loading state while checking auth or play status
  if (user.isLoading || checkingPlayStatus) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to sign in if no user
  if (!user.data) {
    redirect("/sign-in");
  }

  // If this is a daily game and user has already played, show already played screen
  if (!isUnlimited && hasPlayed) {
    return <AlreadyPlayed isPremium={user.data.is_premium} />;
  }

  // Only render game if all checks pass
  return <>{children}</>;
};

const AlreadyPlayed = ({ isPremium }: { isPremium: boolean | null }) => {
  // Calculate time until next game
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(timeUntilTomorrow / (1000 * 60 * 60));
  const minutes = Math.floor(
    (timeUntilTomorrow % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-fit w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center ">
            You've Already Played Today!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">
              Come back tomorrow for a new challenge!
            </p>
            <div className="flex items-center justify-center gap-2 text-lg font-semibold mt-4">
              <Clock className="h-5 w-5 text-primary" />
              <span>
                Next game in: {hours}h {minutes}m
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-4">
          {isPremium ? (
            <Link href="/protected/unlimited">
              <Button variant="secondary" className="group">
                <RefreshCw className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
                Play Unlimited Mode
              </Button>
            </Link>
          ) : (
            <Link href="/protected/transaction">
              <Button variant="action" className="group">
                <Zap className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
                Go Premium for Unlimited Games
              </Button>
            </Link>
          )}
          <Link href="/protected/account">
            <Button variant="outline" className="group">
              <UserCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
              View Profile
            </Button>
          </Link>
          <Link href="/protected/leaderboard">
            <Button variant="outline" className="group">
              <BarChart2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
              View Leaderboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export { AlreadyPlayed, SecureGameWrapper };
