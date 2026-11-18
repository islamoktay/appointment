"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui";

export function ProviderSearchBar({
  initialSearch,
}: {
  initialSearch: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialSearch);
  const [isPending, startTransition] = React.useTransition();

  function applySearch(value: string) {
    const trimmed = value.trim();
    startTransition(() => {
      if (trimmed) {
        router.push(`/providers?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/providers");
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch(query);
  }

  function handleClear() {
    setQuery("");
    applySearch("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search providers"
      className="flex flex-col gap-2 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-completed"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search providers by name or email..."
          aria-label="Search providers by name or email"
          className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-9 text-sm text-brand placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-completed hover:bg-surface hover:text-brand cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <Button type="submit" loading={isPending}>
        Search
      </Button>
    </form>
  );
}
