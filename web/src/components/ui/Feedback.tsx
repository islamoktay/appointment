import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export type AlertTone = "error" | "conflict" | "success" | "info";

const toneStyles: Record<
  AlertTone,
  { wrapper: string; icon: React.ComponentType<{ className?: string }> }
> = {
  error: {
    wrapper: "border-cancelled/30 bg-cancelled/5 text-cancelled",
    icon: AlertCircle,
  },
  conflict: {
    wrapper: "border-pending/40 bg-pending/10 text-pending",
    icon: AlertTriangle,
  },
  success: {
    wrapper: "border-confirmed/30 bg-confirmed/10 text-confirmed",
    icon: CheckCircle2,
  },
  info: {
    wrapper: "border-slate-200 bg-surface text-brand",
    icon: Info,
  },
};

export function AlertBanner({
  tone = "info",
  title,
  message,
  action,
  className = "",
}: {
  tone?: AlertTone;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const { wrapper, icon: Icon } = toneStyles[tone];

  return (
    <div
      role={tone === "error" || tone === "conflict" ? "alert" : "status"}
      className={[
        "flex items-start justify-between gap-3 rounded-xl border p-4 text-sm",
        wrapper,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="space-y-0.5">
          {title && <p className="font-semibold">{title}</p>}
          <p className="opacity-95">{message}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-completed">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-brand">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-completed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded-md bg-slate-200/80", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
