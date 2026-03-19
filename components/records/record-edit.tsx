"use client";

import * as z from "zod";

import { ChevronDownIcon, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup } from "../ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Status, updateRecord } from "@/lib/record";

import { Button } from "../ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Database } from "@/lib/database.types";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

export const RecordEditFormSchema = z.object({
  id: z.number().readonly(),
  rating: z.string(),
  recommendation: z.string(),
  review: z.string(),
  watchedAt: z.date(),
});

const ratingOptions = [
  { label: "10 - Masterpiece", value: "10" },
  { label: "9 - Great", value: "9" },
  { label: "8 - Good", value: "8" },
  { label: "7 - Fine", value: "7" },
  { label: "6 - Mediocre", value: "6" },
  { label: "5 - Could be better", value: "5" },
  { label: "4 - Forgetable", value: "4" },
  { label: "3 - Just Bad", value: "3" },
  { label: "2 - Waste of time", value: "2" },
  { label: "1 - Total garbage", value: "1" },
] as const;

export function RecordEditForm({
  record,
}: {
  record: Database["public"]["Tables"]["records"]["Row"];
}) {
  const form = useForm<z.infer<typeof RecordEditFormSchema>>({
    resolver: zodResolver(RecordEditFormSchema),
    defaultValues: {
      id: record.id,
      rating: String(record.rating),
      recommendation: record.recommendation
        ? String(record.recommendation)
        : "",
      review: record.review ? String(record.review) : "",
      watchedAt: new Date(String(record.watchedat)),
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Status | undefined>(undefined);
  const { push } = useRouter();

  async function onSubmit(formValues: z.infer<typeof RecordEditFormSchema>) {
    setLoading(true);
    const { status } = await updateRecord({
      formValues,
    });

    if (status === "success") {
      return push(`/${record.mediatype}/${record.year}/${record.slug}`);
    } else {
      setError({ status });
    }

    setLoading(false);
  }

  if (!record) {
    return null;
  }

  return (
    <div className="space-y-4 border-t-2 border-dashed border-muted pt-4">
      <form
        id="form-rhf-edit-record"
        // onSubmit={form.handleSubmit(onSubmit)}
        onSubmit={form.handleSubmit(onSubmit, (errors) =>
          console.log("Validation Errors:", errors),
        )}
        className="space-y-4"
      >
        <FieldGroup className="flex flex-col gap-4 md:flex-row">
          <Controller
            name="rating"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-auto">
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="form-rhf-select-language"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="0">No rating</SelectItem>
                    <SelectSeparator />
                    {ratingOptions.map((rating) => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="recommendation"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="recommendation"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Controller
            name="review"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Textarea
                  {...field}
                  id="form-rhf-textarea-about"
                  aria-invalid={fieldState.invalid}
                  placeholder="review"
                  className="min-h-30"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Controller
            name="watchedAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!field.value}
                      className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                    >
                      {/* Use field.value instead of date */}
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Watch Date</span>
                      )}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      {...field}
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      defaultMonth={field.value}
                      required={true}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex">


        <Button
            type={!loading ? "submit" : "button"}
            variant={"default"}
            className="gap-2"
            form="form-rhf-edit-record"
          >
            <Save strokeWidth={1.5} /> {!loading ? (
              <span>Save</span>
            ) : (
              <Spinner />
            ) }
          </Button>
        </div>
      </form>
    </div>
  );
}
