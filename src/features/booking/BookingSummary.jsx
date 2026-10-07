import { Plane, Users } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { formatNaira } from "../../utils/formatNaira";
import { getBookingPriceBreakdown } from "./bookingPricing";

const BookingSummary = ({ idPrefix = "booking-summary" }) => {
  const flight = useAppSelector((state) => state.booking.selectedFlight);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const extras = useAppSelector((state) => state.booking.extras);
  const cabinClass = useAppSelector(
    (state) => state.booking.searchParams.cabinClass,
  );
  const { baseFare, extrasTotal, taxesAndFees, grandTotal } =
    getBookingPriceBreakdown({ flight, cabinClass, extras });
  const passenger = passengers[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm" aria-labelledby={`${idPrefix}-title`}>
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Your itinerary
            </p>
            <h2 id={`${idPrefix}-title`} className="mt-1 text-lg font-semibold text-foreground">
              Booking summary
            </h2>
          </div>
          <span className="rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-dark dark:text-primary">
            {cabinClass || "Economy"}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-xl border border-border bg-background p-4">
          {flight ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold text-foreground">
                  {flight.flightNumber}
                </span>
                <span className="text-xs text-muted">
                  {flight.duration || "Flight duration not listed"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {flight.departureTime}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted">
                    {flight.origin?.code}
                  </p>
                  <p className="text-xs text-muted">
                    {flight.origin?.city}
                  </p>
                </div>
                <Plane size={16} className="text-primary" aria-hidden="true" />
                <div className="text-right">
                  <p className="text-xl font-semibold text-foreground">
                    {flight.arrivalTime}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted">
                    {flight.destination?.code}
                  </p>
                  <p className="text-xs text-muted">
                    {flight.destination?.city}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                <span>{passenger ? `${passenger.firstName} ${passenger.lastName}`.trim() : "Traveler details pending"}</span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} aria-hidden="true" /> 1 traveler
                </span>
              </div>
              {selectedSeats[0] && (
                <p className="mt-2 text-xs text-muted">
                  Seat <span className="font-semibold text-foreground">{selectedSeats[0]}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              Your selected flight and traveler details will appear here.
            </p>
          )}
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3 text-muted">
            <dt>Flight fare</dt>
            <dd className="font-medium text-foreground">{formatNaira(baseFare)}</dd>
          </div>
          {extrasTotal > 0 && (
            <div className="flex items-center justify-between gap-3 text-muted">
              <dt>Selected extras</dt>
              <dd className="font-medium text-foreground">{formatNaira(extrasTotal)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 text-muted">
            <dt>Taxes and fees</dt>
            <dd className="font-medium text-foreground">{formatNaira(taxesAndFees)}</dd>
          </div>
        </dl>

        <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Total</p>
            <p className="mt-0.5 text-xs text-muted">For 1 traveler</p>
          </div>
          <p className="text-xl font-bold tracking-tight text-foreground">
            {formatNaira(grandTotal)}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Final payment details are confirmed before checkout.
        </p>
      </div>
    </section>
  );
};

export default BookingSummary;
