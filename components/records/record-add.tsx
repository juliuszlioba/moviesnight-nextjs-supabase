'use client'

import { Check, PlusCircleIcon } from 'lucide-react'

import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { TMDBresultsEntity } from '@/lib/tmdb.types'
import { addRecord } from '@/lib/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RecordAdd({ record }: { record: TMDBresultsEntity }) {
	const { push } = useRouter()

	const [loading, setLoading] = useState(false)
	const [duplicate, setDuplicate] = useState(false)

	const handleAdd = async () => {
		if (loading) return
		setLoading(true)

		try {
			const { status, redirectTo, warning } = await addRecord({ record })
			if (status === 'success') {
				if (warning) toast.warning(warning)
				push(redirectTo || '/')
				return
			}
			if (status === 'duplicate') {
				setDuplicate(true)
				toast.error('This title is already in your list.')
			} else if (status === 'unauthorised') {
				toast.error('You’re logged out. Log in and try again.')
			} else {
				toast.error('Couldn’t add this title. Try again.')
			}
		} catch {
			toast.error('Couldn’t add this title. Try again.')
		}
		setLoading(false)
	}

	if (duplicate) {
		return (
			<Button variant={'secondary'} className="gap-2" disabled>
				<Check strokeWidth={2} />
				Already in List
			</Button>
		)
	}

	return (
		<Button
			variant={'default'}
			className="gap-2"
			disabled={loading}
			onClick={() => handleAdd()}
		>
			{loading ? <Spinner /> : <PlusCircleIcon strokeWidth={2} />}
			{loading ? 'Adding…' : 'Add to List'}
		</Button>
	)
}
