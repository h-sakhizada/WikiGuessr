"use client";
import { useUser } from "@/hooks/useUser";
import { redirect } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllBadges,
  getBadgesForUser,
  addBadgeToUserCollection,
} from "@/actions/badge-actions";
import { useEffect, useState } from "react";
import { Badge } from "@/types";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import { cn } from "@/lib/utils";

export default function BadgeClientPage() {
  const user = useUser();
  const [allBadges, setAllBadges] = useState<Badge[] | null>(null);
  const [userBadges, setUserBadges] = useState<Badge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const fetchedAllBadges = await getAllBadges();
      setAllBadges(fetchedAllBadges);
      const fetchedUserBadges = await getBadgesForUser();
      setUserBadges(fetchedUserBadges?.badges as Badge[]);
    } catch (err) {
      setError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buyClicked = async (badge: Badge) => {
    const res = await addBadgeToUserCollection(badge.id);
    if (res) {
      toast.success(`Thank you for puchasing the ${badge.name} badge!`, {
        iconTheme: { primary: "green", secondary: "white" },
      });
      fetchBadges();
    } else {
      toast.error(`The ${badge.name} badge isn't currently available.`, {
        iconTheme: { primary: "red", secondary: "white" },
      });
    }
  };

  if (user.isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user.data) {
    return redirect("/sign-in");
  }

  return (
    <>
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8">
        <Toaster />
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex justify-center">
              Badge Shop
            </CardTitle>
          </CardHeader>
          {!error ? (
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allBadges!.map((badge) => (
                <Card
                  key={badge.id}
                  className={
                    "p-4 rounded shadow " +
                    (badge.is_premium ? "bg-purple-300" : "bg-secondary")
                  }
                >
                  <CardContent className="flex justify-center">
                    <div
                      className={cn(
                        "w-32 h-32 relative flex border-4  rounded-lg overflow-hidden",
                        {
                          "border-primary bg-primary": !badge.is_premium,
                          "border-purple-400 bg-purple-400": badge.is_premium,
                        }
                      )}
                    >
                      <img
                        src={`${badge.icon}`}
                        alt={badge.name}
                        className="object-stretch max-w-full max-h-full"
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold flex justify-center text-primary">
                      {badge.name} Badge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center ">
                    {!userBadges?.some((b) => b.id === badge.id) ? (
                      <Button
                        onClick={() => buyClicked(badge)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Buy Now! {"($" + badge.price + ")"}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Owned
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          ) : (
            <CardContent className="flex justify-center">
              Encountered an error trying to access the badge shop. Please try
              again later.
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
