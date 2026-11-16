"use client";

import type { AnimeSortRecord } from "@/lib/records";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { moveSingleRecordSortOrder } from "@/lib/actions";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

// Distance from the viewport edge (px) where dragging starts auto-scrolling
const SCROLL_EDGE = 80;

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
  const [editingId, setEditingId] = useState<number | null>(null);

  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pointerYRef = useRef(0);

  const saving = savingId !== null;
  const dragging = dragIndex !== null;

  // Resync when the server sends a fresh list (after revalidation)
  if (records !== prevRecords) {
    setPrevRecords(records);
    setItems(records);
  }

  // Auto-scroll while dragging near the top/bottom of the viewport, so rows
  // can be moved beyond the visible area (essential on phones)
  useEffect(() => {
    if (dragIndex === null) return;
    let frame: number;
    const tick = () => {
      const y = pointerYRef.current;
      let dy = 0;
      if (y < SCROLL_EDGE) {
        dy = -Math.ceil((SCROLL_EDGE - y) / 4);
      } else if (y > window.innerHeight - SCROLL_EDGE) {
        dy = Math.ceil((y - (window.innerHeight - SCROLL_EDGE)) / 4);
      }
      if (dy !== 0) {
        window.scrollBy(0, dy);
        setDropSlot(slotFromY(rowRefs.current, y));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dragIndex]);

  function resetDrag() {
    setDragIndex(null);
    setDropSlot(null);
  }

  async function moveRecord(from: number, to: number) {
    if (to === from || to < 0 || to >= items.length) return;

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

  function handlePointerDown(e: React.PointerEvent<HTMLLIElement>, index: number) {
    if (saving || !e.isPrimary || e.button !== 0) return;
    const target = e.target as Element;
    if (target.closest("[data-no-drag]")) return;
    // Touch/pen can only drag from the handle so the rest of the row scrolls;
    // a mouse can grab the row anywhere
    if (e.pointerType !== "mouse" && !target.closest("[data-drag-handle]")) {
      return;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerYRef.current = e.clientY;
    setDragIndex(index);
    setDropSlot(slotFromY(rowRefs.current, e.clientY));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLLIElement>) {
    if (dragIndex === null) return;
    pointerYRef.current = e.clientY;
    const slot = slotFromY(rowRefs.current, e.clientY);
    if (slot !== dropSlot) setDropSlot(slot);
  }

  function handlePointerUp() {
    const from = dragIndex;
    const slot = dropSlot;
    resetDrag();
    if (from === null || slot === null) return;
    void moveRecord(from, slot > from ? slot - 1 : slot);
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">No records in the anime list.</p>
    );
  }

  return (
    <ol
      className={cn(
        "divide-y-2 divide-dashed select-none",
        saving && "cursor-progress",
        dragging && "cursor-grabbing",
      )}
    >
      {items.map((record, index) => {
        const isDragging = dragIndex === index;
        const showBefore = dragging && dropSlot === index;
        const showAfter =
          dragging && dropSlot === items.length && index === items.length - 1;

        return (
          <li
            key={record.id}
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            onPointerDown={(e) => handlePointerDown(e, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={resetDrag}
            className={cn(
              "group relative flex items-center gap-4 px-2 py-3",
              "transition-colors hover:bg-muted/50",
              saving
                ? "cursor-progress"
                : dragging
                  ? "cursor-grabbing"
                  : "cursor-grab",
              isDragging && "bg-muted/50 opacity-40",
            )}
          >
            {showBefore && <DropLine position="top" />}
            {showAfter && <DropLine position="bottom" />}

            <span
              data-drag-handle
              aria-hidden
              className="-m-2 shrink-0 touch-none p-2"
            >
              <GripVertical
                strokeWidth={1.5}
                className="h-5 w-5 text-muted-foreground transition-opacity sm:opacity-40 sm:group-hover:opacity-100"
              />
            </span>
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
              {editingId === record.id ? (
                <PositionInput
                  current={index + 1}
                  max={items.length}
                  onSubmit={(position) => {
                    setEditingId(null);
                    void moveRecord(index, position - 1);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                // Same tilted badge as the /anime list; tap to type a position
                <button
                  type="button"
                  data-no-drag
                  disabled={saving}
                  title="Move to position…"
                  onClick={() => setEditingId(record.id)}
                  className="absolute top-2 -left-2 -rotate-6 cursor-pointer rounded-md bg-primary px-1.5 py-0.5 text-xs tabular-nums text-white shadow-lg shadow-primary/50 disabled:cursor-progress"
                >
                  #{index + 1}
                </button>
              )}
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

// Insertion slot under clientY: before the first row whose midpoint is below it
function slotFromY(rows: (HTMLLIElement | null)[], y: number) {
  for (let i = 0; i < rows.length; i++) {
    const rect = rows[i]?.getBoundingClientRect();
    if (rect && y < rect.top + rect.height / 2) return i;
  }
  return rows.length;
}

function PositionInput({
  current,
  max,
  onSubmit,
  onCancel,
}: {
  current: number;
  max: number;
  onSubmit: (position: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(String(current));
  // Enter/Escape unmount the input, which can fire blur too; act only once
  const doneRef = useRef(false);

  function cancel() {
    if (doneRef.current) return;
    doneRef.current = true;
    onCancel();
  }

  function submit() {
    if (doneRef.current) return;
    const position = Number(value);
    if (!Number.isInteger(position) || position < 1 || position > max) {
      if (value.trim() !== "") toast.error(`Enter a position from 1 to ${max}`);
      cancel();
      return;
    }
    if (position === current) return cancel();
    doneRef.current = true;
    onSubmit(position);
  }

  return (
    <form
      data-no-drag
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="absolute top-1 -left-2 z-10"
    >
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        autoFocus
        aria-label="Move to position"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
        }}
        // text-base on mobile prevents iOS zooming into the field
        className="w-16 rounded-md border border-primary bg-background px-1.5 py-0.5 text-base tabular-nums shadow-lg outline-none [appearance:textfield] sm:text-xs [&::-webkit-inner-spin-button]:appearance-none"
      />
    </form>
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
