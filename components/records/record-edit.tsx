"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChevronDownIcon, RefreshCw, Save, Trash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
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
import {
  RecordEditFormSchema,
  type RecordEditFormValues,
} from "@/lib/schemas";

import { AnilistLink } from "./anilist-link";
import type { AnilistMedia } from "@/lib/anilist";
import { Button } from "../ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Database } from "@/lib/database.types";
import { Input } from "../ui/input";
import RecordDeleteButton from "./record-delete";
import RecordListItemSortOrderForm from "./record-list-item-sort-order";
import { Spinner } from "../ui/spinner";
import { TIERS, TIER_STYLES, isTier, tierForRating } from "@/lib/tiers";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import slugify from "@/lib/slugify";
import { toast } from "sonner";
import { updateRecord } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

const ratingOptions = [
  { label: "10 - Masterpiece", value: "10" },
  { label: "9 - Great", value: "9" },
  { label: "8 - Good", value: "8" },
  { label: "7 - Fine", value: "7" },
  { label: "6 - Mediocre", value: "6" },
  { label: "5 - Could be better", value: "5" },
  { label: "4 - Forgettable", value: "4" },
  { label: "3 - Just Bad", value: "3" },
  { label: "2 - Waste of time", value: "2" },
  { label: "1 - Total garbage", value: "1" },
] as const;

// en-CA formats dates as yyyy-MM-dd, in the browser's time zone like the picker
const dateFormat = new Intl.DateTimeFormat("en-CA");

export function RecordEditForm({
  record,
  anilistMedia,
}: {
  record: Database["public"]["Tables"]["records"]["Row"];
  /** AniList details for record.anilistid, when linked and reachable. */
  anilistMedia: AnilistMedia | null;
}) {
  const form = useForm<RecordEditFormValues>({
    resolver: zodResolver(RecordEditFormSchema),
    defaultValues: {
      id: record.id,
      rating: String(record.rating ?? 0),
      tier: isTier(record.tier) ? record.tier : "none",
      recommendation: record.recommendation
        ? String(record.recommendation)
        : "",
      review: record.review ? String(record.review) : "",
      watchedAt: record.watchedat ? new Date(record.watchedat) : new Date(),
      title: record.title,
      slug: record.slug,
      tmdbid: record.tmdbid ? String(record.tmdbid) : "",
      anilistid: record.anilistid ? String(record.anilistid) : "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { push } = useRouter();
  const { isDirty } = form.formState;

  // Warn before closing or reloading the tab with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function onSubmit(formValues: RecordEditFormValues) {
    if (loading) return;
    setLoading(true);
    try {
      const { status, message, redirectTo, warning } = await updateRecord({
        formValues,
      });

      if (status === "success") {
        if (warning) {
          toast.warning(warning);
        } else {
          toast.success("Saved");
        }
        push(redirectTo ?? `/${record.mediatype}/${record.year}/${record.slug}`);
        return;
      }

      toast.error(
        status === "unauthorised"
          ? "Not logged in"
          : message || "Error saving record",
      );
    } catch {
      toast.error("Error saving record");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 border-t-2 border-dashed border-muted pt-4">
      <form
        id="form-rhf-edit-record"
        // onSubmit={form.handleSubmit(onSubmit)}
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          if (errors.title || errors.slug || errors.tmdbid) {
            setAdvancedOpen(true);
          }
          toast.error("Please fix the highlighted fields");
        })}
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
                  onValueChange={(value) => {
                    field.onChange(value);
                    const tier = tierForRating(Number(value));
                    if (tier) form.setValue("tier", tier, { shouldDirty: true });
                  }}
                >
                  <SelectTrigger
                    ref={field.ref}
                    id="form-rhf-select-rating"
                    aria-label="Rating"
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
            name="tier"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-auto">
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    ref={field.ref}
                    id="form-rhf-select-tier"
                    aria-label="Tier"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="none">No tier</SelectItem>
                    <SelectSeparator />
                    {TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        <span
                          className={cn(
                            "inline-flex w-6 justify-center rounded px-1 font-bold",
                            TIER_STYLES[tier],
                          )}
                        >
                          {tier}
                        </span>
                        Tier
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
                  aria-label="Recommendation"
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
                  id="form-rhf-textarea-review"
                  aria-invalid={fieldState.invalid}
                  placeholder="review"
                  aria-label="Review"
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
                        dateFormat.format(field.value)
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
                      captionLayout="dropdown"
                      required={true}
                    />
                    <div className="border-t p-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => field.onChange(new Date())}
                      >
                        Today
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Anime only: records in the Top Anime list, or already linked */}
        {(record.sort_order_anime !== null || record.anilistid !== null) && (
          <Controller
            name="anilistid"
            control={form.control}
            render={({ field }) => (
              <AnilistLink
                value={field.value}
                onChange={(value) =>
                  form.setValue("anilistid", value, { shouldDirty: true })
                }
                savedValue={record.anilistid ? String(record.anilistid) : ""}
                initialMedia={anilistMedia}
                defaultQuery={record.title}
              />
            )}
          />
        )}

        <details
          className="group rounded-xl bg-card/25"
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
            Advanced options
            <ChevronDownIcon className="size-4 motion-safe:transition-transform group-open:rotate-180" />
          </summary>

          <FieldGroup className="gap-4 border-t px-4 py-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-title"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-slug">Slug</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id="form-rhf-slug"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      title="Generate slug from title"
                      onClick={() =>
                        form.setValue("slug", slugify(form.getValues("title")), {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    >
                      <RefreshCw strokeWidth={2} />
                      From title
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Changing the slug changes the page URL: /{record.mediatype}/
                    {record.year}/{field.value || "…"}
                  </p>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="tmdbid"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-tmdbid">TMDB id</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-tmdbid"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                    placeholder="none"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </details>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Top List Sort Order</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {record.mediatype === "movie" && (
            <div className="flex gap-4 flex-col">
              <RecordListItemSortOrderForm
                key={`anime-${record.sort_order_anime}`}
                id={record.id}
                mediaType={"anime"}
                currentSortOrder={record.sort_order_anime}
              />
              <RecordListItemSortOrderForm
                key={`movie-${record.sort_order_movie}`}
                id={record.id}
                mediaType={"movie"}
                currentSortOrder={record.sort_order_movie}
              />
            </div>
          )}
          {record.mediatype === "series" && (
            <div className="flex gap-4 flex-col">
              <RecordListItemSortOrderForm
                key={`anime-${record.sort_order_anime}`}
                id={record.id}
                mediaType={"anime"}
                currentSortOrder={record.sort_order_anime}
              />
              <RecordListItemSortOrderForm
                key={`series-${record.sort_order_series}`}
                id={record.id}
                mediaType={"series"}
                currentSortOrder={record.sort_order_series}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={"destructive"}
              className="gap-2"
            >
              <Trash strokeWidth={2} />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this record?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will{" "}
                <span className="text-red-500">permanently</span> delete this record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <RecordDeleteButton id={record.id} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="submit"
          disabled={loading}
          variant={"default"}
          className="gap-2"
          form="form-rhf-edit-record"
        >
          {loading ? <Spinner /> : <Save strokeWidth={2} />}
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
