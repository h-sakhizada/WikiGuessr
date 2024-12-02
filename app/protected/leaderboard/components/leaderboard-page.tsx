"use client";
import LoadingSpinner from "@/components/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAlltimeDailyLeaderboard,
  useAlltimeUnlimitedLeaderboard,
  useDailyLeaderboard,
  useWeeklyDailyLeaderboard,
  useWeeklyUnlimitedLeaderboard,
} from "@/hooks/useLeaderboard";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { Award, CircleUserRound, Medal, Trophy } from "lucide-react";
import { LeaderboardEntry } from "../types";

const LeaderboardTable = ({
  entries,
  showAverage = true,
}: {
  entries: LeaderboardEntry[];
  showAverage?: boolean;
}) => {
  const user = useUser();

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-secondary/20">
          <tr>
            <th className="px-2 sm:px-6 py-3">Rank</th>
            <th className="px-2 sm:px-6 py-3">Player</th>
            <th className="px-2 sm:px-6 py-3">Score</th>
            <th className="px-2 sm:px-6 py-3 table-cell">Games</th>
            {showAverage && (
              <th className="px-2 sm:px-6 py-3 table-cell">Avg</th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.user_id}
              className="border-b hover:bg-secondary/10 transition-colors"
            >
              <td className="px-2 sm:px-6 py-4 flex items-center gap-2 text-xs sm:text-sm">
                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                {index === 2 && <Award className="h-4 w-4 text-amber-600" />}
                {index + 1}
              </td>
              <td
                className={cn(
                  "px-2 sm:px-6 py-4 font-medium text-xs sm:text-sm",
                  {
                    "text-purple-400": entry.username === user.data?.username,
                  }
                )}
              >
                {entry.username === user.data?.username ? (
                  <div className="flex items-center justify-start">
                    <CircleUserRound className="h-4 w-4 text-purple-400 inline-block mr-2" />
                    <strong>{entry.username}</strong>
                  </div>
                ) : (
                  entry.username
                )}
              </td>
              <td className="px-2 sm:px-6 py-4 text-xs sm:text-sm">
                {Math.round(entry.score).toLocaleString()}
              </td>
              <td className="px-2 sm:px-6 py-4 table-cell">
                {entry.games_played}
              </td>
              {showAverage && (
                <td className="px-2 sm:px-6 py-4 table-cell">
                  {Math.round(entry.avg_score).toLocaleString()}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StatsCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardHeader className="p-4 sm:p-6">
      <CardTitle className="text-sm sm:text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 sm:p-6">
      <p className="text-lg sm:text-2xl font-bold">{value.toLocaleString()}</p>
    </CardContent>
  </Card>
);

const LeaderboardTabContent = ({
  title,
  description,
  entries,
  isLoading,
  error,
  showAverage = true,
}: {
  title: string;
  description: string;
  entries?: LeaderboardEntry[];
  isLoading: boolean;
  error?: Error | null;
  showAverage?: boolean;
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading data: {error.message}</div>;
  if (!entries || entries.length === 0)
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center my-6 sm:my-12 p-4 sm:p-8 border border-white rounded-md">
            <p>No Leaderboard Data Available.</p>
            <p className="text-sm">Check back later for updated results.</p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <LeaderboardTable entries={entries} showAverage={showAverage} />
      </CardContent>
    </Card>
  );
};

export default function LeaderboardClientPage() {
  const {
    data: dailyData,
    isLoading: isDailyLoading,
    error: dailyError,
  } = useDailyLeaderboard();
  const {
    data: weeklyDailyData,
    isLoading: isWeeklyDailyLoading,
    error: weeklyDailyError,
  } = useWeeklyDailyLeaderboard();
  const {
    data: weeklyUnlimitedData,
    isLoading: isWeeklyUnlimitedLoading,
    error: weeklyUnlimitedError,
  } = useWeeklyUnlimitedLeaderboard();
  const {
    data: alltimeDailyData,
    isLoading: isAlltimeDailyLoading,
    error: alltimeDailyError,
  } = useAlltimeDailyLeaderboard();
  const {
    data: alltimeUnlimitedData,
    isLoading: isAlltimeUnlimitedLoading,
    error: alltimeUnlimitedError,
  } = useAlltimeUnlimitedLeaderboard();

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-4xl font-bold text-start mb-4 sm:mb-8">
        Leaderboards
      </h1>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full h-fit grid-cols-1 lg:grid-cols-5 gap-1">
          <TabsTrigger value="daily" className="text-xs sm:text-sm">
            Today's Daily
          </TabsTrigger>
          <TabsTrigger value="weekly-daily" className="text-xs sm:text-sm">
            Weekly Daily
          </TabsTrigger>
          <TabsTrigger value="weekly-unlimited" className="text-xs sm:text-sm">
            Weekly Unlimited
          </TabsTrigger>
          <TabsTrigger value="alltime-daily" className="text-xs sm:text-sm">
            All-time Daily
          </TabsTrigger>
          <TabsTrigger value="alltime-unlimited" className="text-xs sm:text-sm">
            All-time Unlimited
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <LeaderboardTabContent
            title="Today's Daily Challenge"
            description="Top scores for today's daily challenge"
            entries={dailyData}
            isLoading={isDailyLoading}
            error={dailyError}
            showAverage={false}
          />
        </TabsContent>

        <TabsContent value="weekly-daily">
          <LeaderboardTabContent
            title="Weekly Daily Challenge"
            description="Top performers in daily challenges this week"
            entries={weeklyDailyData}
            isLoading={isWeeklyDailyLoading}
            error={weeklyDailyError}
          />
        </TabsContent>

        <TabsContent value="weekly-unlimited">
          <LeaderboardTabContent
            title="Weekly Unlimited Mode"
            description="Top performers in unlimited mode this week"
            entries={weeklyUnlimitedData}
            isLoading={isWeeklyUnlimitedLoading}
            error={weeklyUnlimitedError}
          />
        </TabsContent>

        <TabsContent value="alltime-daily">
          <LeaderboardTabContent
            title="All-time Daily Challenge"
            description="Best daily challenge players of all time"
            entries={alltimeDailyData}
            isLoading={isAlltimeDailyLoading}
            error={alltimeDailyError}
          />
        </TabsContent>

        <TabsContent value="alltime-unlimited">
          <LeaderboardTabContent
            title="All-time Unlimited Mode"
            description="Best unlimited mode players of all time"
            entries={alltimeUnlimitedData}
            isLoading={isAlltimeUnlimitedLoading}
            error={alltimeUnlimitedError}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
