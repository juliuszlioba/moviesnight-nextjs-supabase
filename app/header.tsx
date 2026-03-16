import { Clapperboard, Heart, Menu, Search, Tv } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Header() {
  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-1">
        <div className="w-6.5">
          <Image
            src="/img/svg/movieNight_logo.svg"
            alt="moviesNight Logo"
            width={26}
            height={26}
            unoptimized={true}
            priority
          />
        </div>
        <Link
          href="/"
          className="rounded-md p-1.5 text-lg font-extralight hover:text-primary focus:ring-2 focus:ring-primary focus-visible:outline-none lg:text-xl"
        >
          movies<span className="font-normal">Night</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="px-3">
              <Menu strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={12}>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/anime" className="flex items-center">
                <Heart strokeWidth={1.5} className="mr-2 h-5 w-5" />
                Anime
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/top/movies" className="flex items-center">
                <Clapperboard strokeWidth={1.5} className="mr-2 h-5 w-5" />
                Movies Top
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/top/series" className="flex items-center">
                <Tv strokeWidth={1.5} className="mr-2 h-5 w-5" />
                Series Top
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-base" asChild>
              <Link href="/search" className="flex items-center">
                <Search strokeWidth={1.5} className="mr-2 h-5 w-5" />
                Search
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AuthButton />
      </div>
    </div>
  );
}
