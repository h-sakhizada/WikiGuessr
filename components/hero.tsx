import React from "react";
import { BookOpen, HelpCircle } from "lucide-react";

export default function Header() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-4">
      <div className="flex gap-4 justify-center items-center text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8">
        <BookOpen className="text-primary" />
        <HelpCircle className="text-primary" />
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 animate-fade-in">
        Welcome to WikiGuessr!
      </h1>
      <p className="text-lg sm:text-xl lg:text-2xl text-center max-w-lg mx-auto text-black dark:text-primary ">
        Test your knowledge and explore the world of Wikipedia!
      </p>
      <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-8" />
    </div>
  );
}
