import * as React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "confirmed"
  | "pending"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/40 shadow-xs",
  secondary:
    "bg-slate-100 text-brand hover:bg-slate-200 focus-visible:ring-brand/30",
  outline:
    "border border-slate-300 bg-white text-brand hover:bg-surface focus-visible:ring-brand/30",
  ghost:
    "bg-transparent text-brand hover:bg-slate-100 focus-visible:ring-brand/30",
  confirmed:
    "bg-confirmed text-white hover:bg-confirmed/90 focus-visible:ring-confirmed/40 shadow-xs",
  pending:
    "bg-pending text-white hover:bg-pending/90 focus-visible:ring-pending/40 shadow-xs",
  danger:
    "bg-cancelled text-white hover:bg-cancelled/90 focus-visible:ring-cancelled/40 shadow-xs",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  },
);
