import * as z from "zod";

import { TIERS } from "./tiers";

// Shared between the client form and the server action. Lives outside the
// "use client" component so the server can actually run it (importing a value
// from a "use client" module on the server only yields a client reference).
export const RecordEditFormSchema = z.object({
  id: z.number().int().positive(),
  rating: z.string().regex(/^(10|[0-9])$/, "Invalid rating"),
  // "none" = no tier (Radix Select can't use an empty string as a value)
  tier: z.enum(["none", ...TIERS]),
  recommendation: z.string().max(500),
  review: z.string().max(10000),
  watchedAt: z.date(),
});

export type RecordEditFormValues = z.infer<typeof RecordEditFormSchema>;

export const SortListType = z.enum(["anime", "movie", "series"]);
export type SortListType = z.infer<typeof SortListType>;
