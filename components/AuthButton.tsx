import { LogOut, UserCircleIcon } from "lucide-react";

import { Button } from "./ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const signOut = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
  };

  return user ? (
    <div className="flex items-center gap-4">
      <form action={signOut}>
        <Button variant="ghost" aria-label="Log out">
          <LogOut strokeWidth={2} />
        </Button>
      </form>
    </div>
  ) : (
    <Button asChild variant="ghost">
      <Link
        href="/login"
        aria-label="Log in"
        className="py-2 px-3 flex rounded-md no-underline"
      >
        <UserCircleIcon strokeWidth={2} />
      </Link>
    </Button>
  );
}
