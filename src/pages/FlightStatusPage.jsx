import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plane,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import flightService from "../services/flightService";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
const FlightStatusPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState("number");
  const [flightNumberQuery, setFlightNumberQuery] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);
  useEffect(() => {
    const loadFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await flightService.getFlights();
        const flightData = Array.isArray(res?.data) ? res.data : [];
        setFlights(flightData);
        if (flightData.length > 0) {
          setSelectedFlight(flightData[0]);
        } else {
          setSelectedFlight(null);
        }
      } catch (err) {
        setFlights([]);
        setSelectedFlight(null);
        setError(
          err?.message || "Unable to load live flight status right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, []);
  const filteredFlights = flights.filter((f) => {
    if (searchMode === "number") {
      if (!flightNumberQuery.trim()) return true;
      return f.flightNumber
        .toLowerCase()
        .includes(flightNumberQuery.toLowerCase().trim());
    } else {
      const matchOrigin =
        !originQuery ||
        f.origin?.code === originQuery ||
        f.origin?.city?.toLowerCase().includes(originQuery.toLowerCase());
      const matchDest =
        !destinationQuery ||
        f.destination?.code === destinationQuery ||
        f.destination?.city?.toLowerCase().includes(destinationQuery.toLowerCase());
      const matchDate =
        !dateQuery || String(f.departureDate || "").slice(0, 10) === dateQuery;
      return matchOrigin && matchDest && matchDate;
    }
  });
  const getStatusBadge = (status) => {
    switch (status) {
      case "BOARDING":
        return <Badge variant="primary">Boarding</Badge>;
      case "DEPARTED":
      case "IN_AIR":
      case "LANDED":
      case "ARRIVED":
        return <Badge variant="info">{status === "DEPARTED" || status === "IN_AIR" ? "Departed" : "Arrived"}</Badge>;
      case "DELAYED":
        return <Badge variant="warning">Delayed</Badge>;
      case "CANCELLED":
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };
  const getTimelineSteps = (status, flight) => {
    const currentStepIndex = {
      SCHEDULED: 0,
      DELAYED: 0,
      BOARDING: 1,
      DEPARTED: 2,
      IN_AIR: 3,
      LANDED: 4,
      ARRIVED: 4,
      CANCELLED: 0,
    }[status] ?? 0;
    return [
      { name: "Scheduled", time: flight.departureTime || "No update", completed: currentStepIndex >= 0 },
      { name: "Boarding",         time: flight.boardingTime || (flight.gate ? `Gate ${flight.gate}` : "No update"), completed: currentStepIndex >= 1 },
      { name: "Departed", time: flight.actualDepartureTime || "No update", completed: currentStepIndex >= 2 },
      { name: "In air", time: flight.cruisingAltitude ? `Flight level ${flight.cruisingAltitude}` : "No update", completed: currentStepIndex >= 3 },
      { name: "Landed", time: flight.actualArrivalTime || "No update", completed: currentStepIndex >= 4 },
    ];
  };
  const airportOptions = [
    ...new Map(
      flights
        .flatMap((flight) => [flight.origin, flight.destination])
        .filter((airport) => airport?.code)
        .map((airport) => [airport.code, airport]),
    ).values(),
  ].sort((first, second) => String(first.city || "").localeCompare(String(second.city || "")));
  return (
    <div className="bg-background py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              Flight Operations
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mt-2">
              Flight status
            </h1>
            <p className="text-xs text-muted mt-1">
              Search current schedules and the status information returned for each flight.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted">
            <span className="font-mono text-foreground">{filteredFlights.length}</span>
            <span>matching flights</span>
          </div>
        </div>

        {/* Search Panel Card */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border space-y-5">
          {/* Search Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <button
              type="button"
              onClick={() => setSearchMode("number")}
              className={`min-h-11 rounded-xl px-4 py-2 text-xs font-bold transition ${searchMode === "number" ? "bg-primary text-on-primary shadow-xs" : "bg-surface-muted text-muted hover:bg-surface-muted"}`}
            >
              Search by Flight Number
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("route")}
              className={`min-h-11 rounded-xl px-4 py-2 text-xs font-bold transition ${searchMode === "route" ? "bg-primary text-on-primary shadow-xs" : "bg-surface-muted text-muted hover:bg-surface-muted"}`}
            >
              Search by Route & Date
            </button>
          </div>

          {/* Form Controls */}
          {searchMode === "number" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor="flight-status-number" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Flight Number
                </label>
                <div className="relative">
                  <input
                    id="flight-status-number"
                    type="search"
                    placeholder="Enter a flight number"
                    value={flightNumberQuery}
                    onChange={(e) => setFlightNumberQuery(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm uppercase font-mono font-bold focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <Search
                    size={16}
                    className="absolute left-3.5 top-3 text-muted"
                  />
                </div>
              </div>
              <div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const match = flights.find((f) =>
                      f.flightNumber
                        .toLowerCase()
                        .includes(flightNumberQuery.toLowerCase().trim()),
                    );
                    if (match) setSelectedFlight(match);
                  }}
                  className="w-full h-[42px] font-bold gap-2"
                >
                  <Search size={15} /> Track Flight
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label htmlFor="flight-status-origin" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Origin Airport
                </label>
                <select
                  id="flight-status-origin"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">All origins</option>
                  {airportOptions.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city ? `${airport.city} (${airport.code})` : airport.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="flight-status-destination" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Destination Airport
                </label>
                <select
                  id="flight-status-destination"
                  value={destinationQuery}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">All destinations</option>
                  {airportOptions.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city ? `${airport.city} (${airport.code})` : airport.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="flight-status-date" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Date
                </label>
                <input
                  id="flight-status-date"
                  type="date"
                  value={dateQuery}
                  onChange={(e) => setDateQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setSelectedFlight(filteredFlights[0] || null)}
                  className="w-full min-h-11 font-bold gap-2 text-xs"
                >
                  <Search size={14} /> Filter Routes
                </Button>
              </div>
            </div>
          )}

          {/* Quick flight selection badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-muted">Quick Flights:</span>
            {flights.slice(0, 5).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedFlight(f);
                  setFlightNumberQuery(f.flightNumber);
                }}
                className={`min-h-11 rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition ${selectedFlight?.id === f.id ? "bg-primary text-on-primary shadow-xs" : "bg-surface-muted text-foreground hover:bg-surface-muted"}`}
              >
                {f.flightNumber} ({f.origin.code}→{f.destination.code})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Flight Live Status Card with Horizontal Stepper */}
        {selectedFlight && (
          <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-md border border-border space-y-6">
            {/* Delay / Cancellation Alert Banner with Rebooking CTA */}
            {selectedFlight.status === "DELAYED" && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-sm text-amber-950">
                      Flight {selectedFlight.flightNumber} is delayed
                      {selectedFlight.delayMinutes ? ` by ${selectedFlight.delayMinutes} minutes` : ""}
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {selectedFlight.delayReason || "Additional delay details are not available."}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/search?from=${selectedFlight.origin.code}&to=${selectedFlight.destination.code}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap font-bold bg-surface text-amber-900 border-amber-400 hover:bg-amber-100"
                  >
                    Find Alternative Flights
                  </Button>
                </Link>
              </div>
            )}

            {selectedFlight.status === "CANCELLED" && (
              <div className="p-4 bg-primary/10 border border-red-300 rounded-2xl text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-sm text-primary">
                      Flight {selectedFlight.flightNumber} Has Been Cancelled
                    </p>
                    <p className="text-xs text-red-800 mt-0.5">
                      {selectedFlight.cancellationReason || "No further cancellation details are available."}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/search?from=${selectedFlight.origin.code}&to=${selectedFlight.destination.code}`}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    className="whitespace-nowrap font-bold shadow-xs"
                  >
                    Rebook Flight Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Flight Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
                  <Plane size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-foreground">
                      {selectedFlight.flightNumber}
                    </span>
                    {getStatusBadge(selectedFlight.status)}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Aircraft:{" "}
                    <strong className="text-foreground">
                      {selectedFlight.aircraft || "Not provided"}
                    </strong>{" "}
                    • {selectedFlight.stops === 0 ? "Non-stop" : selectedFlight.stops != null ? `${selectedFlight.stops} stops` : "Route details unavailable"}{selectedFlight.duration ? ` · ${selectedFlight.duration}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted bg-background px-4 py-3 rounded-2xl border border-border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">
                    Terminal
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {selectedFlight.terminal || "Not provided"}
                  </span>
                </div>
                <div className="h-6 w-px bg-surface-muted" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">
                    Gate
                  </span>
                  <span className="font-bold text-primary text-sm font-mono">
                    {selectedFlight.gate || "Not provided"}
                  </span>
                </div>
                <div className="h-6 w-px bg-surface-muted" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">
                    Baggage
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {selectedFlight.baggageBelt || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Points & Times */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-xs font-bold text-muted uppercase">
                  Departure
                </p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {selectedFlight.departureTime || "—"}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {selectedFlight.origin.code} - {selectedFlight.origin.name}
                </p>
                <p className="text-xs text-muted">
                  {selectedFlight.origin.city}, {selectedFlight.origin.country}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-0.5 rounded-full">
                  {selectedFlight.duration} Duration
                </span>
                <div className="w-full flex items-center gap-2 text-muted">
                  <div className="h-0.5 bg-surface-muted flex-1" />
                  <Plane
                    size={18}
                    className="text-primary transform rotate-90"
                  />
                  <div className="h-0.5 bg-surface-muted flex-1" />
                </div>
                <span className="text-[11px] text-muted">
                  TigerAirlines schedule
                </span>
              </div>

              <div className="md:text-right">
                <p className="text-xs font-bold text-muted uppercase">
                  Estimated Arrival
                </p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {selectedFlight.estimatedArrivalTime || selectedFlight.arrivalTime || "—"}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {selectedFlight.destination.code} -{" "}
                  {selectedFlight.destination.name}
                </p>
                <p className="text-xs text-muted">
                  {selectedFlight.destination.city},{" "}
                  {selectedFlight.destination.country}
                </p>
              </div>
            </div>

            {/* Horizontal Timeline Stepper */}
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Flight Milestone Progress
              </h3>

              <div className="relative">
                {/* Stepper horizontal line */}
                <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-surface-muted rounded-full z-0" />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {getTimelineSteps(selectedFlight.status, selectedFlight).map((step, idx) => (
                    <div
                      key={step.name}
                      className={`flex items-center gap-3 rounded-xl p-3 text-center transition sm:flex-col sm:gap-2 sm:rounded-none sm:bg-transparent sm:p-2 ${step.completed ? "bg-primary/5 text-primary" : "bg-background text-muted"}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all duration-200 ${step.completed ? "bg-primary text-on-primary ring-4 ring-primary/10" : "bg-surface-muted text-muted border border-border"}`}
                      >
                        {step.completed ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <div>
                        <p className="font-bold text-xs text-foreground">
                          {step.name}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          {step.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Table Overview */}
        <div className="bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-black text-foreground">
              Scheduled flights ({filteredFlights.length})
            </h2>
            <span className="text-xs text-muted font-medium">
              Select a flight to open its status timeline
            </span>
          </div>

              <div className="overflow-x-auto" role="region" aria-label="Scheduled flight results" tabIndex={0}>
            <table className="min-w-[760px] w-full text-left text-xs">
              <thead className="bg-background text-muted uppercase tracking-wider font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Estimated</th>
                  <th className="py-3 px-4">Aircraft</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      Loading schedule database...
                    </td>
                  </tr>
                ) : filteredFlights.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <EmptyState
                        title="No Flights Found"
                        description=                "No scheduled operations match these flight, route, or date filters."
                        actionLabel="Reset Search"
                        onAction={() => {
                          setFlightNumberQuery("");
                          setOriginQuery("");
                            setDestinationQuery("");
                            setDateQuery("");
                          }}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredFlights.map((f) => (
                    <tr
                      key={f.id}
                      className={`${selectedFlight?.id === f.id ? "bg-primary/5" : "hover:bg-surface-muted/80"} transition`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        {f.flightNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground">
                          {f.origin.code}
                        </span>
                        <ArrowRight
                          size={12}
                          className="inline mx-1.5 text-muted"
                        />
                        <span className="font-bold text-foreground">
                          {f.destination.code}
                        </span>
                        <span className="text-[11px] text-muted block">
                          {f.origin.city} → {f.destination.city}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {f.departureTime || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted">
                        {f.estimatedDepartureTime || (f.status === "DELAYED" ? "Awaiting update" : f.departureTime || "—")}
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium">
                        {f.aircraft}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(f.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedFlight(f)}
                          aria-label={`Track flight ${f.flightNumber}`}
                          className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-bold text-primary hover:bg-primary/10 focus-visible:outline-offset-2"
                        >
                          Track <ChevronRight size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
var stdin_default = FlightStatusPage;
export { FlightStatusPage, stdin_default as default };
