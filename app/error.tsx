"use client";

import { Button } from "@/components/ui/button";
import { FileWarning } from "lucide-react";
import Link from "next/link";

// Error boundary for unexpected failures (e.g. database unavailable) so the
// user sees a friendly page instead of a crashed route.
export default function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="flex w-full items-center justify-center my-auto">
      <main className="flex flex-col space-y-4 mb-auto items-center">
        <FileWarning size={36} strokeWidth={2} />
        <h2 className="text-2xl">Sorry, something went wrong</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="default" asChild>
            <Link href="/">Go Back</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
