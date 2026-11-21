'use client'

import { Button, buttonVariants } from '../ui/button'
import { Status, addRecord } from '@/lib/actions'

import { PlusCircleIcon } from 'lucide-react'
import { Spinner } from '../ui/spinner'
import { TMDBresultsEntity } from '@/lib/tmdb.types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RecordAdd({ record }: { record: TMDBresultsEntity }) {
	const { push } = useRouter()

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Status | undefined>(undefined)

	const handleAdd = async () => {
		setLoading(true)

		const { status, redirectTo, warning } = await addRecord({ record })
		if (status === 'success') {
			if (warning) toast.warning(warning)
			push(redirectTo || '/')
		} else {
			setError({ status })
		}

		setLoading(false)
	}

	if (error && error.status === 'error') {
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

	if (error && error.status === 'unauthorised') {
		return (
			<div
				className={cn(
					buttonVariants({
						variant: 'destructive',
					})
				)}
			>
				Unauthorised!
			</div>
		)
	}

	if (error && error.status === 'duplicate') {
		return (
			<div
				className={cn(
					buttonVariants({
						variant: 'destructive',
					})
				)}
			>
				Already in list!
			</div>
		)
	}

	if (loading) {
		return (
			<div>
				<Spinner />
			</div>
		)
	}

	return (
		<div>
			<Button variant={'default'} className="gap-2" onClick={() => handleAdd()}>
				<PlusCircleIcon strokeWidth={1.5} />
				Add
			</Button>
		</div>
	)
}
