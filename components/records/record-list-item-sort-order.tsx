"use client";

import * as z from "zod";

import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  addRecordToSortOrder,
  moveSingleRecordSortOrder,
  removeRecordFromSortOrder,
} from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "../ui/spinner";
import { capitalize } from "radash";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  sortOrder: z.coerce
    .number({
      required_error: "Sort order is required",
      invalid_type_error: "Sort order must be a number",
    })
    .int("Must be a whole number")
    .min(0, "Must be 0 or greater"),
});

export default function RecordListItemSortOrderForm({
  id,
  mediaType,
  currentSortOrder,
}: {
  id: number;
  mediaType: "anime" | "movie" | "series";
  currentSortOrder?: number | null;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sortOrder: currentSortOrder || 0,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    const { status } = await moveSingleRecordSortOrder({
      recordId: id,
      newPosition: data.sortOrder,
      mediaType: mediaType,
    });

    if (status === "success") {
      toast.success(`Updated ${mediaType} sort order to: ${data.sortOrder}`);
    } else {
      toast.error("Error updating record position");
    }

    setLoading(false);
    return;
  }

  async function handleAdd() {
    setLoading(true);
    const { status } = await addRecordToSortOrder({ mediaType, recordId: id });

    if (status === "success") {
      toast.success(`Added to ${mediaType} list`);
      router.refresh();
    } else {
      toast.error("Error adding record to sort order list");
    }

    setLoading(false);
    return;
  }

  async function handleRemove() {
    setLoading(true);
    const { status } = await removeRecordFromSortOrder({
      mediaType,
      recordId: id,
    });

    if (status === "success") {
      toast.success(`Removed from ${mediaType} list`);
      router.refresh();
    } else {
      toast.error("Error adding record to sort order list");
    }

    setLoading(false);
    return;
  }

  if (currentSortOrder === null || currentSortOrder === undefined) {
    if (loading) {
      return <Spinner />;
    }

    return (
      <Button onClick={() => handleAdd()}>
        Add to TOP {capitalize(mediaType)} list
      </Button>
    );
  }



  return (
    <>
      <div className="w-full">
        <form id="form-rhf-sort-order" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex gap-2 flex-row items-center">
            <div className="shrink-0">{capitalize(mediaType)} list order:</div>

            <Controller
              name="sortOrder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="w-auto">
                  <Input
                    {...field}
                    id="form-rhf-sort-order-sort-order"
                    type="number"
                    aria-invalid={fieldState.invalid}
                    placeholder="Postion"
                    autoComplete="off"
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
                  <Button type="submit" form="form-rhf-sort-order">
                    <span>Save</span>
                  </Button>
                </Field>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemove()}
                >
                  Remove
                </Button>
              </>
            )}
          </FieldGroup>
        </form>
      </div>
    </>
  );
}
