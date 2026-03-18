//! TODO

import { Spinner } from '@/components/ui/spinner'
import { Suspense } from 'react'

export default async function PostPage(props: {
	params: Promise<{ mediatype: string }>
	searchParams?: Promise<{
		page?: string
	}>
}) {
	// const params = await props.params
	const { page } = (await props.searchParams) || {}
	const currentPage = Number(page) || 1

	return (
		<main>
			<Suspense key={currentPage} fallback={<Spinner />}>
				{/* <PostsListAllByMediatype
					mediatype={params.mediatype}
					currentPage={currentPage}
				/> */}
			</Suspense>
		</main>
	)
}
