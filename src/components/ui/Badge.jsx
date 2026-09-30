const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  className = ""
}) => {
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/25",
    accent: "bg-secondary/20 text-on-secondary border border-secondary/40",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    neutral: "bg-surface-muted text-foreground border border-border",
    blue: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30"
  };
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 font-semibold",
    md: "text-xs px-2.5 py-1 font-medium"
  };
  return <span
    className={`inline-flex items-center rounded-full uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
  >
      {children}
    </span>;
};
var stdin_default = Badge;
export {
  Badge,
  stdin_default as default
};
