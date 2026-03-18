import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <Link
      href="/add"
      className={cn(
        buttonVariants({
          variant: "ghost",
        }),
        "px-3",
      )}
    >
      <PlusCircle strokeWidth={1.5} />
    </Link>
  ) : null;
}
