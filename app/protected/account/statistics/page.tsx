"use client";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import LoadingSpinner from "@/components/loading-spinner";
import { useUser } from "@/hooks/useUser";
import { redirect } from "next/navigation";

export default function StatisticsPage() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return redirect("/sign-in");

  return (
    <>
      <Breadcrumb />
      <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
        STATISTICS TODO
      </div>
    </>
  );
}
