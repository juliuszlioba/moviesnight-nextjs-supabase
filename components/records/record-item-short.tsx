import Image from "next/image";
import { RecordEditForm } from "./record-edit";
import { notFound } from "next/navigation";
import { readRecord } from "@/lib/record";
import { toInt } from "radash";

// import type { User } from '@supabase/supabase-js'

export default async function RecordItemShort({
  year,
  slug,
  // auth = null,
}: {
  year: string;
  slug: string;
  // auth?: User | null
}) {
  const { record } = await readRecord({
    slug: slug,
    year: toInt(year),
  });

  if (!record) {
    notFound();
  }

  return (
    <div>
      <div className="flex pb-4">
				<div>
					{record?.poster && (
						<Image
							src={`https://image.tmdb.org/t/p/w200${record.poster}`}
							alt={record?.title || 'poster'}
							width={200}
							height={300}
							className="h-18.75 w-12.5 shrink-0 overflow-hidden rounded-md border-2 border-gray-900 bg-gray-800"
							unoptimized={true}
						/>
					)}
				</div>
				<div className="px-2 py-2">
					<h2 className="flex items-start justify-between gap-2 text-2xl md:justify-start font-light">
						{record?.title}
					</h2>
					<p className="text-sm text-gray-400">{record?.year && record.year}</p>
				</div>
			</div>

      <RecordEditForm record={record}/>
    </div>
  );
}
