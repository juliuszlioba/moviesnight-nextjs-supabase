import { LogOut, UserCircleIcon } from "lucide-react";

import { Button } from "./ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
  };

  return user ? (
    <div className="flex items-center gap-4">
      <form action={signOut}>
        <Button variant="ghost">
          <LogOut strokeWidth={2} />
        </Button>
      </form>
    </div>
  ) : (
    <Button asChild variant="ghost">
      <Link
        href="/login"
        className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        <UserCircleIcon strokeWidth={2} />
      </Link>
    </Button>
  );
}
