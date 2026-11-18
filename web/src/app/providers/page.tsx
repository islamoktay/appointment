import Link from "next/link";
import { ArrowRight, Globe, Mail, Users } from "lucide-react";
import { ProviderSearchBar } from "@/components/client/ProviderSearchBar";
import {
  AlertBanner,
  Badge,
  Card,
  CardContent,
  EmptyState,
} from "@/components/ui";
import { ApiError, listProviders } from "@/lib/backend-api";
import { requireUser } from "@/lib/session";
import type { ProviderSummaryDto } from "@/types/api";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default async function ProvidersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireUser("CLIENT");
  const params = await searchParams;
  const search = params.search?.trim() ?? "";

  let providers: ProviderSummaryDto[] = [];
  let loadError: string | null = null;

  try {
    providers = await listProviders(search || undefined);
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load the provider directory right now.";
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-completed">
            Client Booking Hub
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
            Browse Providers
          </h1>
          <p className="mt-1 text-sm text-completed">
            Select a provider to inspect live open slots and reserve an
            appointment.
          </p>
        </div>

        <Link
          href="/my-bookings"
          className="inline-flex h-10 items-center justify-center self-start rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-brand transition-colors hover:bg-surface"
        >
          View My Bookings
        </Link>
      </div>

      <ProviderSearchBar initialSearch={search} />

      {loadError ? (
        <AlertBanner
          tone="error"
          title="Could not load providers"
          message={loadError}
        />
      ) : providers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          title={
            search
              ? `No providers matching "${search}"`
              : "No providers available yet"
          }
          description={
            search
              ? "Try a different name or email, or clear your search filter to see all active providers."
              : "Once service providers register on QueueBook, they will appear here ready for booking."
          }
          action={
            search ? (
              <Link
                href="/providers"
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-brand hover:bg-surface"
              >
                Clear search
              </Link>
            ) : undefined
          }
        />
      ) : (
        <section
          aria-label="Available providers"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className="flex flex-col justify-between transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white">
                    {getInitials(provider.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-brand">
                      {provider.fullName}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-completed">
                      <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{provider.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <Badge variant="neutral">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    {provider.timezone}
                  </Badge>

                  <Link
                    href={`/providers/${provider.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand/90"
                  >
                    Pick a slot
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
