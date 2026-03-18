import Header from '@/app/header';
import RecordItem from '@/components/records/record-item';
import { Spinner } from '@/components/ui/spinner';
import { Suspense } from 'react'

export default async function PostPage(
    props: {
        params: Promise<{ year: string; slug: string }>
    }
) {
    const params = await props.params;

    return (
		<main>
			<Header />
			<Suspense key={`year-string`} fallback={<Spinner />}>
				<RecordItem year={params.year} slug={params.slug} />
			</Suspense>
		</main>
	)
}
