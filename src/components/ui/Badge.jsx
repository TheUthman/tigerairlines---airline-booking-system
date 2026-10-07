const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const variants = {
    primary: "border border-primary/25 bg-primary/10 text-primary-dark dark:text-primary",
    accent: "border border-secondary/15 bg-secondary text-on-secondary",
    success: "border border-success/20 bg-success/10 text-success dark:bg-success/15",
    warning: "border border-warning/20 bg-warning/10 text-warning dark:bg-warning/15",
    danger: "border border-danger/20 bg-danger/10 text-danger dark:bg-danger/15",
    neutral: "border border-border bg-surface-muted text-foreground",
    blue: "border border-info/20 bg-info/10 text-info dark:bg-info/15",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
