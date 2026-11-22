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

  // Screen-reader announcement for the last move
  const [announcement, setAnnouncement] = useState("");

  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pointerYRef = useRef(0);
  // Row midpoints in page coordinates, measured once when a drag starts.
  // Rows don't move during a drag, so this avoids a layout read per frame.
  const midsRef = useRef<number[]>([]);
  // Record whose # button should keep focus after a keyboard move
  const focusIdRef = useRef<number | null>(null);

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
        setDropSlot(slotFromY(midsRef.current, y));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dragIndex]);

  // Reordering can move the focused button in the DOM and drop its focus
  useEffect(() => {
    const id = focusIdRef.current;
    if (id === null) return;
    focusIdRef.current = null;
    document
      .querySelector<HTMLButtonElement>(`[data-move-id="${id}"]`)
      ?.focus();
  }, [items]);

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
      toast.success(`Moved “${moved.title}” to #${to + 1}`);
      setAnnouncement(
        `Moved ${moved.title} to position ${to + 1} of ${next.length}`,
      );
    } catch {
      setItems(previous);
      toast.error("Couldn’t move the record. Try again.");
      setAnnouncement(`Couldn’t move ${moved.title}. It is back at #${from + 1}.`);
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
    midsRef.current = measureMidpoints(rowRefs.current.slice(0, items.length));
    setDragIndex(index);
    setDropSlot(slotFromY(midsRef.current, e.clientY));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLLIElement>) {
    if (dragIndex === null) return;
    pointerYRef.current = e.clientY;
    const slot = slotFromY(midsRef.current, e.clientY);
    if (slot !== dropSlot) setDropSlot(slot);
  }

  // Alt+↑/↓ on a row's # button nudges it one place
  function handleMoveKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    id: number,
  ) {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    if (saving) return;
    const to = e.key === "ArrowUp" ? index - 1 : index + 1;
    if (to < 0 || to >= items.length) return;
    focusIdRef.current = id;
    void moveRecord(index, to);
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
    <>
    <p aria-live="polite" className="sr-only">
      {announcement}
    </p>
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
              // Skip rendering off-screen rows; every row is 122px tall
              "[content-visibility:auto] [contain-intrinsic-size:auto_122px]",
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
                strokeWidth={2}
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
                  data-move-id={record.id}
                  // aria-disabled, not disabled, so keyboard focus survives a save
                  aria-disabled={saving}
                  title="Move to position… (Alt+↑/↓ to nudge)"
                  aria-label={`Move ${record.title}, currently #${index + 1}`}
                  aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                  onClick={() => {
                    if (!saving) setEditingId(record.id);
                  }}
                  onKeyDown={(e) => handleMoveKeyDown(e, index, record.id)}
                  className="absolute top-2 -left-2 -rotate-6 cursor-pointer rounded-md bg-primary px-1.5 py-0.5 text-xs tabular-nums text-white shadow-lg shadow-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-disabled:cursor-progress"
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
    </>
  );
}

// Vertical midpoint of each row, in page (not viewport) coordinates
function measureMidpoints(rows: (HTMLLIElement | null)[]) {
  return rows.map((row) => {
    const rect = row?.getBoundingClientRect();
    return rect ? rect.top + window.scrollY + rect.height / 2 : Infinity;
  });
}

// Insertion slot under clientY: before the first row whose midpoint is below it
function slotFromY(mids: number[], clientY: number) {
  const y = clientY + window.scrollY;
  for (let i = 0; i < mids.length; i++) {
    if (y < mids[i]) return i;
  }
  return mids.length;
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
        // Inside the row: off-screen-row containment would clip anything outside
        position === "top" ? "top-0" : "bottom-0",
      )}
    />
  );
}
