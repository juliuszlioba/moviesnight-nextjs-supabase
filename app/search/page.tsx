import RecordsSearch from '@/components/records/records-list-search'
import Search from '@/components/Search'
import { Suspense } from 'react'

export default async function SeatchPage(props: {
	searchParams?: Promise<{
		page?: string
		search?: string
	}>
}) {
	const searchParams = await props.searchParams
	const { page } = searchParams || {}
	const currentPage = Number(page) || 1

	return (
		<div className="space-y-4">
			<Search placeholder="Search website" />
			{searchParams?.search && (
        <Suspense fallback={<div>Loading...</div>}>
            <RecordsSearch
              searchQuery={searchParams?.search}
              currentPage={currentPage}
            />
				</Suspense>
			)}
		</div>
	)
}