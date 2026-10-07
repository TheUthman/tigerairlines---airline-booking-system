import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      pill = false,
      isLoading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer";
    const variants = {
      primary:
        "bg-primary text-on-primary shadow-sm shadow-primary/15 hover:bg-primary-hover",
      accent:
        "bg-secondary text-on-secondary shadow-sm hover:bg-secondary-hover",
      outline:
        "border border-primary bg-transparent text-primary hover:bg-primary/10",
      secondary:
        "bg-surface-muted text-foreground hover:bg-border",
      ghost: "text-foreground hover:bg-surface-muted",
      white:
        "bg-surface text-foreground shadow-sm hover:bg-surface-muted border border-border",
      darkRed: "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600",
      danger:
        "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-600",
    };
    const sizes = {
      sm: "min-h-9 px-3.5 py-2 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "min-h-12 px-6 py-3 text-base",
      icon: "h-10 w-10 p-2",
    };
    const roundedClass = pill || size === "icon" ? "rounded-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${roundedClass} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="-ml-1 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export default Button;
