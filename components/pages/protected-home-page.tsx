"use client";
import { useProfile } from "@/hooks/useProfile";
import {
  AwardIcon,
  GamepadIcon,
  InfinityIcon,
  LockIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import LoadingSpinner from "../loading-spinner";

export default function ProtectedHomePage() {
  const user = useProfile();

  if (user.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user.data) {
    return redirect("/sign-in");
  }

  const otherActions = [
    {
      title: "Account",
      icon: UserIcon,
      color: "text-blue-500",
      link: "/protected/account",
    },
    {
      title: "Leaderboards",
      icon: TrophyIcon,
      color: "text-yellow-500",
      link: "/protected/leaderboard",
    },
    {
      title: "Badge Shop",
      icon: AwardIcon,
      color: "text-pink-500",
      link: "/protected/badges",
    },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <header className="text-left mb-2">
        <h1 className="text-2xl font-bold">Hi, {user.data.username}!</h1>
      </header>
      <Link href={"/protected/daily"}>
        <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer bg-green-50 dark:bg-green-900/20">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-green-700 dark:text-green-300">
              <GamepadIcon size={28} />
              Daily Challenge
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-4 text-center text-green-600 dark:text-green-400">
            Play today's featured game!
          </CardContent>
        </Card>
      </Link>

      {user.data.is_premium ? (
        <Link href={"/protected/unlimited"}>
          <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer bg-purple-50 dark:bg-purple-900/20">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center justify-center gap-2 text-lg text-purple-700 dark:text-purple-300">
                <InfinityIcon size={24} />
                Unlimited Play
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ) : (
        <Card className="overflow-hidden transition-all cursor-not-allowed bg-gray-100 dark:bg-gray-800">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center justify-center gap-2 text-lg text-gray-500 dark:text-gray-400">
              <LockIcon size={24} />
              Unlimited Play (Premium Only)
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2 mt-1">
        {otherActions.map((action, index) => (
          <Link href={action.link} key={index}>
            <Card className="overflow-hidden transition-all hover:shadow-sm cursor-pointer">
              <CardHeader className="p-2 text-center">
                <CardTitle className="flex flex-col items-center gap-1 text-xs">
                  <action.icon size={20} className={action.color} />
                  <span>{action.title}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
