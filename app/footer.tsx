import Image from 'next/image'
import Link from 'next/link'

export default function SiteFooter() {
	return (
		<footer className="space-y-6 pt-12 pb-6 mt-auto">
			<div>
				<Image
					src="/img/svg/movieNight_logo.svg"
					alt="moviesNight Logo"
					width={175}
					height={175}
					className="mx-auto"
					unoptimized={true}
				/>
			</div>

			<div className="flex items-center justify-center gap-4 flex-wrap">
				<div className='w-auto'>
					<a
						href="https://juliuszlioba.com"
						rel="noopener"
						className="ml-2 rounded-full px-2 py-1 hover:text-primary focus:ring-2 focus:ring-primary focus-visible:outline-none"
					>
						{`${new Date().getFullYear()}`} &copy; juliuszlioba.com
					</a>
				</div>
				<div className='flex gap-4'>
				<Link
					href="/about"
					className="rounded-full px-2 py-1 hover:text-primary focus:ring-2 focus:ring-primary focus-visible:outline-none"
				>
					About
				</Link>
				<Link
					href="/privacy"
					className="rounded-full px-2 py-1 hover:text-primary focus:ring-2 focus:ring-primary focus-visible:outline-none"
				>
					Privacy
				</Link>
				</div>
			</div>
		</footer>
	)
}
