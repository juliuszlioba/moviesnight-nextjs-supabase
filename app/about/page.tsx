import Header from '../header'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export default async function AboutPage() {
	const supabase = await createClient()
	const { count } = await supabase
		.from('records')
		.select('*', { count: 'exact' })

	return (
		<main>
      <Header />
			<div className="flex flex-col gap-6">
				<div>
					<h1 className="pb-2 text-3xl">What is this website?</h1>

          <p>This website serves as a simple, personal list of movies and series I&apos;ve recently watched. There are currently {' '}
						<span className="text-lg font-semibold text-primary">{count}</span>{' '} titles on the list since I started tracking my viewing on March 13, 2016. Some records were added retroactively with approximate viewing dates. I <span className="text-lg font-semibold text-primary">do not</span> add unfinished movies or dropped series, with the exception of a few exceptionally good shows that I am currently watching and definitely intend to finish.</p>

				</div>
				<div>
					<p>
						This product uses the{' '}
						<a
							href="https://www.themoviedb.org/documentation/api"
							target="_blank"
							rel="noreferrer"
							className="hover:text-fuchsia-700"
						>
							TMDb API
						</a>{' '}
						but is not endorsed or certified by{' '}
						<a
							href="https://www.themoviedb.org/"
							target="_blank"
							rel="noreferrer"
							className="hover:text-fuchsia-700"
						>
							TMDb
						</a>
					</p>
					<a
						href="https://www.themoviedb.org/"
						target="_blank"
						rel="noreferrer"
						className="relative inline-block pt-4"
					>
						<Image
							src="/img/svg/themoviedb_logo-full.svg"
							alt="TMDb Logo"
							width={185.04}
							height={133.4}
							className="w-24"
						/>
					</a>
				</div>
			</div>
		</main>
	)
}
