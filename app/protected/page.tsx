import React from "react";
import { createClient } from "@/utils/supabase/server";
import {
  UserIcon,
  GamepadIcon,
  InfinityIcon,
  TrophyIcon,
  AwardIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ProtectedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const otherActions = [
    { title: "Account", icon: UserIcon, color: "text-blue-500" },
    { title: "Leaderboards", icon: TrophyIcon, color: "text-yellow-500" },
    { title: "Badges", icon: AwardIcon, color: "text-pink-500" },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <header className="text-left mb-2">
        <h1 className="text-2xl font-bold">Hi, {user.email?.split("@")[0]}!</h1>
      </header>

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

      <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer bg-purple-50 dark:bg-purple-900/20">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center justify-center gap-2 text-lg text-purple-700 dark:text-purple-300">
            <InfinityIcon size={24} />
            Unlimited Play
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-2 mt-1">
        {otherActions.map((action, index) => (
          <Card
            key={index}
            className="overflow-hidden transition-all hover:shadow-sm cursor-pointer"
          >
            <CardHeader className="p-2 text-center">
              <CardTitle className="flex flex-col items-center gap-1 text-xs">
                <action.icon size={20} className={action.color} />
                <span>{action.title}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
