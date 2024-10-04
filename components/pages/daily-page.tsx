"use client";
import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "../loading-spinner";
import useRandomWikipediaArticle from "@/hooks/useRandomWikipediaArticle";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InfoboxProps {
  info: Record<string, any>;
}

const WikipediaInfobox = ({ info }: InfoboxProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50 max-w-md mx-auto">
      <table className="w-full text-sm text-black">
        <tbody>
          {Object.entries(info).map(([key, value]) => (
            <tr key={key} className="border-b last:border-b-0">
              <th className="p-2 text-left font-semibold bg-gray-100 w-1/3 align-top">
                {key.replace(/_/g, " ").charAt(0).toUpperCase() +
                  key.replace(/_/g, " ").slice(1)}
              </th>
              <td className="p-2">
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside">
                    {value.map((item, index) => (
                      <li key={index}>{item.toString()}</li>
                    ))}
                  </ul>
                ) : (
                  <span>
                    {/* @ts-ignore */}
                    {value.toString()}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatHint3 = (hint3: string) => {
  try {
    const info = JSON.parse(hint3);
    return <WikipediaInfobox info={info} />;
  } catch (error) {
    console.error("Error parsing hint3:", error);
    return <p>{hint3}</p>;
  }
};

export default function DailyClientPage() {
  const user = useProfile();
  const {
    data: article,
    isLoading,
    error,
    refetch,
  } = useRandomWikipediaArticle();
  const [currentHint, setCurrentHint] = useState(0);

  if (user.isLoading || isLoading) {
    return <LoadingSpinner />;
  }
  if (!user.data) {
    return redirect("/sign-in");
  }
  if (error) {
    return <div>Error fetching random Wikipedia article</div>;
  }

  const showNextHint = () => {
    setCurrentHint((prev) => Math.min(prev + 1, 5));
  };

  const resetHints = () => {
    setCurrentHint(0);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Daily Wikipedia Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentHint >= 1 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Hint 1: Related Topics</h3>
              <ul className="list-disc pl-5">
                {article?.hint1.map((link, index) => (
                  <li key={index}>{link}</li>
                ))}
              </ul>
            </div>
          )}
          {currentHint >= 2 && article?.hint2 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Hint 2: Image</h3>
              <Image
                src={article.hint2}
                alt="Article image"
                width={300}
                height={200}
                className="rounded-lg object-cover mt-2"
              />
            </div>
          )}
          {currentHint >= 3 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">
                Hint 3: Additional Information
              </h3>
              <div className="mt-2">
                {article?.hint3 && formatHint3(article.hint3)}
              </div>
            </div>
          )}
          {currentHint >= 4 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Hint 4: Title Initials</h3>
              <p className="mt-2">{article?.hint4}</p>
            </div>
          )}
          {currentHint >= 5 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Hint 5: Summary</h3>
              <p className="mt-2">{article?.hint5}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentHint < 5 ? (
            <Button
              onClick={showNextHint}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Show Next Hint
            </Button>
          ) : (
            <Button
              onClick={() => window.open(article?.url, "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Reveal Answer
            </Button>
          )}
          <Button
            onClick={resetHints}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            New Article
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
