import Button from "./Button";
const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = ""
}) => {
  const primaryLabel = actionLabel || actionText;
  return <div
    className={`bg-surface rounded-3xl p-8 md:p-12 text-center border border-border shadow-xs max-w-lg mx-auto ${className}`}
  >
      {icon && <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-xs">
          {icon}
        </div>}

      <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {(primaryLabel || secondaryActionText) && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryLabel && onAction && <Button variant="primary" size="sm" onClick={onAction} className="font-bold">
              {primaryLabel}
            </Button>}
          {secondaryActionText && onSecondaryAction && <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>}
        </div>}
    </div>;
};
var stdin_default = EmptyState;
export {
  EmptyState,
  stdin_default as default
};
