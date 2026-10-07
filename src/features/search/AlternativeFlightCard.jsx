import { ArrowRight, Plane } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatNaira } from "../../utils/formatNaira";

const AlternativeFlightCard = ({ flight, onSelect }) => (
  <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:border-primary/35 hover:shadow-md sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plane aria-hidden="true" size={17} className="-rotate-45" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{flight.airline}</p>
          <p className="text-xs text-muted">{flight.flightNumber}</p>
        </div>
      </div>
      <Badge variant="neutral" size="sm">Alternative option</Badge>
    </div>

    <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_auto] sm:gap-4">
      <div>
        <p className="font-mono text-xl font-bold text-foreground">{flight.departureTime}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{flight.origin.city} <span className="text-muted">({flight.origin.code})</span></p>
      </div>
      <ArrowRight aria-hidden="true" size={17} className="hidden text-muted sm:block" />
      <div>
        <p className="font-mono text-xl font-bold text-foreground">{flight.arrivalTime}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{flight.destination.city} <span className="text-muted">({flight.destination.code})</span></p>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
        <div>
          <p className="text-xs text-muted">Economy from</p>
          <p className="font-mono text-xl font-extrabold text-foreground">{formatNaira(flight.priceEconomy)}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={onSelect}
          className="min-h-10 shrink-0 rounded-xl px-4 font-bold sm:mt-3"
        >
          Select flight
        </Button>
      </div>
    </div>
  </article>
);

export default AlternativeFlightCard;
