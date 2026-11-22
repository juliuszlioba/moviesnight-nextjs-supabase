"use client";

import * as z from "zod";

import { Controller, useForm } from "react-hook-form";
import { Field, FieldError } from "./ui/field";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  search: z.string().trim().min(3, {
    message: "At least 3 characters.",
  }),
});

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Keep the current query visible after navigation / reload
      search: searchParams.get("search") ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(searchParams);
    params.set("search", values.search);
    // A new search always starts on the first page
    params.delete("page");
    push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <Controller
          name="search"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="w-full" data-invalid={fieldState.invalid}>
              <Input
                type="search"
                aria-label={placeholder.replace(/…$/, "")}
                autoComplete="off"
                spellCheck={false}
                placeholder={placeholder}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" variant={"default"} className="gap-2">
          <SearchIcon strokeWidth={2} />
          Search
        </Button>
      </form>
    </div>
  );
}
