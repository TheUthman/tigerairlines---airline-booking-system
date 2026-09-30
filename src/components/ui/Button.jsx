import { forwardRef } from "react";
const Button = forwardRef(
  ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    pill = false,
    isLoading = false,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";
    const variants = {
      primary: "bg-primary hover:bg-primary-hover text-on-primary shadow-sm focus:ring-primary",
      accent: "bg-secondary hover:bg-secondary-hover text-on-secondary shadow-sm focus:ring-secondary font-semibold",
      outline: "border border-primary text-primary hover:bg-primary/10 focus:ring-primary",
      secondary: "bg-surface-muted hover:bg-border text-foreground focus:ring-muted",
      ghost: "hover:bg-surface-muted text-foreground focus:ring-border",
      white: "bg-surface text-primary hover:bg-surface-muted shadow-sm focus:ring-surface font-semibold",
      darkRed: "bg-primary-dark hover:bg-primary-hover text-on-primary focus:ring-primary-dark",
      danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-600 font-semibold"
    };
    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
      icon: "p-2 w-10 h-10"
    };
    const roundedClass = pill ? "rounded-full" : size === "icon" ? "rounded-full" : "rounded-lg";
    return <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${roundedClass} ${className}`}
      {...props}
    >
        {isLoading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>}
        {children}
      </button>;
  }
);
Button.displayName = "Button";
var stdin_default = Button;
export {
  Button,
  stdin_default as default
};
