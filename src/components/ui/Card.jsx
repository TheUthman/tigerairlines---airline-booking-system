const Card = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  hoverEffect = false,
  ...props
}) => {
  const variantStyles = {
    default: "rounded-xl border border-border bg-surface shadow-sm",
    outline: "rounded-xl border border-border bg-surface",
    elevated: "rounded-xl border border-border bg-surface shadow-lg shadow-black/5",
    flat: "rounded-xl border border-border/70 bg-surface-muted",
    glass: "rounded-xl border border-border/60 bg-surface/90 shadow-md backdrop-blur-md",
  };
  const sizeStyles = {
    sm: "p-4",
    md: "p-5 md:p-6",
    lg: "p-6 md:p-8",
  };
  const hoverStyle = hoverEffect
    ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    : "";

  return (
    <div
      className={`${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`space-y-1 border-b border-border pb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-base font-semibold tracking-tight text-foreground ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "", ...props }) => (
  <p className={`text-sm leading-relaxed text-muted ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`py-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`flex items-center justify-between gap-3 border-t border-border pt-4 ${className}`} {...props}>
    {children}
  </div>
);

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
export default Card;
