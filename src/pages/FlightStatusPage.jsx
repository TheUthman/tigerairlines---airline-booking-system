import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plane,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import flightService from "../services/flightService";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
const FlightStatusPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState("number");
  const [flightNumberQuery, setFlightNumberQuery] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [dateQuery, setDateQuery] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  useEffect(() => {
    flightService.getFlights().then((res) => {
      setFlights(res.data);
      if (res.data.length > 0) {
        setSelectedFlight(res.data[0]);
      }
      setLoading(false);
    });
  }, []);
  const filteredFlights = flights.filter((f) => {
    if (searchMode === "number") {
      if (!flightNumberQuery.trim()) return true;
      return f.flightNumber.toLowerCase().includes(flightNumberQuery.toLowerCase().trim());
    } else {
      const matchOrigin = !originQuery || f.origin.code === originQuery || f.origin.city.toLowerCase().includes(originQuery.toLowerCase());
      const matchDest = !destinationQuery || f.destination.code === destinationQuery || f.destination.city.toLowerCase().includes(destinationQuery.toLowerCase());
      return matchOrigin && matchDest;
    }
  });
  const getStatusBadge = (status) => {
    switch (status) {
      case "BOARDING":
        return <Badge variant="accent">Boarding Now</Badge>;
      case "DEPARTED":
        return <Badge variant="blue">Departed</Badge>;
      case "DELAYED":
        return <Badge variant="warning">Delayed 35m</Badge>;
      case "CANCELLED":
        return <Badge variant="primary">Cancelled</Badge>;
      default:
        return <Badge variant="success">On Schedule</Badge>;
    }
  };
  const getTimelineSteps = (status) => {
    const isCancelled = status === "CANCELLED";
    const isDelayed = status === "DELAYED";
    let currentStepIndex = 0;
    if (status === "SCHEDULED") currentStepIndex = 0;
    else if (status === "BOARDING") currentStepIndex = 1;
    else if (status === "DEPARTED") currentStepIndex = 2;
    else if (status === "DELAYED") currentStepIndex = 1;
    else if (status === "CANCELLED") currentStepIndex = 0;
    return [
      { name: "Scheduled", time: selectedFlight?.departureTime || "08:30", completed: currentStepIndex >= 0 },
      { name: "Boarding", time: "Gate 2 \u2022 Row 1-15", completed: currentStepIndex >= 1 },
      { name: "Departed", time: selectedFlight?.departureTime || "08:35", completed: currentStepIndex >= 2 },
      { name: "In Air", time: "Cruising FL320", completed: currentStepIndex >= 3 },
      { name: "Landed", time: selectedFlight?.arrivalTime || "11:45", completed: currentStepIndex >= 4 }
    ];
  };
  return <div className="min-h-screen bg-background py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {
    /* Header */
  }
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              Live Flight Operations
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mt-2">
              Flight Status & Real-Time Tracker
            </h1>
            <p className="text-xs text-muted mt-1">
              Live airspace tracking for TigerAirlines arrivals and departures at Lagos (LOS).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted bg-surface border border-border px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Lagos Weather: Partly Cloudy • Visibility 8km • QNH 1012
          </div>
        </div>

        {
    /* Search Panel Card */
  }
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border space-y-5">
          {
    /* Search Mode Tabs */
  }
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <button
    type="button"
    onClick={() => setSearchMode("number")}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${searchMode === "number" ? "bg-primary text-white shadow-xs" : "bg-surface-muted text-muted hover:bg-surface-muted"}`}
  >
              Search by Flight Number
            </button>
            <button
    type="button"
    onClick={() => setSearchMode("route")}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${searchMode === "route" ? "bg-primary text-white shadow-xs" : "bg-surface-muted text-muted hover:bg-surface-muted"}`}
  >
              Search by Route & Date
            </button>
          </div>

          {
    /* Form Controls */
  }
          {searchMode === "number" ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Flight Number
                </label>
                <div className="relative">
                  <input
    type="text"
    placeholder="e.g. TG-101, TG-204, TG-301..."
    value={flightNumberQuery}
    onChange={(e) => setFlightNumberQuery(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm uppercase font-mono font-bold focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
  />
                  <Search size={16} className="absolute left-3.5 top-3 text-muted" />
                </div>
              </div>
              <div>
                <Button
    type="button"
    variant="primary"
    onClick={() => {
      const match = flights.find(
        (f) => f.flightNumber.toLowerCase().includes(flightNumberQuery.toLowerCase().trim())
      );
      if (match) setSelectedFlight(match);
    }}
    className="w-full h-[42px] font-bold gap-2"
  >
                  <Search size={15} /> Track Flight
                </Button>
              </div>
            </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Origin Airport
                </label>
                <select
    value={originQuery}
    onChange={(e) => setOriginQuery(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
  >
                  <option value="">All Origins</option>
                  <option value="LOS">Lagos (LOS)</option>
                  <option value="ABV">Abuja (ABV)</option>
                  <option value="PHC">Port Harcourt (PHC)</option>
                  <option value="KAN">Kano (KAN)</option>
                  <option value="DXB">Dubai (DXB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Destination Airport
                </label>
                <select
    value={destinationQuery}
    onChange={(e) => setDestinationQuery(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
  >
                  <option value="">All Destinations</option>
                  <option value="ABV">Abuja (ABV)</option>
                  <option value="LOS">Lagos (LOS)</option>
                  <option value="PHC">Port Harcourt (PHC)</option>
                  <option value="DXB">Dubai (DXB)</option>
                  <option value="LHR">London (LHR)</option>
                  <option value="JNB">Johannesburg (JNB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Date
                </label>
                <input
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
    className="w-full h-[38px] font-bold gap-2 text-xs"
  >
                  <Search size={14} /> Filter Routes
                </Button>
              </div>
            </div>}

          {
    /* Quick flight selection badges */
  }
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-muted">Quick Flights:</span>
            {flights.slice(0, 5).map((f) => <button
    key={f.id}
    type="button"
    onClick={() => {
      setSelectedFlight(f);
      setFlightNumberQuery(f.flightNumber);
    }}
    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition ${selectedFlight?.id === f.id ? "bg-primary text-white shadow-xs" : "bg-surface-muted hover:bg-surface-muted text-foreground"}`}
  >
                {f.flightNumber} ({f.origin.code}→{f.destination.code})
              </button>)}
          </div>
        </div>

        {
    /* Selected Flight Live Status Card with Horizontal Stepper */
  }
        {selectedFlight && <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-md border border-border space-y-6">
            {
    /* Delay / Cancellation Alert Banner with Rebooking CTA */
  }
            {selectedFlight.status === "DELAYED" && <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-amber-950">
                      Flight {selectedFlight.flightNumber} is Delayed by 35 Minutes
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Departure revised due to ATC slot congestion and ground handling delay.
                    </p>
                  </div>
                </div>
                <Link to={`/search?from=${selectedFlight.origin.code}&to=${selectedFlight.destination.code}`}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap font-bold bg-surface text-amber-900 border-amber-400 hover:bg-amber-100">
                    Find Alternative Flights
                  </Button>
                </Link>
              </div>}

            {selectedFlight.status === "CANCELLED" && <div className="p-4 bg-primary/10 border border-red-300 rounded-2xl text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-primary">
                      Flight {selectedFlight.flightNumber} Has Been Cancelled
                    </p>
                    <p className="text-xs text-red-800 mt-0.5">
                      Cancelled due to operational constraints at Lagos (LOS). Passengers are eligible for free rebooking.
                    </p>
                  </div>
                </div>
                <Link to={`/search?from=${selectedFlight.origin.code}&to=${selectedFlight.destination.code}`}>
                  <Button variant="danger" size="sm" className="whitespace-nowrap font-bold shadow-xs">
                    Rebook Flight Now
                  </Button>
                </Link>
              </div>}

            {
    /* Flight Header */
  }
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-black shadow-md">
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
                    Aircraft: <strong className="text-foreground">{selectedFlight.aircraft}</strong> • Non-stop ({selectedFlight.duration})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted bg-background px-4 py-3 rounded-2xl border border-border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Terminal</span>
                  <span className="font-bold text-foreground text-sm">T1 International</span>
                </div>
                <div className="h-6 w-px bg-surface-muted" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Gate</span>
                  <span className="font-bold text-primary text-sm font-mono">Gate 02</span>
                </div>
                <div className="h-6 w-px bg-surface-muted" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Baggage</span>
                  <span className="font-bold text-foreground text-sm font-mono">Belt 03</span>
                </div>
              </div>
            </div>

            {
    /* Route Points & Times */
  }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-xs font-bold text-muted uppercase">Departure</p>
                <p className="text-3xl font-black text-foreground mt-1">{selectedFlight.departureTime}</p>
                <p className="text-sm font-bold text-foreground">{selectedFlight.origin.code} - {selectedFlight.origin.name}</p>
                <p className="text-xs text-muted">{selectedFlight.origin.city}, {selectedFlight.origin.country}</p>
              </div>

              <div className="flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-0.5 rounded-full">
                  {selectedFlight.duration} Duration
                </span>
                <div className="w-full flex items-center gap-2 text-muted">
                  <div className="h-0.5 bg-surface-muted flex-1" />
                  <Plane size={18} className="text-primary transform rotate-90" />
                  <div className="h-0.5 bg-surface-muted flex-1" />
                </div>
                <span className="text-[11px] text-muted">TigerAirlines Royal Fleet</span>
              </div>

              <div className="md:text-right">
                <p className="text-xs font-bold text-muted uppercase">Estimated Arrival</p>
                <p className="text-3xl font-black text-foreground mt-1">{selectedFlight.arrivalTime}</p>
                <p className="text-sm font-bold text-foreground">{selectedFlight.destination.code} - {selectedFlight.destination.name}</p>
                <p className="text-xs text-muted">{selectedFlight.destination.city}, {selectedFlight.destination.country}</p>
              </div>
            </div>

            {
    /* Horizontal Timeline Stepper */
  }
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Flight Milestone Progress
              </h3>

              <div className="relative">
                {
    /* Stepper horizontal line */
  }
                <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-surface-muted rounded-full z-0" />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {getTimelineSteps(selectedFlight.status).map((step, idx) => <div
    key={step.name}
    className={`flex sm:flex-col items-center gap-3 sm:gap-2 text-center p-3 rounded-2xl transition ${step.completed ? "bg-primary/10/60 sm:bg-transparent text-primary" : "bg-background/60 sm:bg-transparent text-muted"}`}
  >
                      <div
    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all duration-200 ${step.completed ? "bg-primary text-white ring-4 ring-red-100" : "bg-surface-muted text-muted border border-border"}`}
  >
                        {step.completed ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <div>
                        <p className="font-bold text-xs text-foreground">{step.name}</p>
                        <p className="text-[11px] text-muted mt-0.5">{step.time}</p>
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
          </div>}

        {
    /* Schedule Table Overview */
  }
        <div className="bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-black text-foreground">
              Today's Scheduled Flights ({filteredFlights.length})
            </h2>
            <span className="text-xs text-muted font-medium">Click any row to track timeline</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                {loading ? <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      Loading schedule database...
                    </td>
                  </tr> : filteredFlights.length === 0 ? <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <EmptyState
    title="No Flights Found"
    description="No scheduled operations match your flight number or route filters today."
    actionLabel="Reset Search"
    onAction={() => {
      setFlightNumberQuery("");
      setOriginQuery("");
      setDestinationQuery("");
    }}
  />
                    </td>
                  </tr> : filteredFlights.map((f) => <tr
    key={f.id}
    onClick={() => setSelectedFlight(f)}
    className={`hover:bg-surface-muted/80 transition cursor-pointer ${selectedFlight?.id === f.id ? "bg-primary/10/40" : ""}`}
  >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        {f.flightNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground">{f.origin.code}</span>
                        <ArrowRight size={12} className="inline mx-1.5 text-muted" />
                        <span className="font-bold text-foreground">{f.destination.code}</span>
                        <span className="text-[11px] text-muted block">
                          {f.origin.city} → {f.destination.city}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {f.departureTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted">
                        {f.status === "DELAYED" ? "09:05" : f.departureTime}
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium">
                        {f.aircraft}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(f.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-primary font-bold text-xs inline-flex items-center gap-1 hover:underline">
                          Track <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = FlightStatusPage;
export {
  FlightStatusPage,
  stdin_default as default
};
