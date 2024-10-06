"use client";
import { useProfile } from "@/hooks/useProfile";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "../loading-spinner";

export default function BadgeClientPage() {
  const user = useProfile();

  if (user.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user.data) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="grow">
        <header className="text-left mb-2">
          <h1 className="text-2xl font-bold">Badge Page</h1>
        </header>
      </div>
    </div>
  );
}
