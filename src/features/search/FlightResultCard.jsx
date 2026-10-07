import {
  AlertCircle,
  ArrowDown,
  Check,
  ChevronDown,
  Coffee,
  Luggage,
  Plane,
  Sparkles,
  Wifi,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatNaira } from "../../utils/formatNaira";
import FareOptionCard from "./FareOptionCard";

const FlightResultCard = ({
  flight,
  currentPrice,
  seatsLeft,
  isExpanded,
  onToggleFares,
  onSelectFareTier,
}) => {
  const fareOptions = [
    {
      title: "Economy Classic",
      subtitle: "A comfortable standard fare",
      fareTier: "Classic",
      price: flight.priceEconomy,
      features: [
        { label: "20 kg checked baggage", included: true },
        { label: "Standard in-flight meal", included: true },
        { label: "Seat selection for a fee", included: false },
        { label: "₦15,000 cancellation charge", included: false },
      ],
    },
    {
      title: "Economy Flex",
      subtitle: "More flexibility for your journey",
      fareTier: "Flex",
      price: flight.priceEconomy + 2e4,
      featured: true,
      features: [
        { label: "30 kg checked baggage (+10 kg)", included: true },
        { label: "Free standard seat selection", included: true },
        { label: "Priority check-in", included: true },
        { label: "One free date change", included: true },
      ],
    },
    {
      title: "Royal Business",
      subtitle: "Premium comfort and lounge access",
      fareTier: "Business",
      price: flight.priceBusiness,
      premium: true,
      features: [
        { label: "40 kg baggage and two cabin bags", included: true },
        { label: "Lagos and Abuja lounge access", included: true },
        { label: "Priority boarding and baggage", included: true },
        { label: "Lie-flat seat and Nigerian dining", included: true },
      ],
    },
  ];
  const fareOptionsId = `fare-options-${String(flight.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <article className={`overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all duration-200 hover:shadow-md ${
      isExpanded ? "border-primary/40 ring-1 ring-primary/10" : "border-border hover:border-primary/30"
    }`}>
      <div className="p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:gap-6">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Plane aria-hidden="true" size={18} className="-rotate-45" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-foreground">{flight.airline}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  <span className="font-mono font-semibold">{flight.flightNumber}</span>
                  <span aria-hidden="true" className="mx-1.5">·</span>
                  {flight.aircraft}
                </p>
              </div>
              {seatsLeft < 10 && (
                <Badge variant="warning" size="sm" className="normal-case tracking-normal">
                  <AlertCircle aria-hidden="true" size={12} className="mr-1" />
                  {`Only ${seatsLeft} seats left`}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(88px,1fr)_minmax(0,1fr)] items-center gap-2 sm:gap-4">
              <div className="min-w-0">
                <p className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {flight.departureTime}
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{flight.origin.code}</p>
                <p className="truncate text-xs text-muted">{flight.origin.city}</p>
              </div>

              <div className="flex min-w-0 flex-col items-center text-center">
                <p className="whitespace-nowrap text-xs font-medium text-muted">{flight.duration}</p>
                <div className="my-2 flex w-full items-center gap-1.5" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  <Plane size={15} className="shrink-0 rotate-90 text-primary" />
                  <span className="h-px flex-1 bg-border" />
                </div>
                <p className={`text-xs font-semibold ${flight.stops === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted"}`}>
                  {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops === 1 ? "" : "s"}`}
                </p>
              </div>

              <div className="min-w-0 text-right">
                <p className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {flight.arrivalTime}
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{flight.destination.code}</p>
                <p className="truncate text-xs text-muted">{flight.destination.city}</p>
              </div>
            </div>

            <ul aria-label="Included flight amenities" className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted">
              <li className="inline-flex items-center gap-1.5">
                <Luggage aria-hidden="true" size={14} className="text-primary" />
                {flight.baggageIncluded}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Coffee aria-hidden="true" size={14} className="text-primary" />
                {flight.mealIncluded ? "Meal included" : "Snacks on board"}
              </li>
              {flight.wifiAvailable && (
                <li className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Wifi aria-hidden="true" size={14} />
                  In-flight Wi-Fi
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-row items-center justify-between gap-4 border-t border-border pt-4 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:pt-0 md:pl-6">
            <div className="min-w-0 md:text-right">
              <p className="text-xs font-medium text-muted">From</p>
              <p className="mt-0.5 whitespace-nowrap font-mono text-2xl font-extrabold tracking-tight text-foreground">
                {formatNaira(currentPrice)}
              </p>
              <p className="mt-1 text-[11px] text-muted">Per passenger, taxes included</p>
            </div>
            <Button
              type="button"
              variant={isExpanded ? "secondary" : "primary"}
              size="sm"
              onClick={onToggleFares}
              aria-expanded={isExpanded}
              aria-controls={fareOptionsId}
              className="min-h-11 shrink-0 rounded-xl px-4 font-bold"
            >
              {isExpanded ? "Hide fares" : "Compare fares"}
              <ChevronDown aria-hidden="true" size={15} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <section
          id={fareOptionsId}
          aria-label={`Fare options for ${flight.flightNumber}`}
          className="border-t border-border bg-background/70 px-5 py-5 sm:px-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Choose your fare</h3>
              <p className="mt-1 text-xs text-muted">Compare inclusions before you book.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Check aria-hidden="true" size={14} className="text-emerald-600 dark:text-emerald-400" />
              Instant seat reservation hold
            </span>
          </div>

          <div className="grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fareOptions.map((option) => (
              <FareOptionCard
                key={option.fareTier}
                {...option}
                onSelect={() => onSelectFareTier(flight, option.fareTier)}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default FlightResultCard;
