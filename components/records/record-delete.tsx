'use client'

import { Button, buttonVariants } from '../ui/button'
import { Status, deleteRecord } from '@/lib/actions'

import { Spinner } from '../ui/spinner'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RecordDeleteButton({
	id,
}: {
	id: number
}) {
	const { push } = useRouter()

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Status | undefined>(undefined)

	const handleDelete = async () => {
		setLoading(true)

		const { status } = await deleteRecord({ id })
		if (status === 'success') {
			push('/')
		} else {
			setError({ status })
		}

		setLoading(false)
	}

	if (error) {
		return (
			<div
				className={cn(
					buttonVariants({
						variant: 'destructive',
					})
				)}
			>
				Error!
			</div>
		)
	}

	return (
		<div>
			{loading ? (
				<Spinner />
			) : (
				<Button onClick={handleDelete} variant={'destructive'}>
					I am sure
				</Button>
			)}
		</div>
	)
}
