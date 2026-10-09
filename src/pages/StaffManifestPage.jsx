import { useEffect, useState } from "react";
import { ClipboardList, Search, Users } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { getApiErrorMessage } from "../services/apiClient";
import { bookingService } from "../services/bookingService";
import flightService from "../services/flightService";
import { passengerService } from "../services/passengerService";

const statusVariant = (status) => {
  if (status === "CHECKED_IN" || status === "CONFIRMED") return "success";
  if (status === "CANCELLED" || status === "EXPIRED") return "primary";
  return "warning";
};

const StaffManifestPage = () => {
  const [flightId, setFlightId] = useState("");
  const [manifestFlight, setManifestFlight] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [passengersById, setPassengersById] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengerError, setPassengerError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [flightsError, setFlightsError] = useState("");

  useEffect(() => {
    let active = true;
    flightService
      .getFlights()
      .then((response) => {
        if (!active) return;
        const records = Array.isArray(response?.data) ? response.data : [];
        setFlights(records);
        if (records.length) setFlightId(String(records[0].id));
      })
      .catch((requestError) => {
        if (active) {
          setFlightsError(
            getApiErrorMessage(requestError, "Unable to load flights."),
          );
        }
      })
      .finally(() => {
        if (active) setFlightsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLoadManifest = async (event) => {
    event.preventDefault();
    if (!flightId) return;

    setLoading(true);
    setError("");
    setPassengerError("");
    setBookings([]);
    setPassengersById({});
    setManifestFlight(flights.find((flight) => String(flight.id) === flightId));
    setLoaded(false);

    try {
      const response = await bookingService.getStaffFlightManifest(flightId);
      const records = Array.isArray(response?.data) ? response.data : [];
      setBookings(records);
      setLoaded(true);

      const passengerIds = [
        ...new Set(
          records.map((booking) => booking.passengerId).filter(Boolean),
        ),
      ];
      if (passengerIds.length) {
        try {
          const passengerResponse =
            await passengerService.getStaffManifestPassengers(passengerIds);
          const passengerRecords = Array.isArray(passengerResponse?.data)
            ? passengerResponse.data
            : [];
          setPassengersById(
            Object.fromEntries(
              passengerRecords.map((passenger) => [
                String(passenger.id),
                passenger,
              ]),
            ),
          );
        } catch (requestError) {
          setPassengerError(
            getApiErrorMessage(
              requestError,
              "Passenger names are temporarily unavailable.",
            ),
          );
        }
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to load this flight manifest."),
      );
    } finally {
      setLoading(false);
    }
  };

  const checkedInCount = bookings.filter(
    (booking) => booking.status === "CHECKED_IN",
  ).length;
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Staff operations
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Flight passenger manifest
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          View passengers booked on a flight, their assigned seats, booking
          status, and persisted staff check-in status.
        </p>
      </header>

      <form
        onSubmit={handleLoadManifest}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1 text-xs font-semibold text-muted">
          Flight
          <select
            value={flightId}
            onChange={(event) => setFlightId(event.target.value)}
            disabled={flightsLoading || flights.length === 0}
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          >
            {flightsLoading && <option value="">Loading flights…</option>}
            {!flightsLoading && flights.length === 0 && (
              <option value="">No flights available</option>
            )}
            {flights.map((flight) => (
              <option key={flight.id} value={flight.id}>
                {flight.flightNumber} · {flight.origin?.code || "—"} →{" "}
                {flight.destination?.code || "—"} · {flight.departureDate}{" "}
                {flight.departureTime}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="submit"
          isLoading={loading}
          disabled={!flightId || flightsLoading}
          className="sm:min-w-40"
        >
          <Search size={16} aria-hidden="true" />
          Load manifest
        </Button>
      </form>

      {(flightsError || error || passengerError) && (
        <div
          role="alert"
          className="space-y-1 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {flightsError && <p>{flightsError}</p>}
          {error && <p>{error}</p>}
          {passengerError && <p>{passengerError}</p>}
        </div>
      )}

      {loaded && (
        <section
          aria-labelledby="manifest-results-heading"
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 id="manifest-results-heading" className="text-sm font-bold">
                {manifestFlight?.flightNumber || `Flight ${flightId}`}
                {manifestFlight && (
                  <span className="ml-2 font-medium text-muted">
                    {manifestFlight.origin?.code} →{" "}
                    {manifestFlight.destination?.code}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {manifestFlight?.departureDate} {manifestFlight?.departureTime}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">{bookings.length} bookings</Badge>
              <Badge variant="success">{confirmedCount} awaiting check-in</Badge>
              <Badge variant="accent">{checkedInCount} checked in</Badge>
            </div>
          </div>

          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings for this flight"
              description="There are no booking records associated with this flight."
            />
          ) : (
            <div
              className="overflow-x-auto"
              role="region"
              aria-label="Flight passenger manifest"
              tabIndex={0}
            >
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-border bg-background text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-5 py-3">Passenger</th>
                    <th className="px-5 py-3">Booking reference</th>
                    <th className="px-5 py-3">Seat</th>
                    <th className="px-5 py-3">Booking status</th>
                    <th className="px-5 py-3">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => {
                    const passenger = passengersById[String(booking.passengerId)];
                    const passengerName = passenger
                      ? `${passenger.firstName} ${passenger.lastName}`.trim()
                      : `Passenger ${booking.passengerId}`;

                    return (
                      <tr key={booking.id} className="hover:bg-surface-muted/50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Users
                              size={15}
                              className="shrink-0 text-muted"
                              aria-hidden="true"
                            />
                            {passengerName}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold tracking-wider text-primary">
                          {booking.pnr}
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          {booking.seatNumber || "—"}
                          {booking.cabinClass && (
                            <span className="ml-1 text-muted">
                              · {booking.cabinClass}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={statusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {booking.status === "CHECKED_IN" ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                              <ClipboardList size={14} aria-hidden="true" />
                              Checked in
                              {booking.checkedInAt && (
                                <span className="font-normal text-muted">
                                  · {booking.checkedInAt.replace("T", " ")}
                                </span>
                              )}
                            </span>
                          ) : booking.status === "CONFIRMED" ? (
                            <span className="text-muted">Not checked in</span>
                          ) : (
                            <span className="text-muted">Not eligible</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="border-t border-border px-5 py-3 text-[11px] leading-5 text-muted">
            Passenger names are displayed for flight operations only. Personal
            contact and identity document details are not included.
          </p>
        </section>
      )}
    </div>
  );
};

export { StaffManifestPage };
export default StaffManifestPage;
