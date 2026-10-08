import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plane,
  Luggage,
  Coffee,
  Wifi,
  ChevronRight,
  Filter,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import flightService from "../services/flightService";
import { useAppDispatch } from "../app/store";
import {
  selectFlight,
  setBookingStep,
  setSearchParams,
} from "../features/booking/bookingSlice";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { FlightCardSkeleton } from "../components/ui/Skeleton";
import { formatNaira } from "../utils/formatNaira";
import FlightFiltersPanel from "../features/search/FlightFiltersPanel";
const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maxPrice, setMaxPrice] = useState(15e5);
  const [selectedStops, setSelectedStops] = useState("all");
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const originParam = searchParams.get("from") || "LOS";
  const destParam = searchParams.get("to") || "ABV";
  const cabinParam = searchParams.get("class") || "Economy";
  const departDateParam = searchParams.get("depart") || "2026-10-15";
  const baseDate = new Date(departDateParam || "2026-10-15");
  const flexibleDates = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const priceOffset =
      offset === 0
        ? 55e3
        : offset === -2
          ? 45e3
          : offset === 1
            ? 62e3
            : 5e4 + offset * 3e3;
    return {
      offset,
      dateStr,
      dayName,
      monthDay,
      price: priceOffset,
      isCheapest: offset === -2,
      isSelected: offset === 0,
    };
  });
  useEffect(() => {
    let isMounted = true;

    const loadFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const [allRes, searchRes] = await Promise.all([
          flightService.getFlights(),
          flightService.searchFlights({
            originCode: originParam,
            destinationCode: destParam,
            date: departDateParam,
            cabin: cabinParam.toUpperCase(),
          }),
        ]);

        if (!isMounted) return;

        const allData = Array.isArray(allRes?.data) ? allRes.data : [];
        const searchData = Array.isArray(searchRes?.data) ? searchRes.data : [];

        setAllFlights(allData);
        setFlights(searchData);
        if (searchData.length > 0) {
          setExpandedFlightId(searchData[0].id);
        } else {
          setExpandedFlightId(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setFlights([]);
        setAllFlights([]);
        setExpandedFlightId(null);
        setError(err?.message || "Unable to load flights right now.");
      } finally {
        if (isMounted) {
          setTimeout(() => setLoading(false), 300);
        }
      }
    };

    loadFlights();

    return () => {
      isMounted = false;
    };
  }, [originParam, destParam, departDateParam, cabinParam]);
  const airlineOptions = [
    ...new Set(flights.map((flight) => flight.airline).filter(Boolean)),
  ].sort((first, second) => first.localeCompare(second));
  const activeFilterCount =
    Number(maxPrice < 15e5) +
    Number(selectedStops !== "all") +
    Number(selectedAirline !== "all");
  const resetFilters = () => {
    setMaxPrice(15e5);
    setSelectedStops("all");
    setSelectedAirline("all");
  };

  const filteredFlights = flights
    .filter((flight) => {
      const price = cabinParam.toUpperCase() === "BUSINESS"
        ? flight.businessFare ?? flight.priceBusiness
        : flight.fare ?? flight.priceEconomy;
      if (!Number.isFinite(Number(price)) || Number(price) <= 0) return false;
      if (price > maxPrice) return false;
      if (selectedStops === "direct" && flight.stops > 0) return false;
      if (selectedStops === "1stop" && flight.stops === 0) return false;
      if (selectedAirline !== "all" && flight.airline !== selectedAirline)
        return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = cabinParam.toUpperCase() === "BUSINESS"
        ? a.businessFare ?? a.priceBusiness
        : a.fare ?? a.priceEconomy;
      const priceB = cabinParam.toUpperCase() === "BUSINESS"
        ? b.businessFare ?? b.priceBusiness
        : b.fare ?? b.priceEconomy;
      if (sortBy === "price") return priceA - priceB;
      if (sortBy === "duration") return a.duration.localeCompare(b.duration);
      if (sortBy === "departure")
        return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });
  const closestOptions = allFlights.slice(0, 3);
  const handleSelectFareTier = (flight, fareTier) => {
    const flightCopy = {
      ...flight,
      cabinClass: fareTier,
    };
    dispatch(selectFlight(flightCopy));
    dispatch(setSearchParams({ cabinClass: fareTier }));
    dispatch(setBookingStep(1));
    navigate("/book");
  };
  return (
    <main className="page-container space-y-6 py-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {error && (
          <div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
        {/* Header Breadcrumbs & Search Summary */}
        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span>Flights</span>
              <ChevronRight size={12} />
              <span>TigerAirlines Network</span>
              <ChevronRight size={12} />
              <span>Search Results</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                {originParam}{" "}
                <ArrowRight size={20} className="inline text-primary" />{" "}
                {destParam}
              </h1>
              <span className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark dark:text-primary">
                {cabinParam} Class
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            Modify Search
          </button>
        </div>

        {/* ±3 Days Price Flexibility Strip */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-2 min-w-[650px] justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted pl-2 shrink-0">
              ±3 Days Flexibility:
            </span>
            {flexibleDates.map((item) => (
              <button
                key={item.offset}
                type="button"
                className={`relative flex-1 rounded-xl border px-3 py-2.5 text-center transition-colors ${item.isSelected ? "border-primary bg-primary text-on-primary shadow-sm" : "border-border bg-background text-foreground"}`}
              >
                {item.isCheapest && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-black text-[9px] uppercase px-1.5 py-0.2 rounded shadow-2xs">
                    Cheapest
                  </span>
                )}
                <p
                  className={`text-xs font-semibold ${item.isSelected ? "text-on-primary" : "text-foreground"}`}
                >
                  {item.dayName}, {item.monthDay}
                </p>
                <p
                  className={`mt-0.5 font-mono text-sm font-semibold ${item.isSelected ? "text-on-primary" : "text-primary-dark dark:text-primary"}`}
                >
                  {formatNaira(item.price)}
                </p>
              </button>
            ))}
          </div>
        </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <aside className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-24">
                <FlightFiltersPanel
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  selectedStops={selectedStops}
                  setSelectedStops={setSelectedStops}
                  selectedAirline={selectedAirline}
                  setSelectedAirline={setSelectedAirline}
                  airlineOptions={airlineOptions}
                  onReset={resetFilters}
                  idPrefix="desktop-filters"
                />
              </div>
            </aside>

            <section className="space-y-4 lg:col-span-3" aria-label="Flight search results">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <p className="text-sm font-medium text-muted" aria-live="polite">
                  {loading
                    ? "Searching available flights..."
                    : `${filteredFlights.length} ${filteredFlights.length === 1 ? "flight" : "flights"} available`}
                </p>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={filterDrawerOpen}
                    aria-controls="mobile-filter-dialog"
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
                  >
                    <Filter size={16} aria-hidden="true" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-on-primary">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  <label htmlFor="flight-sort" className="sr-only">
                    Sort flights
                  </label>
                  <select
                    id="flight-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="min-h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:flex-none"
                  >
                    <option value="price">Lowest price</option>
                    <option value="duration">Shortest duration</option>
                    <option value="departure">Earliest departure</option>
                  </select>
                </div>
              </div>

              {/* Flight Cards List */}
            {loading ? (
              <div
                className="space-y-4"
                role="status"
                aria-label="Searching available flights"
              >
                <div className="indeterminate-progress-track rounded-full" />
                <p className="text-xs text-muted">
                  Searching available flights...
                </p>
                <FlightCardSkeleton />
                <FlightCardSkeleton />
                <FlightCardSkeleton />
              </div>
            ) : filteredFlights.length === 0 ? (
              /* Fallback State for No Matches: "No direct flights found — here are the closest options" */
              <div className="space-y-6">
                    <div className="space-y-2 rounded-xl border border-warning/25 bg-warning/5 p-5 text-foreground">
                  <div className="flex items-center gap-2 text-primary font-black text-sm">
                    <AlertCircle size={18} />
                    <span>No Direct Flights Found for This Search</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    No flights match the current filters. Adjust the filters or review other flights already listed in the schedule.
                  </p>
                </div>

                <div className="space-y-4">
                  {closestOptions.map((f) => (
                    <div
                      key={f.id}
                      className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary/50 md:p-6"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {f.flightNumber}
                        </span>
                        <Badge variant="blue">Alternative Option</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-foreground">
                            {f.origin.city} ({f.origin.code})
                          </p>
                          <p className="text-xs text-muted">
                            {f.departureTime}
                          </p>
                        </div>
                        <ArrowRight size={18} className="text-muted" />
                        <div className="text-right">
                          <p className="text-lg font-black text-foreground">
                            {f.destination.city} ({f.destination.code})
                          </p>
                          <p className="text-xs text-muted">{f.arrivalTime}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xl font-semibold text-foreground">
                            {formatNaira(
                              cabinParam.toUpperCase() === "BUSINESS"
                                ? f.businessFare ?? f.priceBusiness
                                : f.fare ?? f.priceEconomy,
                            )}
                          </p>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSelectFareTier(f, cabinParam)}
                            className="mt-1"
                          >
                            Select {cabinParam}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              filteredFlights.map((flight) => {
                const isBusiness = cabinParam.toUpperCase() === "BUSINESS";
                const currentPrice = isBusiness
                  ? flight.businessFare ?? flight.priceBusiness
                  : flight.fare ?? flight.priceEconomy;
                const seatsLeft = flight.availableSeats;
                const isExpanded = expandedFlightId === flight.id;
                return (
                  <div
                    key={flight.id}
                    className="bg-surface rounded-3xl p-6 shadow-sm border border-border hover:border-primary/40 transition space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Left: Flight Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                            <Plane size={18} className="-rotate-45" />
                          </div>
                          <div>
                            <span className="font-black text-foreground text-sm">
                              {flight.airline}
                            </span>
                            <span className="text-muted text-xs ml-2 font-mono">
                              {flight.flightNumber} • {flight.aircraft}
                            </span>
                          </div>
                          {seatsLeft < 10 && (
                            <span className="rounded-full border border-danger/20 bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                              Only {seatsLeft} seats left!
                            </span>
                          )}
                        </div>

                        {/* Itinerary Times & Line */}
                        <div className="flex items-center justify-between max-w-lg">
                          <div>
                            <p className="text-xl font-black text-foreground font-mono">
                              {flight.departureTime}
                            </p>
                            <p className="text-xs font-bold text-muted">
                              {flight.origin.code}
                            </p>
                            <p className="text-[10px] text-muted">
                              {flight.origin.city}
                            </p>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <span className="text-[10px] font-semibold text-muted mb-0.5">
                              {flight.duration}
                            </span>
                            <div className="flex items-center gap-1.5 w-28 sm:w-36">
                              <div className="h-0.5 bg-surface-muted flex-1" />
                              <Plane
                                size={14}
                                className="text-primary transform rotate-90 shrink-0"
                              />
                              <div className="h-0.5 bg-surface-muted flex-1" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                              {flight.stops === 0
                                ? "Non-stop"
                                : `${flight.stops} Stop`}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-black text-foreground font-mono">
                              {flight.arrivalTime}
                            </p>
                            <p className="text-xs font-bold text-muted">
                              {flight.destination.code}
                            </p>
                            <p className="text-[10px] text-muted">
                              {flight.destination.city}
                            </p>
                          </div>
                        </div>

                        {/* Amenities Chips */}
                        <div className="flex items-center gap-4 text-muted text-[11px] pt-1">
                          <span className="flex items-center gap-1">
                            <Luggage size={13} className="text-primary" />{" "}
                            {flight.baggageIncluded}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coffee size={13} className="text-primary" />{" "}
                            {flight.mealIncluded
                              ? "Meal Included"
                              : "Snacks on Board"}
                          </span>
                          {flight.wifiAvailable && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Wifi size={13} /> High-Speed In-Flight WiFi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Quick Price & Toggle Fares */}
                      <div className="md:border-l border-border md:pl-6 flex flex-col md:items-end justify-center">
                        <span className="text-[11px] text-muted uppercase font-bold">
                          From
                        </span>
                        <div className="text-2xl md:text-3xl font-black text-foreground font-mono">
                          {formatNaira(currentPrice)}
                        </div>
                        <span className="text-[10px] text-muted mb-3">
                          published base fare per passenger
                        </span>

                        <Button
                          variant={isExpanded ? "secondary" : "primary"}
                          size="sm"
                          onClick={() =>
                            setExpandedFlightId(isExpanded ? null : flight.id)
                          }
                          className="font-bold gap-1"
                        >
                          {isExpanded ? "Hide Fares" : "Compare Fares & Select"}
                        </Button>
                      </div>
                    </div>

                    {/* Only backend-managed cabin fares are offered here. */}
                    {isExpanded && (
                      <div className="pt-6 border-t border-border space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                            Select Fare Option for {flight.flightNumber}
                          </h4>
                          <span className="text-[11px] text-muted">
                            Instant seat reservation hold applied
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {[
                            {
                              cabin: "Economy",
                              fare: flight.fare ?? flight.priceEconomy,
                            },
                            {
                              cabin: "Business",
                              fare: flight.businessFare ?? flight.priceBusiness,
                            },
                          ]
                            .filter(({ fare }) => Number(fare) > 0)
                            .map(({ cabin, fare }) => (
                              <div
                                key={cabin}
                                className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-background p-4"
                              >
                                <div>
                                  <h5 className="text-sm font-bold text-foreground">
                                    {cabin} Class
                                  </h5>
                                  <p className="mt-1 text-xs text-muted">
                                    Published fare per passenger
                                  </p>
                                  <p className="mt-3 font-mono text-xl font-black text-foreground">
                                    {formatNaira(fare)}
                                  </p>
                                </div>
                                <Button
                                  variant={
                                    cabin === "Business" ? "accent" : "primary"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleSelectFareTier(flight, cabin)
                                  }
                                  className="w-full font-bold"
                                >
                                  Choose {cabin}
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>

        {filterDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/35">
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              aria-label="Close flight filters"
              className="absolute inset-0 h-full w-full cursor-default"
            />
            <aside
              id="mobile-filter-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filter-title"
              className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    Refine your trip
                  </p>
                  <h2 id="mobile-filter-title" className="mt-1 text-xl font-semibold text-foreground">
                    Flight filters
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  aria-label="Close flight filters"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <FlightFiltersPanel
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                selectedStops={selectedStops}
                setSelectedStops={setSelectedStops}
                selectedAirline={selectedAirline}
                setSelectedAirline={setSelectedAirline}
                airlineOptions={airlineOptions}
                onReset={resetFilters}
                idPrefix="mobile-filters"
              />
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Show {filteredFlights.length} {filteredFlights.length === 1 ? "flight" : "flights"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
var stdin_default = SearchResultsPage;
export { SearchResultsPage, stdin_default as default };
