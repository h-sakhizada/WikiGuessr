"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserAnalyticsOverview from "../analytics/components/overview";
import { useAdminAllProfiles } from "@/hooks/useAllProfiles";
import { useAllGameResults } from "@/hooks/useAllGames";
import { useAllBadges } from "@/hooks/useAllBadges";
import { useAllExtraGames } from "@/hooks/useAllExtraGames";
import { Progress } from "@/components/ui/progress";

/**
 * number of of wins / losses
 * attempts statistics
 *
 * number of badges
 */

const AdminAnalyticsManagement = () => {
  const { data: profiles } = useAdminAllProfiles();
  const { data: games } = useAllGameResults();
  const { data: badges } = useAllBadges();
  const { data: extraGames } = useAllExtraGames();

  const totalUsers = profiles != null ? profiles.length : 0;
  const premiumUsers =
    profiles != null
      ? profiles.filter((profile) => profile.is_premium).length
      : 0;
  const nonPremiumUsers = totalUsers - premiumUsers;
  const premiumPercentage =
    totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;
  

  const dailyGames = (games?.length || 0);
  const unlimitedGames = (extraGames?.length || 0); 
  const totalGames = dailyGames + unlimitedGames;

  const totalBadges = badges != null ? badges?.length : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="text-2xl font-bold">Users</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2l font-bold">
                    Total Users: {totalUsers}
                  </div>
                  <div className="text-2l font-bold">
                    Number of Premium Users: {premiumUsers}
                  </div>
                  <div className="text-2l font-bold">
                    Number of Non-premium Users: {nonPremiumUsers}
                  </div>
                  <br />
                  <div>
                    <div className="text-2l">Percentage of Premium Users</div>
                    <Progress value={Number(premiumPercentage)} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                  <div className="text-2xl font-bold">Games Played</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2l font-bold">Total Daily Games Played: {dailyGames}</div>
                  <div className="text-2l font-bold">Total Unlimited Games Played: {unlimitedGames}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Number of Badges Collected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBadges}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        <UserAnalyticsOverview users={profiles || []} />
      </div>
    </div>
  );
};

export default AdminAnalyticsManagement;
