"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Settings, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

type AdminLink = {
  title: string;
  description: string;
  href: string;
  icon: JSX.Element;
  active: boolean;
};

interface AdminDashboardProps {
  links: AdminLink[];
}

export function AdminDashboard({ links }: AdminDashboardProps) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome to the administration panel
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => {
          return (
            <Link
              href={link.href}
              key={link.href}
              className={`transition-transform hover:scale-105 relative ${
                !link.active && "cursor-not-allowed"
              }`}
              onClick={(e) => !link.active && e.preventDefault()}
            >
              <Card
                className={`h-full relative hover:shadow-md border-2 ${
                  link.active ? "border-blue-200" : "border-gray-100"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        link.active ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {link.icon}
                    </div>
                    <div>
                      <CardTitle
                        className={`text-xl ${!link.active && "text-gray-400"}`}
                      >
                        {link.title}
                      </CardTitle>
                      <CardDescription
                        className={`mt-1 ${!link.active && "text-gray-300"}`}
                      >
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {!link.active && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-lg" />
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
