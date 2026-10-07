import { Check, Minus } from "lucide-react";
import Button from "../../components/ui/Button";
import { formatNaira } from "../../utils/formatNaira";

const FareOptionCard = ({
  title,
  subtitle,
  price,
  features,
  featured = false,
  premium = false,
  onSelect,
}) => {
  const cardTone = featured
    ? "border-primary/50 bg-primary/5"
    : premium
      ? "border-secondary/50 bg-secondary/5"
      : "border-border bg-surface";
  const buttonVariant = featured ? "primary" : premium ? "accent" : "outline";

  return (
    <article className={`relative flex h-full flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardTone}`}>
      {featured && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-primary shadow-sm">
          Most popular
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className={`text-sm font-bold ${premium ? "text-foreground" : featured ? "text-primary" : "text-foreground"}`}>
            {title}
          </h4>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>
        <p className="shrink-0 text-right font-mono text-base font-extrabold text-foreground">
          {formatNaira(price)}
        </p>
      </div>

      <ul className="mt-4 flex-1 space-y-2 border-t border-border/80 pt-4 text-xs leading-relaxed text-foreground">
        {features.map((feature) => {
          const Icon = feature.included ? Check : Minus;
          return (
            <li key={feature.label} className="flex items-start gap-2">
              <Icon
                aria-hidden="true"
                size={14}
                className={`mt-0.5 shrink-0 ${feature.included ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}
              />
              <span className={feature.included ? "text-foreground" : "text-muted"}>{feature.label}</span>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        onClick={onSelect}
        aria-label={`Choose ${title} for ${formatNaira(price)}`}
        className="mt-5 min-h-11 w-full rounded-xl font-bold"
      >
        Choose fare
      </Button>
    </article>
  );
};

export default FareOptionCard;
