import Image from "next/image";
import Link from "next/link";

export default async function Header() {


  return (
    <header className="flex justify-center pb-4 w-full">
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
    </header>
  );
}
