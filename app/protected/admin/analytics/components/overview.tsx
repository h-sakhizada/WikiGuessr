import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileWithUser } from "@/hooks/useAllProfiles";

interface MonthlyStats {
  name: string;
  total: number;
  premium: number;
}

const UserAnalyticsOverview = ({ users }: { users: ProfileWithUser[] }) => {
  // Process users data into monthly statistics
  const getMonthlyData = (): MonthlyStats[] => {
    const monthData = new Map<string, { total: number; premium: number }>();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const parsePostgresTimestamp = (timestamp: string | null): Date | null => {
      if (!timestamp) {
        return null;
      }

      const date = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", timestamp);
        return null;
      }

      return date;
    };

    // Initialize all months with zero
    months.forEach((month) => {
      monthData.set(month, { total: 0, premium: 0 });
    });

    // Count users per month
    users.forEach((user) => {
      const parsedDate = parsePostgresTimestamp(user.created_at);

      if (parsedDate) {
        const month = months[parsedDate.getMonth()];
        const current = monthData.get(month)!;

        current.total += 1;
        if (user.is_premium) {
          current.premium += 1;
        }
      } else {
        console.warn("Skipping user with invalid or null created_at:", user.id);
      }
    });

    // Convert to array format for Recharts
    return months.map((month) => ({
      name: month,
      total: monthData.get(month)!.total,
      premium: monthData.get(month)!.premium,
    }));
  };

  const data = getMonthlyData();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Signups by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Bar
              dataKey="total"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              name="Total Users"
            />
            <Bar
              dataKey="premium"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
              name="Premium Users"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UserAnalyticsOverview;
