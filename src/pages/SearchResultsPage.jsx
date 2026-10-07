import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, RotateCcw } from "lucide-react";
import flightService from "../services/flightService";
import { getApiErrorMessage } from "../services/apiClient";
import { useAppDispatch } from "../app/store";
import { selectFlight, setBookingStep } from "../features/booking/bookingSlice";
import { FlightCardSkeleton } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import SearchResultsFilters from "../features/search/SearchResultsFilters";
import { FlexibleDateStrip, SearchResultsHeader } from "../features/search/SearchResultsHeader";
import FlightResultCard from "../features/search/FlightResultCard";
import AlternativeFlightCard from "../features/search/AlternativeFlightCard";

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
  const [requestAttempt, setRequestAttempt] = useState(0);

  const originParam = searchParams.get("from") || "LOS";
  const destParam = searchParams.get("to") || "ABV";
  const cabinParam = searchParams.get("class") || "Economy";
  const departDateParam = searchParams.get("depart") || "2026-10-15";
  const returnDateParam = searchParams.get("return") || "";
  const tripTypeParam = searchParams.get("type") || "roundTrip";
  const modifySearchUrl = `/?${new URLSearchParams({
    from: originParam,
    to: destParam,
    depart: departDateParam,
    "return": returnDateParam,
    type: tripTypeParam,
    "class": cabinParam,
  }).toString()}`;
  const handleModifySearch = () => navigate(modifySearchUrl);

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
          }),
        ]);

        if (!isMounted) return;

        const allData = Array.isArray(allRes?.data) ? allRes.data : [];
        const searchData = Array.isArray(searchRes?.data) ? searchRes.data : [];
        setAllFlights(allData);
        setFlights(searchData);
        setExpandedFlightId(searchData.length > 0 ? searchData[0].id : null);
      } catch (requestError) {
        if (!isMounted) return;
        setFlights([]);
        setAllFlights([]);
        setExpandedFlightId(null);
        setError(getApiErrorMessage(requestError, "Unable to load flights right now."));
      } finally {
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) setLoading(false);
          }, 300);
        }
      }
    };

    loadFlights();

    return () => {
      isMounted = false;
    };
  }, [originParam, destParam, requestAttempt]);

  const filteredFlights = flights
    .filter((flight) => {
      const price = cabinParam === "Business" ? flight.priceBusiness : flight.priceEconomy;
      if (price > maxPrice) return false;
      if (selectedStops === "direct" && flight.stops > 0) return false;
      if (selectedStops === "1stop" && flight.stops === 0) return false;
      if (selectedAirline !== "all" && flight.airline !== selectedAirline) return false;
      return true;
    })
    .sort((first, second) => {
      const firstPrice = cabinParam === "Business" ? first.priceBusiness : first.priceEconomy;
      const secondPrice = cabinParam === "Business" ? second.priceBusiness : second.priceEconomy;
      if (sortBy === "price") return firstPrice - secondPrice;
      if (sortBy === "duration") return first.duration.localeCompare(second.duration);
      if (sortBy === "departure") return first.departureTime.localeCompare(second.departureTime);
      return 0;
    });

  const airlineOptions = [...new Set(flights.map((flight) => flight.airline).filter(Boolean))].sort();
  const closestOptions = allFlights.slice(0, 3);

  const handleSelectFareTier = (flight, fareTier) => {
    const flightCopy = {
      ...flight,
      cabinClass: fareTier === "Business" ? "Business" : "Economy",
    };
    dispatch(selectFlight(flightCopy));
    dispatch(setBookingStep(1));
    navigate("/book");
  };

  const handleResetFilters = () => {
    setMaxPrice(15e5);
    setSelectedStops("all");
    setSelectedAirline("all");
  };

  return (
    <div className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <SearchResultsHeader
          origin={originParam}
          destination={destParam}
          cabinClass={cabinParam}
          departDate={departDateParam}
          onModifySearch={handleModifySearch}
        />

        <FlexibleDateStrip departDate={departDateParam} />

        <div className={`grid grid-cols-1 items-start gap-5 ${error ? "" : "lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6"}`}>
          {!error && (
            <SearchResultsFilters
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              selectedStops={selectedStops}
              onStopsChange={setSelectedStops}
              selectedAirline={selectedAirline}
              onAirlineChange={setSelectedAirline}
              airlineOptions={airlineOptions}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onResetFilters={handleResetFilters}
            />
          )}
          <section aria-label="Available flights" className="min-w-0 space-y-4">
            {!loading && !error && (
              <div aria-live="polite" className="flex flex-wrap items-end justify-between gap-2 px-1">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    {filteredFlights.length} {filteredFlights.length === 1 ? "flight" : "flights"} found
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">Compare schedules, amenities and fare options</p>
                </div>
                <p className="text-xs font-medium text-muted">Sorted by {sortBy === "departure" ? "departure time" : sortBy}</p>
              </div>
            )}

            {loading ? (
              <div role="status" aria-label="Searching available flights" className="space-y-4">
                <div className="indeterminate-progress-track rounded-full" />
                <p className="text-sm text-muted">Searching available flights…</p>
                <FlightCardSkeleton />
                <FlightCardSkeleton />
                <FlightCardSkeleton />
              </div>
            ) : error ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
                      <AlertCircle aria-hidden="true" size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground">We couldn&apos;t load flight results</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{error}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:pt-0.5">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setRequestAttempt((attempt) => attempt + 1)}
                      className="min-h-11 rounded-xl px-4 font-bold"
                    >
                      <RotateCcw aria-hidden="true" size={14} />
                      Try again
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleModifySearch}
                      className="min-h-11 rounded-xl px-4 font-bold"
                    >
                      Modify search
                    </Button>
                  </div>
                </div>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-on-secondary">
                      <AlertCircle aria-hidden="true" size={18} />
                    </span>
                    <div>
                      <h3 className="font-bold text-foreground">No flights match these filters</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        Try adjusting your filters or explore these alternative TigerAirlines options.
                      </p>
                    </div>
                  </div>
                </div>

                {closestOptions.length > 0 ? (
                  <div className="space-y-3" aria-label="Alternative flight options">
                    {closestOptions.map((flight) => (
                      <AlternativeFlightCard
                        key={flight.id}
                        flight={flight}
                        onSelect={() => handleSelectFareTier(flight, "Classic")}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                    <p className="font-semibold text-foreground">No alternative flights are available right now.</p>
                    <p className="mt-1 text-sm text-muted">Try modifying your search to explore another route.</p>
                    <Button type="button" variant="outline" onClick={handleModifySearch} className="mt-4 min-h-10 rounded-xl">
                      Modify search
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              filteredFlights.map((flight) => {
                const currentPrice = cabinParam === "Business" ? flight.priceBusiness : flight.priceEconomy;
                const seatsLeft = cabinParam === "Business" ? flight.availableSeatsBusiness : flight.availableSeatsEconomy;
                const isExpanded = expandedFlightId === flight.id;

                return (
                  <FlightResultCard
                    key={flight.id}
                    flight={flight}
                    currentPrice={currentPrice}
                    seatsLeft={seatsLeft}
                    isExpanded={isExpanded}
                    onToggleFares={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                    onSelectFareTier={handleSelectFareTier}
                  />
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
