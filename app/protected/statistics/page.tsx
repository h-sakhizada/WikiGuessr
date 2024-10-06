import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function StatisticsPage() {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/sign-in");
	}

	return (
		<div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
			<header className="text-center mb-2">
				<h1 className="text-2xl font-bold">Statistics Page</h1>
			</header>
		</div>
	);
}
