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
  search: z.string().min(3, {
    message: "At least 3 characters.",
  }),
});

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(searchParams);
    if (values.search) {
      params.set("search", values.search);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <Controller
          name="search"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="w-full" data-invalid={fieldState.invalid}>
              <Input placeholder={placeholder} {...field} aria-invalid={fieldState.invalid}/>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" variant={"default"} className="gap-2">
          <SearchIcon strokeWidth={1.5} />
          Search
        </Button>
      </form>
    </div>
  );
}
