import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getDefaultRouteForRole } from "@/lib/date-utils";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDefaultRouteForRole(user.role));
  }

  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <LoginForm nextPath={params.next} />
    </main>
  );
}
