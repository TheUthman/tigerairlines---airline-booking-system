import { useNavigate } from "react-router-dom";
import { Plane, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setBookingStep } from "./bookingSlice";
import { formatNaira } from "../../utils/formatNaira";
const ReviewStep = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const flight = useAppSelector((state) => state.booking.selectedFlight);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const extras = useAppSelector((state) => state.booking.extras);
  const cabinClass = useAppSelector(
    (state) => state.booking.searchParams.cabinClass,
  );
  const basePrice = flight
    ? cabinClass === "Business"
      ? flight.priceBusiness
      : flight.priceEconomy
    : 45e3;
  const baggageCost =
    extras.baggageKg === 30 ? 1e4 : extras.baggageKg === 40 ? 18e3 : 0;
  const mealCost = extras.mealPreference === "Chef's Special" ? 4500 : 0;
  const insuranceCost = extras.travelInsurance ? 5e3 : 0;
  const priorityCost = extras.priorityBoarding ? 2500 : 0;
  const loungeCost = extras.loungeAccess ? 8e3 : 0;
  const extrasTotal =
    baggageCost + mealCost + insuranceCost + priorityCost + loungeCost;
  const taxesAndFees = Math.round(basePrice * 0.075);
  const grandTotal = basePrice + extrasTotal + taxesAndFees;
  const passenger = passengers[0] || {
    firstName: "",
    lastName: "",
    passportNumber: "",
    nationality: "",
  };
  const handleProceedToPayment = () => {
    navigate("/payment");
  };
  return (
    <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
      <div className="mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-black text-foreground">
          Review & Confirm Itinerary
        </h2>
        <p className="text-xs text-muted mt-1">
          Please review your flight and passenger details before proceeding to
          secure payment.
        </p>
      </div>

      <div className="space-y-6">
        {/* Flight Summary Card */}
        <div className="bg-background rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Outbound Flight • {flight?.flightNumber || "TG-101"}
              </span>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full">
              {cabinClass} Class
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-black text-foreground">
                {flight?.departureTime || "08:30"}
              </p>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {flight?.origin.city || "Lagos"} ({flight?.origin.code || "LOS"}
                )
              </p>
              <p className="text-[11px] text-muted">
                {flight?.origin.name ||
                  "Murtala Muhammed International Airport"}
              </p>
            </div>

            <div className="text-center px-4">
              <span className="text-xs font-semibold text-muted">
                {flight?.duration || "4h 15m"}
              </span>
              <div className="flex items-center gap-2 my-1">
                <div className="w-12 border-t border-border" />
                <Plane size={14} className="text-primary" />
                <div className="w-12 border-t border-border" />
              </div>
              <span className="text-[10px] font-bold text-muted">
                {flight?.stops === 0 ? "Non-Stop" : `${flight?.stops} Stop`}
              </span>
            </div>

            <div className="sm:text-right">
              <p className="text-2xl font-black text-foreground">
                {flight?.arrivalTime || "12:45"}
              </p>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {flight?.destination.city || "Abuja"} (
                {flight?.destination.code || "ABV"})
              </p>
              <p className="text-[11px] text-muted">
                {flight?.destination.name || "Suvarnabhumi Airport"}
              </p>
            </div>
          </div>
        </div>

        {/* Passenger & Seat Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Traveler Information
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
                {passenger.firstName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-xs text-muted font-mono">
                  Passport: {passenger.passportNumber} • {passenger.nationality}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Seating & Services
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Seat {selectedSeats[0] || "12A"} ({cabinClass})
                </p>
                <p className="text-xs text-muted">
                  Meal: {extras.mealPreference} • Baggage: {extras.baggageKg} kg
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
                {selectedSeats[0] || "12A"}
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-b border-border py-4 space-y-2 text-xs">
          <div className="flex justify-between text-muted">
            <span>Airfare Base ({cabinClass})</span>
            <span className="font-semibold text-foreground">
              {formatNaira(basePrice)}
            </span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between text-muted">
              <span>Selected Travel Extras & Add-ons</span>
              <span className="font-semibold text-foreground">
                +{formatNaira(extrasTotal)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Airport Taxes & NCAA Passenger Service Charge (PSC)</span>
            <span className="font-semibold text-foreground">
              +{formatNaira(taxesAndFees)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-foreground pt-2 border-t border-border">
            <span>Total Payable Amount</span>
            <span className="text-xl text-primary">
              {formatNaira(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => dispatch(setBookingStep(3))}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Extras
        </Button>

        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleProceedToPayment}
          className="px-8 font-bold flex items-center gap-2 shadow-md hover:shadow-orange-500/25"
        >
          <span>Proceed to Payment (${grandTotal}.00)</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
var stdin_default = ReviewStep;
export { ReviewStep, stdin_default as default };
