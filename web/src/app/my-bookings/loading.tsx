import { Card, CardContent, Skeleton } from "@/components/ui";

export default function MyBookingsLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Skeleton className="h-11 w-64 rounded-xl" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
