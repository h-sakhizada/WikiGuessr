"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Medal, Trophy } from "lucide-react";

import LoadingSpinner from "@/components/loading-spinner";
import {
  useAlltimeDailyLeaderboard,
  useAlltimeGameCounts,
  useAlltimeUnlimitedLeaderboard,
  useDailyLeaderboard,
  useWeeklyDailyLeaderboard,
  useWeeklyGameCounts,
  useWeeklyUnlimitedLeaderboard,
} from "@/hooks/useLeaderboard";
import { LeaderboardEntry } from "../types";

const LeaderboardTable = ({
  entries,
  showAverage = true,
}: {
  entries: LeaderboardEntry[];
  showAverage?: boolean;
}) => (
  <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-full text-sm text-left">
      <thead className="text-xs uppercase bg-secondary/20">
        <tr>
          <th className="px-6 py-3">Rank</th>
          <th className="px-6 py-3">Player</th>
          <th className="px-6 py-3">Score</th>
          <th className="px-6 py-3">Games</th>
          {showAverage && <th className="px-6 py-3">Avg</th>}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr
            key={entry.user_id}
            className="border-b hover:bg-secondary/10 transition-colors"
          >
            <td className="px-6 py-4 flex items-center gap-2">
              {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
              {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
              {index === 2 && <Award className="h-4 w-4 text-amber-600" />}
              {index + 1}
            </td>
            <td className="px-6 py-4 font-medium">{entry.username}</td>
            <td className="px-6 py-4">
              {Math.round(entry.score).toLocaleString()}
            </td>
            <td className="px-6 py-4">{entry.games_played}</td>
            {showAverage && (
              <td className="px-6 py-4">
                {Math.round(entry.avg_score).toLocaleString()}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatsCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
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
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center my-12 p-8 border border-white rounded-md">
            <p>No Leaderboard Data Available.</p>
            <p className="text-sm">Check back later for updated results.</p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable entries={entries} showAverage={showAverage} />
      </CardContent>
    </Card>
  );
};

export default function LeaderboardClientPage() {
  // Individual data fetching hooks
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
  const { data: weeklyGames, isLoading: isWeeklyGamesLoading } =
    useWeeklyGameCounts();
  const { data: alltimeGames, isLoading: isAlltimeGamesLoading } =
    useAlltimeGameCounts();

  const isStatsLoading =
    isWeeklyGamesLoading || isAlltimeGamesLoading || isDailyLoading;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-start mb-8">Leaderboards</h1>

      {isStatsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Weekly Games Played"
            value={weeklyGames?.total || 0}
          />
          <StatsCard
            title="All-time Games Played"
            value={alltimeGames?.total || 0}
          />
          <StatsCard
            title="Today's Active Players"
            value={dailyData?.length || 0}
          />
        </div>
      )}

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="daily">Today's Daily</TabsTrigger>
          <TabsTrigger value="weekly-daily">Weekly Daily</TabsTrigger>
          <TabsTrigger value="weekly-unlimited">Weekly Unlimited</TabsTrigger>
          <TabsTrigger value="alltime-daily">All-time Daily</TabsTrigger>
          <TabsTrigger value="alltime-unlimited">
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
