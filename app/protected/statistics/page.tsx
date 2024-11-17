"use client";
import LoadingSpinner from "@/components/loading-spinner";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default function StatisticsPage() {
  const { data: user, isLoading, refetch } = useProfile();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return redirect("/sign-in");

  const VictoryString = () =>
  {
    var output = "";
    user.victories?.map((vic) => output += ("" + vic + ", "));
    return output;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <header className="text-center mb-2">
        <h1 className="text-2xl font-bold">Statistics Page</h1>
      </header>

      <div className="flex items-stretch">
        <div className="space-y-2 pb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Highest Score
          </label>
          <p className="w-24 truncate text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
            N/A
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Weekly Highest Score
          </label>
          <p className="w-24 truncate text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
            N/A
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            All-Time Highest Score
          </label>
          <p className="w-24 truncate text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
            {user.victories?.length == null ? "N/A" : user.victories?.length}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Victories
        </label>
        <p className="flex-grow text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
          {user.victories?.toString() == null ? "No Victories? Play a Game Already" : VictoryString()}
        </p>
      </div>
    </div>
  );
}
