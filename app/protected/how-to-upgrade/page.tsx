import Breadcrumb from "@/components/custom/Breadcrumbs";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HowToUpgrade() {
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
      <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
        <header className="text-center mb-2">
          <h1 className="text-2xl font-bold">How to Upgrade</h1>
        </header>

        <div className="space-y-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            To upgrade click the [Go Premium] button on the Profile Page,
          </label>
          <img src="/assets/wiki5.PNG" style={{ margin: "5px" }} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Then enter a valid card number,
          </label>
          <img src="/assets/wiki1.PNG" style={{ margin: "5px" }} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter the cards cvc number,
          </label>
          <img src="/assets/wiki2.PNG" style={{ margin: "5px" }} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter the expiration date,
          </label>
          <img src="/assets/wiki3.PNG" style={{ margin: "5px" }} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Then hit SUBMIT,
          </label>
          <img src="/assets/wiki4.PNG" style={{ margin: "5px" }} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enjoy your premium!
          </label>
        </div>
      </div>
    </>
  );
}
