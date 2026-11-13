import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function AddButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

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
