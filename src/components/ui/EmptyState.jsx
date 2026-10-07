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
    className={`mx-auto max-w-lg rounded-xl border border-border bg-surface p-8 text-center shadow-sm md:p-10 ${className}`}
  >
      {icon && <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>}

      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
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
