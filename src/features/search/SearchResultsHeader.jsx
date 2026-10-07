import { ArrowRight, CalendarDays, ChevronRight, PencilLine } from "lucide-react";
import Button from "../../components/ui/Button";
import { formatNaira } from "../../utils/formatNaira";

const formatSearchDate = (dateValue) => {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const SearchResultsHeader = ({
  origin,
  destination,
  cabinClass,
  departDate,
  onModifySearch,
}) => (
  <section
    aria-label="Flight search summary"
    className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 lg:p-7"
  >
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
            <li>Flights</li>
            <li aria-hidden="true"><ChevronRight size={13} /></li>
            <li>TigerAirlines</li>
            <li aria-hidden="true"><ChevronRight size={13} /></li>
            <li aria-current="page" className="text-foreground">Search results</li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            <span>{origin}</span>
            <ArrowRight aria-hidden="true" size={21} className="text-primary" />
            <span>{destination}</span>
          </h1>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {cabinClass} class
          </span>
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <CalendarDays aria-hidden="true" size={15} className="text-primary" />
          <span>{formatSearchDate(departDate)}</span>
          <span aria-hidden="true" className="text-border">•</span>
          <span>Fares shown per passenger</span>
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={onModifySearch}
        className="min-h-11 shrink-0 border border-border px-4 font-semibold"
      >
        <PencilLine aria-hidden="true" size={15} />
        Modify search
      </Button>
    </div>
  </section>
);

export const FlexibleDateStrip = ({ departDate }) => {
  const parsedDate = new Date(`${departDate}T12:00:00`);
  const baseDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const offsets = [-3, -2, -1, 0, 1, 2, 3];

  const dates = offsets.map((offset) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offset);
    const dateString = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const fare = offset === 0
      ? 55e3
      : offset === -2
        ? 45e3
        : offset === 1
          ? 62e3
          : 5e4 + offset * 3e3;

    return {
      offset,
      dateString,
      weekday: date.toLocaleDateString("en-NG", { weekday: "short" }),
      monthDay: date.toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      fare,
      isCheapest: offset === -2,
      isSelected: dateString === departDate,
    };
  });

  return (
    <section
      aria-label="Fares for nearby dates"
      className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">Nearby dates</h2>
          <p className="mt-0.5 text-xs text-muted">Indicative fares, one-way per passenger</p>
        </div>
        <p className="text-xs font-medium text-muted">±3 days</p>
      </div>

      <div role="list" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {dates.map((item) => (
          <div
            key={item.offset}
            role="listitem"
            aria-current={item.isSelected ? "date" : undefined}
            aria-label={`${item.weekday}, ${item.monthDay}${item.isSelected ? ", selected departure date" : ""}${item.isCheapest ? ", lowest indicative fare" : ""}`}
            className={`relative flex min-h-[74px] flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition-colors ${
              item.isSelected
                ? "border-primary bg-primary text-on-primary shadow-sm"
                : "border-border bg-background text-foreground"
            }`}
          >
            {item.isCheapest && (
              <span className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                item.isSelected
                  ? "bg-secondary text-on-secondary"
                  : "border border-secondary/40 bg-secondary/20 text-on-secondary"
              }`}>
                Lowest fare
              </span>
            )}
            <span className={`text-xs font-semibold ${item.isSelected ? "text-on-primary" : "text-foreground"}`}>
              {item.weekday}, {item.monthDay}
            </span>
            <span className={`mt-1 font-mono text-sm font-bold ${item.isSelected ? "text-on-primary" : "text-primary"}`}>
              {formatNaira(item.fare)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SearchResultsHeader;
