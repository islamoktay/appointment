import { CalendarClock, Clock, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
      <header className="mb-12 space-y-4">
        <span className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-1 text-xs font-medium text-white">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Appointment &amp; Queue Booking Portal
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-brand">
          Real-time scheduling without double-bookings.
        </h1>
        <p className="max-w-2xl text-base text-completed">
          Dual-role workspace connecting service providers and clients with
          live availability calculation and concurrency-safe queue management.
        </p>
      </header>

      <section
        aria-label="Platform capabilities"
        className="grid gap-6 md:grid-cols-2"
      >
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-confirmed/10 text-confirmed">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-brand">Provider Workspace</h2>
          <p className="mt-2 text-sm text-completed">
            Configure weekly working hours, define slot durations, and manage
            daily appointment queues from confirmation to completion.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-pending/10 text-pending">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-brand">Client Booking Hub</h2>
          <p className="mt-2 text-sm text-completed">
            Discover active providers, inspect real-time open slots by date,
            and manage upcoming or past bookings seamlessly.
          </p>
        </article>
      </section>
    </main>
  );
}
