"use client";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import LoadingSpinner from "@/components/loading-spinner";
import { useUser } from "@/hooks/useUser";
import { redirect } from "next/navigation";
import { useAllVictoriesForDayByUser, useAllVictoriesForWeekByUser, useAllVictoriesByUser } from "@/hooks/useLeaderboard";

export default function StatisticsPage() {
  const { data: user, isLoading: isLoading } = useUser();
  const { data: DailyVictories, isLoading: isDailyVictoriesLoading, error: DailyVictoriesError } = useAllVictoriesForDayByUser(user?.id);
  const { data: WeeklyVictories, isLoading: isWeeklyVictoriesLoading, error: WeeklyVictoriesError } = useAllVictoriesForWeekByUser(user?.id);
  const { data: TotalVictories, isLoading: isTotalVictoriesLoading, error: TotalVictoriesError } = useAllVictoriesByUser(user?.id);
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return redirect("/sign-in");

  const VictoryString = () =>
    {
      var output = "";
      TotalVictories?.names?.map((vic) => output += ("" + vic + ", "));
      return output;
    }

    // console.log(TotalVictories);

  return (
    <>
      <Breadcrumb />
      <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <header className="text-center mb-2">
        <h1 className="text-2xl font-bold">Statistics Page</h1>
      </header>

      
        <div className="space-y-2 pb-4">
          <label className="block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Victories Today!
          </label>
          <p className="w-42 text-center truncate text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
            Total: {DailyVictories?.total}, Daily: {DailyVictories?.daily}, Unlimited: {DailyVictories?.unlimited}
          </p>
        </div>

        <div className="space-y-2 pb-4">
          <label className="block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Victories This WeeK!
          </label>
          <p className="w-42 text-center truncate text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
          Total: {WeeklyVictories?.total}, Daily: {WeeklyVictories?.daily}, Unlimited: {WeeklyVictories?.unlimited}
          </p>
        </div>

        <div className="space-y-2 pb-4">
          <label className="block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            All time Victories
          </label>
          <p className="w-42 text-center truncate text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
          Total: {TotalVictories?.total}, Daily: {TotalVictories?.daily}, Unlimited: {TotalVictories?.unlimited}
          </p>
        </div>
      

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Victories
        </label>
        <p className="flex-grow text-center text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
          {TotalVictories?.names.length == 0 ? "No Victories? Play a Game Already" : VictoryString()}
        </p>
      </div>

    </div>
    </>
  );
}
