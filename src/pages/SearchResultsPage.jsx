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
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import flightService from "../services/flightService";
import { useAppDispatch } from "../app/store";
import { selectFlight, setBookingStep } from "../features/booking/bookingSlice";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { FlightCardSkeleton } from "../components/ui/Skeleton";
import { formatNaira } from "../utils/formatNaira";
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
  }, [originParam, destParam]);
  const filteredFlights = flights
    .filter((flight) => {
      const price =
        cabinParam === "Business" ? flight.priceBusiness : flight.priceEconomy;
      if (price > maxPrice) return false;
      if (selectedStops === "direct" && flight.stops > 0) return false;
      if (selectedStops === "1stop" && flight.stops === 0) return false;
      if (selectedAirline !== "all" && flight.airline !== selectedAirline)
        return false;
      return true;
    })
    .sort((a, b) => {
      const priceA =
        cabinParam === "Business" ? a.priceBusiness : a.priceEconomy;
      const priceB =
        cabinParam === "Business" ? b.priceBusiness : b.priceEconomy;
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
      cabinClass: fareTier === "Business" ? "Business" : "Economy",
    };
    dispatch(selectFlight(flightCopy));
    dispatch(setBookingStep(1));
    navigate("/book");
  };
  return (
    <div className="bg-background py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
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
        <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[650px] justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted pl-2 shrink-0">
              ±3 Days Flexibility:
            </span>
            {flexibleDates.map((item) => (
              <button
                key={item.offset}
                type="button"
                className={`flex-1 py-2 px-3 rounded-xl border text-center transition cursor-pointer relative ${item.isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-background hover:bg-primary/10 text-foreground border-border"}`}
              >
                {item.isCheapest && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-black text-[9px] uppercase px-1.5 py-0.2 rounded shadow-2xs">
                    Cheapest
                  </span>
                )}
                <p
                  className={`text-[11px] font-bold ${item.isSelected ? "text-white" : "text-foreground"}`}
                >
                  {item.dayName}, {item.monthDay}
                </p>
                <p
                  className={`text-xs font-mono font-black mt-0.5 ${item.isSelected ? "text-white" : "text-primary"}`}
                >
                  {formatNaira(item.price)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border space-y-6 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Filter size={16} className="text-primary" /> Filter Flights
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMaxPrice(15e5);
                    setSelectedStops("all");
                    setSelectedAirline("all");
                  }}
                  className="text-[11px] text-muted hover:text-primary font-semibold"
                >
                  Reset All
                </button>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                  <span>Max Ticket Price</span>
                  <span className="text-primary font-mono">
                    {formatNaira(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="1500000"
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Stops Filter */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Stops
                </label>
                <div className="space-y-2 text-xs text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stops"
                      checked={selectedStops === "all"}
                      onChange={() => setSelectedStops("all")}
                      className="accent-primary"
                    />
                    <span>All Flights</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stops"
                      checked={selectedStops === "direct"}
                      onChange={() => setSelectedStops("direct")}
                      className="accent-primary"
                    />
                    <span>Non-stop only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stops"
                      checked={selectedStops === "1stop"}
                      onChange={() => setSelectedStops("1stop")}
                      className="accent-primary"
                    />
                    <span>1 Stop</span>
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Sort Results By
                </label>
                <div className="grid grid-cols-3 gap-1 bg-surface-muted p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSortBy("price")}
                    className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${sortBy === "price" ? "bg-surface text-primary shadow-xs" : "text-muted"}`}
                  >
                    Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("duration")}
                    className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${sortBy === "duration" ? "bg-surface text-primary shadow-xs" : "text-muted"}`}
                  >
                    Duration
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("departure")}
                    className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${sortBy === "departure" ? "bg-surface text-primary shadow-xs" : "text-muted"}`}
                  >
                    Depart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Cards List */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="space-y-4">
                <FlightCardSkeleton />
                <FlightCardSkeleton />
                <FlightCardSkeleton />
              </div>
            ) : filteredFlights.length === 0 ? (
              /* Fallback State for No Matches: "No direct flights found — here are the closest options" */
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-black text-sm">
                    <AlertCircle size={18} />
                    <span>No Direct Flights Found for This Search</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    There are no scheduled direct flights matching your exact
                    filters on this date. Here are the closest TigerAirlines
                    flight options available from Lagos (LOS):
                  </p>
                </div>

                <div className="space-y-4">
                  {closestOptions.map((f) => (
                    <div
                      key={f.id}
                      className="bg-surface rounded-3xl p-6 shadow-sm border border-border hover:border-primary transition space-y-4"
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
                          <p className="text-xl font-black text-foreground font-mono">
                            ${f.priceEconomy}
                          </p>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSelectFareTier(f, "Classic")}
                            className="mt-1"
                          >
                            Select Flight
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              filteredFlights.map((flight) => {
                const currentPrice =
                  cabinParam === "Business"
                    ? flight.priceBusiness
                    : flight.priceEconomy;
                const seatsLeft =
                  cabinParam === "Business"
                    ? flight.availableSeatsBusiness
                    : flight.availableSeatsEconomy;
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
                            <span className="text-[10px] font-bold text-red-600 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">
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
                          per passenger, taxes incl.
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

                    {/* Fare Tier Comparison Cards (Economy Classic, Economy Flex, Business Class) */}
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Tier 1: Economy Classic */}
                          <div className="bg-background rounded-2xl p-4 border border-border flex flex-col justify-between space-y-4 hover:border-border transition">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-foreground text-sm">
                                    Economy Classic
                                  </h5>
                                  <span className="text-[10px] text-muted">
                                    Standard TigerAirlines Travel
                                  </span>
                                </div>
                                <span className="font-mono font-black text-base text-foreground">
                                  {formatNaira(flight.priceEconomy)}
                                </span>
                              </div>
                              <ul className="text-[11px] text-muted space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />{" "}
                                  20 kg Checked Baggage
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />{" "}
                                  Standard In-Flight Meal
                                </li>
                                <li className="flex items-center gap-1.5 text-muted">
                                  ✕ Seat selection for small fee
                                </li>
                                <li className="flex items-center gap-1.5 text-muted">
                                  ✕ ₦15,000 cancellation charge
                                </li>
                              </ul>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSelectFareTier(flight, "Classic")
                              }
                              className="w-full font-bold"
                            >
                              Choose Classic ({formatNaira(flight.priceEconomy)}
                              )
                            </Button>
                          </div>

                          {/* Tier 2: Economy Flex */}
                          <div className="bg-primary/10/40 rounded-2xl p-4 border-2 border-primary/60 flex flex-col justify-between space-y-4 relative shadow-xs">
                            <div className="absolute -top-2.5 right-4 bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              Most Popular
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-primary text-sm">
                                    Economy Flex
                                  </h5>
                                  <span className="text-[10px] text-muted">
                                    Flexible Travel with Perks
                                  </span>
                                </div>
                                <span className="font-mono font-black text-base text-primary">
                                  {formatNaira(flight.priceEconomy + 2e4)}
                                </span>
                              </div>
                              <ul className="text-[11px] text-foreground space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />{" "}
                                  30 kg Checked Baggage (+10kg)
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />{" "}
                                  Free Standard Seat Selection
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />{" "}
                                  Priority Check-in Line
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />{" "}
                                  Free 1-time date change
                                </li>
                              </ul>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                handleSelectFareTier(flight, "Flex")
                              }
                              className="w-full font-bold shadow-xs"
                            >
                              Choose Flex (
                              {formatNaira(flight.priceEconomy + 2e4)})
                            </Button>
                          </div>

                          {/* Tier 3: Royal Business Class */}
                          <div className="bg-background text-foreground rounded-2xl p-4 border border-border flex flex-col justify-between space-y-4 shadow-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-secondary text-sm flex items-center gap-1">
                                    <Sparkles size={13} /> Royal Business
                                  </h5>
                                  <span className="text-[10px] text-muted">
                                    Ultimate Luxury & Lounge
                                  </span>
                                </div>
                                <span className="font-mono font-black text-base text-foreground">
                                  {formatNaira(flight.priceBusiness)}
                                </span>
                              </div>
                              <ul className="text-[11px] text-muted space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-400"
                                  />{" "}
                                  40 kg Baggage + 2 Cabin Bags
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-400"
                                  />{" "}
                                  Lagos & Abuja Executive Lounge Access
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-400"
                                  />{" "}
                                  Priority Boarding & Baggage
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Check
                                    size={13}
                                    className="text-emerald-400"
                                  />{" "}
                                  Lie-flat Seat & Gourmet Nigerian Dining
                                </li>
                              </ul>
                            </div>
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() =>
                                handleSelectFareTier(flight, "Business")
                              }
                              className="w-full font-bold text-on-secondary"
                            >
                              Choose Business (
                              {formatNaira(flight.priceBusiness)})
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
var stdin_default = SearchResultsPage;
export { SearchResultsPage, stdin_default as default };
