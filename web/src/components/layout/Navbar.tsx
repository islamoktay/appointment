"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  CalendarClock,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { getDefaultRouteForRole } from "@/lib/date-utils";
import type { UserDto } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROVIDER_NAV: NavItem[] = [
  { href: "/provider/dashboard", label: "Daily Queue", icon: LayoutDashboard },
  {
    href: "/provider/schedule",
    label: "Weekly Schedule",
    icon: SlidersHorizontal,
  },
];

const CLIENT_NAV: NavItem[] = [
  { href: "/providers", label: "Browse Providers", icon: Users },
  { href: "/my-bookings", label: "My Bookings", icon: CalendarCheck },
];

export function Navbar({ user }: { user: UserDto | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const navItems = user
    ? user.role === "PROVIDER"
      ? PROVIDER_NAV
      : CLIENT_NAV
    : [];

  const homeHref = user ? getDefaultRouteForRole(user.role) : "/";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      setMobileOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2.5 text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 rounded-md"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              QueueBook
            </span>
          </Link>

          {navItems.length > 0 && (
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-1 md:flex"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand text-white"
                        : "text-completed hover:bg-surface hover:text-brand",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-surface px-3 py-1.5">
                <div className="text-right leading-tight">
                  <p className="text-xs font-semibold text-brand">
                    {user.fullName}
                  </p>
                  <p className="inline-flex items-center gap-1 text-[11px] text-completed">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    {user.timezone}
                  </p>
                </div>
                <Badge
                  variant={user.role === "PROVIDER" ? "brand" : "confirmed"}
                >
                  {user.role === "PROVIDER" ? "Provider" : "Client"}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={signingOut}
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md px-3.5 text-sm font-medium text-brand transition-colors hover:bg-surface"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-brand hover:bg-surface md:hidden cursor-pointer"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-surface p-3">
                <div>
                  <p className="text-sm font-semibold text-brand">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-completed">{user.email}</p>
                  <p className="mt-0.5 text-xs text-completed">
                    Timezone: {user.timezone}
                  </p>
                </div>
                <Badge
                  variant={user.role === "PROVIDER" ? "brand" : "confirmed"}
                >
                  {user.role === "PROVIDER" ? "Provider" : "Client"}
                </Badge>
              </div>

              <nav aria-label="Mobile navigation" className="grid gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "inline-flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium",
                        active
                          ? "bg-brand text-white"
                          : "text-brand hover:bg-surface",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Button
                variant="outline"
                fullWidth
                loading={signingOut}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-brand hover:bg-surface"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
