import React from "react";
import { signOutAction } from "@/actions/auth-actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
        <Badge
          variant={"default"}
          className="font-normal pointer-events-none text-xs sm:text-sm text-center sm:text-left"
        >
          Update .env.local with anon key and URL
        </Badge>
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant={"outline"}
            disabled
            className="opacity-75 cursor-none pointer-events-none text-xs sm:text-sm"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={"default"}
            disabled
            className="opacity-75 cursor-none pointer-events-none text-xs sm:text-sm"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
      <form action={signOutAction}>
        <Button
          type="submit"
          variant={"outline"}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant={"outline"}
        className="text-xs sm:text-sm"
      >
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant={"default"}
        className="text-xs sm:text-sm"
      >
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
