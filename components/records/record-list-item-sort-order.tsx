"use client";

import * as z from "zod";

import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Save, Trash2 } from "lucide-react";
import {
  addRecordToSortOrder,
  moveSingleRecordSortOrder,
  removeRecordFromSortOrder,
} from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SortListType } from "@/lib/schemas";
import { Spinner } from "../ui/spinner";
import { capitalize } from "radash";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  sortOrder: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Sort order is required"
          : "Sort order must be a number",
    })
    .int("Must be a whole number")
    .min(1, "Must be 1 or greater"),
});

export default function RecordListItemSortOrderForm({
  id,
  mediaType,
  currentSortOrder,
}: {
  id: number;
  mediaType: SortListType;
  currentSortOrder?: number | null;
}) {
  // Each list gets its own form id; two forms render on the same page
  const formId = `form-rhf-sort-order-${mediaType}`;

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sortOrder: currentSortOrder ?? 1,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function run(
    action: () => Promise<{ status: string }>,
    successMessage: string,
    errorMessage: string,
  ) {
    setLoading(true);
    try {
      const { status } = await action();
      if (status === "success") {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(errorMessage);
      }
    } catch {
      toast.error(errorMessage);
    }
    setLoading(false);
  }

  function onSubmit(data: z.output<typeof formSchema>) {
    return run(
      () =>
        moveSingleRecordSortOrder({
          recordId: id,
          newPosition: data.sortOrder,
          mediaType,
        }),
      `Updated ${mediaType} sort order to: ${data.sortOrder}`,
      "Error updating record position",
    );
  }

  function handleAdd() {
    return run(
      () => addRecordToSortOrder({ mediaType, recordId: id }),
      `Added to ${mediaType} list`,
      "Error adding record to sort order list",
    );
  }

  function handleRemove() {
    return run(
      () => removeRecordFromSortOrder({ mediaType, recordId: id }),
      `Removed from ${mediaType} list`,
      "Error removing record from sort order list",
    );
  }

  if (currentSortOrder === null || currentSortOrder === undefined) {
    if (loading) {
      return <Spinner />;
    }

    return (
      <div>
        <Button onClick={() => handleAdd()}>
          Add to TOP {capitalize(mediaType)} list
        </Button>
      </div>
    );
  }

  return (
    <div>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex gap-2 flex-row items-center">
          <label htmlFor={`${formId}-input`} className="shrink-0">
            {capitalize(mediaType)} list:
          </label>

          <Controller
            name="sortOrder"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-auto">
                <Input
                  {...field}
                  value={field.value as number}
                  id={`${formId}-input`}
                  type="number"
                  min={1}
                  aria-invalid={fieldState.invalid}
                  placeholder="Position"
                  autoComplete="off"
                  className="w-full"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {loading ? (
            <Spinner />
          ) : (
            <>
              <Field orientation="horizontal" className="w-auto">
                <Button type="submit" aria-label="Save position">
                  <Save />
                </Button>
              </Field>

              <Button
                type="button"
                variant="destructive"
                aria-label="Remove from list"
                onClick={() => handleRemove()}
              >
                <Trash2 />
              </Button>
            </>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
