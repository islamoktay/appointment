import * as React from "react";
import type { AppointmentStatus } from "@/types/api";

export type BadgeVariant =
  | "brand"
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: "bg-brand text-white border-brand",
  confirmed: "bg-confirmed/10 text-confirmed border-confirmed/25",
  pending: "bg-pending/10 text-pending border-pending/25",
  cancelled: "bg-cancelled/10 text-cancelled border-cancelled/25",
  completed: "bg-completed/10 text-completed border-completed/25",
  neutral: "bg-surface text-completed border-slate-200",
};

export function Badge({
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; variant: BadgeVariant; dotClass: string }
> = {
  CONFIRMED: {
    label: "Confirmed",
    variant: "confirmed",
    dotClass: "bg-confirmed",
  },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "pending",
    dotClass: "bg-pending",
  },
  COMPLETED: {
    label: "Completed",
    variant: "completed",
    dotClass: "bg-completed",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "cancelled",
    dotClass: "bg-cancelled",
  },
};

export function AppointmentStatusBadge({
  status,
  className = "",
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={className}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`}
        aria-hidden="true"
      />
      {meta.label}
    </Badge>
  );
}
