import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { formatNaira } from "../../utils/formatNaira";

const stopOptions = [
  { value: "all", label: "All flights" },
  { value: "direct", label: "Non-stop only" },
  { value: "1stop", label: "1 stop" },
];

const sortOptions = [
  { value: "price", label: "Price" },
  { value: "duration", label: "Duration" },
  { value: "departure", label: "Departure" },
];

const SearchResultsFilters = ({
  maxPrice,
  onMaxPriceChange,
  selectedStops,
  onStopsChange,
  selectedAirline,
  onAirlineChange,
  airlineOptions,
  sortBy,
  onSortChange,
  onResetFilters,
}) => (
  <aside aria-label="Flight filters" className="lg:col-span-1">
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Filter aria-hidden="true" size={16} />
            </span>
            <h2 className="text-base font-bold text-foreground">Refine results</h2>
          </div>
          <p className="mt-2 text-xs text-muted">Narrow down your flight options</p>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw aria-hidden="true" size={13} />
          Reset filters
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <label htmlFor="max-ticket-price" className="block text-sm font-semibold text-foreground">
              Maximum fare
            </label>
            <span className="text-xs text-muted">Per passenger</span>
          </div>
          <output htmlFor="max-ticket-price" className="font-mono text-sm font-bold text-primary">
            {formatNaira(maxPrice)}
          </output>
        </div>
        <input
          id="max-ticket-price"
          type="range"
          min="30000"
          max="1500000"
          step="10000"
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          aria-valuetext={`Up to ${formatNaira(maxPrice)}`}
          className="w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        />
        <div aria-hidden="true" className="flex justify-between text-[11px] text-muted">
          <span>{formatNaira(30000)}</span>
          <span>{formatNaira(1500000)}</span>
        </div>
      </div>

      <fieldset className="space-y-3 border-t border-border pt-5">
        <legend className="text-sm font-semibold text-foreground">Stops</legend>
        <div className="space-y-2.5">
          {stopOptions.map((option) => (
            <label key={option.value} className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="radio"
                name="flight-stops"
                value={option.value}
                checked={selectedStops === option.value}
                onChange={() => onStopsChange(option.value)}
                className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2 border-t border-border pt-5">
        <label htmlFor="airline-filter" className="block text-sm font-semibold text-foreground">
          Airline
        </label>
        <div className="relative">
          <select
            id="airline-filter"
            value={selectedAirline}
            onChange={(event) => onAirlineChange(event.target.value)}
            className="min-h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-9 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">All airlines</option>
            {airlineOptions.map((airline) => (
              <option key={airline} value={airline}>{airline}</option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={15} className="pointer-events-none absolute inset-y-0 right-3 my-auto text-muted" />
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <p className="text-sm font-semibold text-foreground">Sort by</p>
        <div role="group" aria-label="Sort flights" className="grid grid-cols-3 gap-1 rounded-xl bg-surface-muted p-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sortBy === option.value}
              onClick={() => onSortChange(option.value)}
              className={`min-h-9 rounded-lg px-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                sortBy === option.value
                  ? "bg-surface text-primary shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </aside>
);

export default SearchResultsFilters;
