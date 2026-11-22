import { Button } from "@/components/ui/button";
import { FileWarning } from "lucide-react";
import Header from "../(unauth)/header";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <>
      <Header />
      <div className="flex w-full items-center justify-center my-auto">
        <main id="main-content" className="flex flex-col space-y-4 mb-auto items-center">
          <FileWarning size={36} strokeWidth={2} />
          <h1 className="text-2xl">Sorry, something went wrong</h1>
          <Button variant="default" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </main>
      </div>
    </>
  );
}
