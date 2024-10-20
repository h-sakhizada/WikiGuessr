"use client";
import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Lightbulb, Repeat, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();
  return (
    <div className=" flex flex-col">
      <Hero />
      <main className="flex-1 container mx-auto px-4">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Get a Clue",
                icon: Lightbulb,
                description:
                  "Receive a clue about the daily Wikipedia article.",
              },
              {
                title: "Make a Guess",
                icon: Target,
                description:
                  "Guess which article it could be based on the clue.",
              },
              {
                title: "Keep Guessing",
                icon: Repeat,
                description:
                  "If wrong, get up to 5 total clues. If correct, you win!",
              },
              {
                title: "Daily Challenge",
                icon: Calendar,
                description:
                  "New article every day. Come back for a fresh challenge!",
              },
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    {item.title}
                    <item.icon className="h-6 w-6 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Test Your Knowledge?
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Dive into today's Wikipedia challenge and see if you can guess the
            article!
          </p>
          <Button
            size="lg"
            className="group"
            onClick={() => router.push("/protected/daily")}
          >
            Start Today's Game
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>
        <section className="bg-secondary/10 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Did You Know?</h2>
          <p className="text-lg">
            Wikipedia has over 6 million articles in English alone. With
            WikiGuessr, you'll discover a new fascinating topic every day!
          </p>
        </section>
      </main>
    </div>
  );
}
