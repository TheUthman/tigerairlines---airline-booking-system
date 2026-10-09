import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { bookingService } from "../services/bookingService";
import flightService from "../services/flightService";
import { getApiErrorMessage } from "../services/apiClient";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";

const StaffBookingLookupPage = () => {
  const toast = useToast();
  const [pnr, setPnr] = useState("");
  const [booking, setBooking] = useState(null);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState("");
  const [flightError, setFlightError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();
    const cleanPnr = pnr.trim().toUpperCase();
    if (!cleanPnr) return;

    setLoading(true);
    setError("");
    setFlightError("");
    setBooking(null);
    setFlight(null);

    try {
      const result = await bookingService.getStaffBookingByPnr(cleanPnr);
      const bookingResult = result?.data ?? result;
      if (!bookingResult?.pnr) {
        setError("No booking was found for that reference.");
        return;
      }
      setBooking(bookingResult);

      try {
        const flightResult = await flightService.getFlightById(bookingResult.flightId);
        setFlight(flightResult?.data || null);
        if (!flightResult?.data) {
          setFlightError("Flight details are not available right now.");
        }
      } catch (requestError) {
        setFlightError(
          getApiErrorMessage(requestError, "Unable to load flight details."),
        );
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to find that booking. Check the reference and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking || booking.status !== "CONFIRMED") return;

    setCheckingIn(true);
    try {
      const result = await bookingService.checkInStaffBooking(booking.id);
      const updatedBooking = result?.data ?? result;
      if (updatedBooking?.status !== "CHECKED_IN") {
        throw new Error("The server did not confirm the check-in.");
      }
      setBooking(updatedBooking);
      toast.success(`Booking ${updatedBooking.pnr} has been checked in.`);
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(requestError, "Unable to check in this traveler."),
      );
    } finally {
      setCheckingIn(false);
    }
  };

  const departure =
    flight?.departureTime && flight?.departureDate
      ? new Date(`${flight.departureDate}T${flight.departureTime}`).getTime()
      : Number.NaN;
  const checkInOpensAt = departure - 24 * 60 * 60 * 1000;
  const checkInClosesAt = departure - 90 * 60 * 1000;
  const checkInWindow =
    booking?.status !== "CONFIRMED"
      ? "Booking is not confirmed"
      : !Number.isFinite(departure)
        ? "Departure time unavailable"
        : Date.now() < checkInOpensAt
          ? "Check-in opens 24 hours before departure"
          : Date.now() > checkInClosesAt
            ? "Online check-in window has closed"
            : "Within the online check-in window";

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Service desk
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Booking lookup
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Search by booking reference (PNR). This lookup is limited to staff and
          administrators and returns only booking and flight operations details.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1 text-xs font-semibold text-muted">
          Booking reference (PNR)
          <input
            value={pnr}
            onChange={(event) => setPnr(event.target.value.toUpperCase())}
            autoComplete="off"
            maxLength={10}
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm font-bold tracking-widest text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter PNR"
          />
        </label>
        <Button type="submit" isLoading={loading} className="sm:min-w-36">
          <Search size={16} aria-hidden="true" />
          Find booking
        </Button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {booking && (
        <section
          aria-labelledby="staff-booking-result"
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Booking reference
              </p>
              <h2
                id="staff-booking-result"
                className="mt-1 font-mono text-xl font-bold tracking-widest"
              >
                {booking.pnr}
              </h2>
            </div>
            <Badge
              variant={
                ["CONFIRMED", "CHECKED_IN"].includes(booking.status)
                  ? "success"
                  : "warning"
              }
            >
              {booking.status}
            </Badge>
          </div>
          <dl className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Flight
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {flight
                  ? `${flight.flightNumber} · ${flight.origin?.code} → ${flight.destination?.code}`
                  : `Flight record ${booking.flightId}`}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Departure
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {flight
                  ? `${flight.departureDate || ""} ${flight.departureTime || ""}`.trim()
                  : "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Seat and cabin
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {booking.seatNumber} · {booking.cabinClass}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Online check-in window
              </dt>
              <dd className="mt-1 text-sm font-semibold">{checkInWindow}</dd>
            </div>
            {flightError && (
              <div role="alert" className="sm:col-span-2 text-xs text-danger">
                {flightError}
              </div>
            )}
          </dl>
          <div className="border-t border-border bg-surface-muted/50 px-5 py-4">
            {booking.status === "CHECKED_IN" ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 size={17} aria-hidden="true" />
                Traveler checked in
                {booking.checkedInAt && (
                  <span className="font-normal text-muted">
                    at {booking.checkedInAt.replace("T", " ")}
                  </span>
                )}
              </p>
            ) : booking.status === "CONFIRMED" ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-5 text-muted">
                  Staff counter check-in is available outside the online
                  check-in window.
                </p>
                <Button
                  type="button"
                  isLoading={checkingIn}
                  onClick={handleCheckIn}
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Mark as checked in
                </Button>
              </div>
            ) : (
              <p className="text-xs leading-5 text-muted">
                Only confirmed bookings can be checked in. Booking changes and
                refunds remain unavailable to staff.
              </p>
            )}
            <Link
              to="/staff/check-in"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Staff check-in help <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export { StaffBookingLookupPage };
export default StaffBookingLookupPage;
