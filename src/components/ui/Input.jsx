import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon,
      className = "",
      id,
      "aria-describedby": externalDescribedBy,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;
    const describedBy = [
      externalDescribedBy,
      error ? errorId : helperText ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={`min-h-11 w-full rounded-[10px] border bg-surface py-2.5 pr-3.5 text-sm text-foreground placeholder:text-muted/80 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${icon ? "pl-10" : "pl-3.5"} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-border"} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export default Input;
