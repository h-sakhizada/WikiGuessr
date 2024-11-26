import Breadcrumb from "@/components/custom/Breadcrumbs";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LeaderboardClientPage from "./components/leaderboard-page";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <Breadcrumb />
      <LeaderboardClientPage />
    </>
  );
}
