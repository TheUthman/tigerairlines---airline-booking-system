const Card = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  hoverEffect = false,
  ...props
}) => {
  const variantStyles = {
    default: "bg-surface rounded-2xl shadow-sm border border-border/80",
    outline: "bg-surface rounded-2xl border-2 border-border shadow-none",
    elevated: "bg-surface rounded-2xl shadow-xl border border-border",
    flat: "bg-surface-muted rounded-2xl border border-border/60 shadow-none",
    glass: "bg-surface/80 backdrop-blur-md rounded-2xl border border-border/40 shadow-lg"
  };
  const sizeStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  const hoverStyle = hoverEffect ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : "";
  return <div
    className={`${variantStyles[variant]} ${sizeStyles[size]} ${hoverStyle} ${className}`}
    {...props}
  >
      {children}
    </div>;
};
const CardHeader = ({
  children,
  className = "",
  ...props
}) => <div className={`pb-4 border-b border-border space-y-1 ${className}`} {...props}>
    {children}
  </div>;
const CardTitle = ({
  children,
  className = "",
  ...props
}) => <h3 className={`text-base font-bold text-foreground tracking-tight ${className}`} {...props}>
    {children}
  </h3>;
const CardDescription = ({
  children,
  className = "",
  ...props
}) => <p className={`text-xs text-muted leading-relaxed ${className}`} {...props}>
    {children}
  </p>;
const CardContent = ({
  children,
  className = "",
  ...props
}) => <div className={`py-4 ${className}`} {...props}>
    {children}
  </div>;
const CardFooter = ({
  children,
  className = "",
  ...props
}) => <div className={`pt-4 border-t border-border flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>;
var stdin_default = Card;
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  stdin_default as default
};
