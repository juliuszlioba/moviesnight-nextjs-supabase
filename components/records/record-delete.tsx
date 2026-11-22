'use client'

import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { deleteRecord } from '@/lib/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RecordDeleteButton({
	id,
}: {
	id: number
}) {
	const { push } = useRouter()

	const [loading, setLoading] = useState(false)

	const handleDelete = async () => {
		if (loading) return
		setLoading(true)

		try {
			const { status } = await deleteRecord({ id })
			if (status === 'success') {
				push('/')
				return
			}
			toast.error(
				status === 'unauthorised'
					? 'You’re logged out. Log in and try again.'
					: 'Couldn’t delete this record. Try again.'
			)
		} catch {
			toast.error('Couldn’t delete this record. Try again.')
		}
		setLoading(false)
	}

	return (
		<Button
			onClick={handleDelete}
			variant={'destructive'}
			className="gap-2"
			disabled={loading}
		>
			{loading && <Spinner />}
			{loading ? 'Deleting…' : 'Delete Record'}
		</Button>
	)
}
