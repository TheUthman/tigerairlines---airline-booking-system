import { formatNaira } from "../../utils/formatNaira";

const FlightFiltersPanel = ({
  maxPrice,
  setMaxPrice,
  selectedStops,
  setSelectedStops,
  selectedAirline,
  setSelectedAirline,
  airlineOptions,
  onReset,
  idPrefix = "flight-filters",
}) => {
  const maxPriceId = `${idPrefix}-max-price`;

  return (
    <section className="surface-card space-y-6 p-5" aria-labelledby={`${idPrefix}-title`}>
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <h2 id={`${idPrefix}-title`} className="flex items-center gap-2 text-sm font-semibold text-foreground">
          Filter flights
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="min-h-9 rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Reset all
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label htmlFor={maxPriceId} className="text-sm font-medium text-foreground">
            Maximum ticket price
          </label>
          <span className="font-mono text-sm font-semibold text-primary-dark dark:text-primary">
            {formatNaira(maxPrice)}
          </span>
        </div>
        <input
          id={maxPriceId}
          type="range"
          min="30000"
          max="1500000"
          step="10000"
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>₦30,000</span>
          <span>₦1,500,000</span>
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-foreground">Stops</legend>
        <div className="space-y-2.5">
          {[
            { value: "all", label: "All flights" },
            { value: "direct", label: "Non-stop only" },
            { value: "1stop", label: "1 stop" },
          ].map((option) => {
            const optionId = `${idPrefix}-stops-${option.value}`;
            return (
              <label key={option.value} htmlFor={optionId} className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  id={optionId}
                  type="radio"
                  name={`${idPrefix}-stops`}
                  value={option.value}
                  checked={selectedStops === option.value}
                  onChange={() => setSelectedStops(option.value)}
                  className="h-4 w-4 accent-primary"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {airlineOptions.length > 0 && (
        <div>
          <label htmlFor={`${idPrefix}-airline`} className="mb-2 block text-sm font-medium text-foreground">
            Airline
          </label>
          <select
            id={`${idPrefix}-airline`}
            value={selectedAirline}
            onChange={(event) => setSelectedAirline(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All airlines</option>
            {airlineOptions.map((airline) => (
              <option key={airline} value={airline}>
                {airline}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
};

export default FlightFiltersPanel;
