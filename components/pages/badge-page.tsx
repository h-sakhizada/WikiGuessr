"use client";
import { useProfile } from "@/hooks/useProfile";
import { redirect } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getAllBadges } from "@/actions/badge-actions";
import { useEffect, useState } from "react";
import { Badge } from "@/types";
import { Button } from "../ui/button";

export default function BadgeClientPage() {
  const user = useProfile();
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const fetchedBadges = await getAllBadges();
        setBadges(fetchedBadges);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const buyClicked = (badge: Badge) => {
    toast.error(`The ${badge.name} badge isn't currently available.`, {
      iconTheme: { primary: "red", secondary: "white" },
    });
  };

  if (user.isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user.data) {
    return redirect("/sign-in");
  }

  return (
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
            {badges!.map((badge) => (
              <Card key={badge.id} className="bg-white p-4 rounded shadow">
                <CardContent className="flex justify-center">
                  <img
                    src={`${badge.icon}`}
                    alt={badge.name}
                    style={{
                      cursor: "pointer",
                      width: "50%",
                      height: "auto",
                      border: "3px solid gold",
                    }}
                  />
                </CardContent>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex justify-center">
                    {badge.name} Badge
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button
                    onClick={() => buyClicked(badge)}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Buy Now!
                  </Button>
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
  );
}
