import { Clapperboard, Heart, Menu, Search, Tv } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AddButton from "@/components/AddButton";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Header() {
  return (
    <header className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-1">
        <div className="w-6.5">
          <Image
            src="/img/svg/movieNight_logo.svg"
            alt=""
            width={26}
            height={26}
            unoptimized={true}
            preload
          />
        </div>
        <Link
          href="/"
          className="rounded-md p-1.5 text-lg font-extralight hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none lg:text-xl"
        >
          movies<span className="font-normal">Night</span>
        </Link>
      </div>
      <nav aria-label="Main" className="flex items-center gap-2">
        <AddButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="px-3" aria-label="Open menu">
              <Menu strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={12}>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/anime/tier" className="flex items-center">
                <Heart strokeWidth={2} className="h-5 w-5" />
                Anime Tier List
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/anime" className="flex items-center">
                <Heart strokeWidth={2} className="h-5 w-5" />
                Anime Tops
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/top/movies" className="flex items-center">
                <Clapperboard strokeWidth={2} className="h-5 w-5" />
                Movies Tops
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/top/series" className="flex items-center">
                <Tv strokeWidth={2} className="h-5 w-5" />
                Series Tops
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/search" className="flex items-center">
                <Search strokeWidth={2} className="h-5 w-5" />
                Search
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AuthButton />
      </nav>
    </header>
  );
}
