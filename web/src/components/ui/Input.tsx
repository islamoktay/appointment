import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { id, label, hint, error, className = "", required, ...props },
    ref,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-brand"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-cancelled" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          className={[
            "block w-full h-10 rounded-md border bg-white px-3 text-sm text-brand",
            "placeholder:text-slate-400 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:bg-surface disabled:text-completed",
            error
              ? "border-cancelled focus:border-cancelled focus:ring-cancelled/25"
              : "border-slate-300 focus:border-brand focus:ring-brand/20",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-cancelled">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-completed">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { id, label, hint, error, className = "", required, children, ...props },
    ref,
  ) {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint && !error ? `${selectId}-hint` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-brand"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-cancelled" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          className={[
            "block w-full h-10 rounded-md border bg-white px-3 text-sm text-brand",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:bg-surface disabled:text-completed",
            error
              ? "border-cancelled focus:border-cancelled focus:ring-cancelled/25"
              : "border-slate-300 focus:border-brand focus:ring-brand/20",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-cancelled">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-completed">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
