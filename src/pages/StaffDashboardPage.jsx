import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Plane,
  TicketCheck,
  Users,
} from "lucide-react";
import flightService from "../services/flightService";
import { getApiErrorMessage } from "../services/apiClient";
import Badge from "../components/ui/Badge";

const StaffDashboardPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadFlights = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await flightService.getFlights();
        if (isCurrent) {
          setFlights(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (requestError) {
        if (isCurrent) {
          setFlights([]);
          setError(
            getApiErrorMessage(requestError, "Unable to load flight schedules."),
          );
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadFlights();
    return () => {
      isCurrent = false;
    };
  }, []);

  const scheduled = flights
    .filter((flight) => {
      if (["CANCELLED", "ARRIVED", "LANDED"].includes(flight.status)) {
        return false;
      }
      const departure = new Date(
        `${flight.departureDate || ""}T${flight.departureTime || ""}`,
      ).getTime();
      return !Number.isFinite(departure) || departure >= Date.now();
    })
    .sort((first, second) => {
      const firstDeparture = new Date(
        `${first.departureDate || ""}T${first.departureTime || ""}`,
      ).getTime();
      const secondDeparture = new Date(
        `${second.departureDate || ""}T${second.departureTime || ""}`,
      ).getTime();
      return firstDeparture - secondDeparture;
    });

  const shortcuts = [
    {
      to: "/staff/bookings",
      title: "Look up a booking",
      description: "Find a reservation using its booking reference (PNR).",
      icon: ClipboardList,
    },
    {
      to: "/staff/flights",
      title: "Check flight status",
      description: "Review current schedules and reported flight statuses.",
      icon: Plane,
    },
    {
      to: "/staff/manifest",
      title: "Passenger manifest",
      description: "View passengers, booking states, and check-in status by flight.",
      icon: Users,
    },
    {
      to: "/staff/check-in",
      title: "Staff check-in",
      description: "Record check-in for a confirmed traveler by booking reference.",
      icon: TicketCheck,
    },
  ];

  return (
    <div className="space-y-6 py-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Staff operations
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Service desk
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Look up bookings, check in confirmed travelers, and review flight
          information. Booking changes, refunds, and flight management remain
          restricted to administrators or the booking owner.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <section
        aria-label="Flight schedule summary"
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plane size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted">Scheduled flights</p>
              <p className="text-2xl font-bold">
                {loading ? "…" : scheduled.length}
              </p>
            </div>
          </div>
          <Link
            to="/staff/flights"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View flight status <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <CalendarClock size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted">Flight data</p>
              <p className="text-sm font-semibold">
                {loading ? "Loading schedule…" : "Live from flight service"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            Status and departure details reflect the data currently provided by
            the flight service.
          </p>
        </div>
      </section>

      <section aria-labelledby="staff-shortcuts-heading">
        <h2 id="staff-shortcuts-heading" className="mb-3 text-sm font-bold">
          Service desk tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ to, title, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-primary">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open tool <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="staff-flight-list-heading"
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id="staff-flight-list-heading" className="text-sm font-bold">
              Upcoming flight schedule
            </h2>
            <p className="mt-1 text-xs text-muted">
              Recent entries supplied by the flight service.
            </p>
          </div>
          <Badge variant="blue">{loading ? "Loading" : `${scheduled.length} flights`}</Badge>
        </div>
        {flights.length > 0 ? (
          <ul className="divide-y divide-border">
            {flights.slice(0, 6).map((flight) => (
              <li
                key={flight.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-xs font-bold">
                    {flight.flightNumber} · {flight.origin?.code} →{" "}
                    {flight.destination?.code}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {flight.departureDate || "Date unavailable"}{" "}
                    {flight.departureTime || ""}
                  </p>
                </div>
                <Badge variant={flight.status === "DELAYED" ? "warning" : "info"}>
                  {flight.status || "SCHEDULED"}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          !loading && (
            <p className="px-5 py-6 text-sm text-muted">
              No flight schedule entries are available.
            </p>
          )
        )}
      </section>
    </div>
  );
};

export { StaffDashboardPage };
export default StaffDashboardPage;
