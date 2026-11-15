"use client";

import type { AnimeSortRecord } from "@/lib/records";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { moveSingleRecordSortOrder } from "@/lib/actions";
import { toast } from "sonner";
import { useState } from "react";

export default function AnimeSortList({
  records,
}: {
  records: AnimeSortRecord[];
}) {
  const [items, setItems] = useState(records);
  const [prevRecords, setPrevRecords] = useState(records);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Insertion slot: 0 = before the first row, items.length = after the last
  const [dropSlot, setDropSlot] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Resync when the server sends a fresh list (after revalidation)
  if (records !== prevRecords) {
    setPrevRecords(records);
    setItems(records);
  }

  function resetDrag() {
    setDragIndex(null);
    setDropSlot(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLLIElement>, index: number) {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const slot = e.clientY < rect.top + rect.height / 2 ? index : index + 1;
    if (slot !== dropSlot) setDropSlot(slot);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const from = dragIndex;
    const slot = dropSlot;
    resetDrag();
    if (from === null || slot === null) return;

    const to = slot > from ? slot - 1 : slot;
    if (to === from) return;

    const previous = items;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setSavingId(moved.id);

    try {
      const { status } = await moveSingleRecordSortOrder({
        mediaType: "anime",
        recordId: moved.id,
        newPosition: to + 1,
      });
      if (status !== "success") throw new Error(status);
      toast.success(`Moved "${moved.title}" to #${to + 1}`);
    } catch {
      setItems(previous);
      toast.error("Error updating record position");
    } finally {
      setSavingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">No records in the anime list.</p>
    );
  }

  const saving = savingId !== null;

  return (
    <ol
      className={cn(
        "divide-y-2 divide-dashed select-none",
        saving && "cursor-progress",
      )}
      // Drop is handled on the list (rows bubble up) so gaps between rows count
      onDragOver={(e) => {
        if (dragIndex !== null) e.preventDefault();
      }}
      onDrop={handleDrop}
      onDragLeave={(e) => {
        // Leaving the list entirely: hide the indicator
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setDropSlot(null);
        }
      }}
    >
      {items.map((record, index) => {
        const isDragging = dragIndex === index;
        const showBefore = dropSlot === index && dragIndex !== null;
        const showAfter =
          dropSlot === items.length &&
          index === items.length - 1 &&
          dragIndex !== null;

        return (
          <li
            key={record.id}
            draggable={!saving}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(record.id));
              setDragIndex(index);
            }}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={resetDrag}
            className={cn(
              "group relative flex items-center gap-4 px-2 py-3",
              "transition-colors hover:bg-muted/50",
              saving ? "cursor-progress" : "cursor-grab active:cursor-grabbing",
              isDragging && "opacity-40",
            )}
          >
            {showBefore && <DropLine position="top" />}
            {showAfter && <DropLine position="bottom" />}

            <GripVertical
              strokeWidth={1.5}
              className="h-5 w-5 shrink-0 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100"
            />
            <div className="relative shrink-0">
              {record.poster ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w154${record.poster}`}
                  alt=""
                  width={154}
                  height={231}
                  draggable={false}
                  className="h-24 w-16 rounded-lg bg-muted object-cover"
                  unoptimized={true}
                />
              ) : (
                <div className="h-24 w-16 rounded-lg bg-muted" />
              )}
              {/* Same tilted badge as the /anime list */}
              <span className="absolute top-2 -left-2 -rotate-6 rounded-md bg-primary px-1.5 py-0.5 text-xs tabular-nums text-white shadow-lg shadow-primary/50">
                #{index + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-light">{record.title}</p>
              <p className="text-sm text-gray-400">{record.year}</p>
            </div>
            {savingId === record.id && <Spinner className="shrink-0" />}
          </li>
        );
      })}
    </ol>
  );
}

function DropLine({ position }: { position: "top" | "bottom" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-primary",
        position === "top" ? "-top-0.5" : "-bottom-0.5",
      )}
    />
  );
}
