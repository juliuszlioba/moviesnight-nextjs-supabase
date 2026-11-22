import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import RecordAdd from './record-add'
import type { TMDBresultsEntity } from '@/lib/tmdb.types'
import { buttonVariants } from '../ui/button'
import { cn } from '@/lib/utils'

export default function TmdbListItem({ record }: { record: TMDBresultsEntity }) {
	if (record.media_type === 'tv' || record.media_type === 'movie') {
		return (
			<div className="border-b-2 border-dashed border-muted py-4 first:pt-0 last:border-none">
				<div className="flex items-center justify-between gap-3 md:gap-6">
					<div className="flex min-w-0 gap-3">
						{record.poster_path && (
							<Image
								src={`https://image.tmdb.org/t/p/w200${record.poster_path}`}
								alt={`${record.title || record.name}`}
								width={200}
								height={300}
								className="h-36 w-24 shrink-0 overflow-hidden rounded-md border-2 border-muted bg-muted"
								unoptimized={true}
							/>
						)}

						<div className="flex min-w-0 flex-col">
							<h2 className={`text-xl ${record.poster_path && 'pt-4'}`}>
								{record.title || record.name}
							</h2>
							<p className="text-sm text-gray-400">
								{record.release_date || record.first_air_date}
							</p>
							<div className="pt-4">
								<a
									href={`https://www.themoviedb.org/${record.media_type}/${record.id}`}
									target="_blank"
									rel="noreferrer nofollow"
									className={cn(
										buttonVariants({
											variant: 'outline',
										})
									)}
								>
									View on TMDB
									<ExternalLink strokeWidth={2} />
									<span className="sr-only"> (opens in new tab)</span>
								</a>
							</div>
						</div>
					</div>
					<RecordAdd record={record} />
				</div>
			</div>
		)
	} else {
		return null
	}
}
