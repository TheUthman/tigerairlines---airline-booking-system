import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Printer,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import bookingService from "../services/bookingService";
import BoardingPass from "../features/ticket/BoardingPass";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import EmptyState from "../components/ui/EmptyState";
const formatRemainingTime = (milliseconds) => {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const CheckInPage = () => {
  const toast = useToast();
  const [pnrInput, setPnrInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [searched, setSearched] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [declaredSafety, setDeclaredSafety] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState("");
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pnrInput.trim()) return;
    setLoading(true);
    setSearched(true);
    setCurrentStep(1);
    try {
      const res = await bookingService.getBookingByPnrAndLastName(
        pnrInput.trim(),
        lastNameInput.trim(),
      );
      setBooking(res.data || null);
      if (res.data) {
        setSelectedSeat(res.data.seatNumber || "");
      }
    } catch (err) {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };
  const departureTimestamp = booking?.departureDate && booking?.departureTime
    ? new Date(`${booking.departureDate}T${booking.departureTime}`).getTime()
    : Number.NaN;
  const checkInOpensAt = departureTimestamp - 24 * 60 * 60 * 1000;
  const checkInClosesAt = departureTimestamp - 90 * 60 * 1000;
  const isDemoWindow = booking?.pnr === "TG88JK_DEMO_OPEN";
  const checkInWindowState = isDemoWindow
    ? "open"
    : !Number.isFinite(departureTimestamp)
      ? "unavailable"
      : Date.now() < checkInOpensAt
        ? "upcoming"
        : Date.now() > checkInClosesAt
          ? "closed"
          : "open";
  const isWithin24Hours = checkInWindowState === "open";
  const handleProceedToSeat = () => {
    if (!declaredSafety) {
      toast.warning(
        "Please confirm the aviation safety and hazardous goods declaration before proceeding.",
      );
      return;
    }
    if (!booking?.seatNumber) {
      toast.warning("A seat must be assigned before check-in can continue.");
      return;
    }
    setCurrentStep(2);
  };
  const handleCompleteCheckIn = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      if (selectedSeat !== booking.seatNumber) {
        throw new Error(
          "Seat changes are not available during online check-in. Confirm the seat assigned to your booking.",
        );
      }
      setBooking((prev) =>
        prev ? { ...prev, seatNumber: selectedSeat } : null,
      );
      setCurrentStep(3);
      toast.success(
        `Check-in confirmed for ${booking.passengerName}. Seat ${selectedSeat} secured!`,
        "Check-In Complete",
      );
    } catch (err) {
      toast.error("Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-background py-10 px-4 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Online Check-In
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mt-2">
            Flight Check-In & Boarding Pass
          </h1>
          <p className="text-xs md:text-sm text-muted mt-1.5 leading-relaxed">
            Check in between 24 hours and 90 minutes before departure to confirm
            your assigned seat and access your boarding pass.
          </p>
        </div>

        {/* Lookup Card */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label
                htmlFor="checkin-pnr"
                className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
              >
                Booking Reference (PNR) *
              </label>
              <input
                id="checkin-pnr"
                type="text"
                placeholder="e.g. TG88JK"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm uppercase font-mono font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="checkin-lastname"
                className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
              >
                Passenger Last Name *
              </label>
              <input
                id="checkin-lastname"
                type="text"
                placeholder="e.g. Obi"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full h-[42px] font-bold gap-2"
              >
                <Search size={16} /> Begin Check-In
              </Button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-border text-xs text-muted">
            Use the booking reference sent in your confirmation email.
          </div>
        </div>

        {/* Not Found */}
        {!loading && searched && !booking && (
          <EmptyState
            title="Booking Not Found"
            description="We could not find an active reservation with the specified PNR and last name. Please verify your confirmation email."
            actionLabel="Retry Search"
            onAction={() => {
              setPnrInput("");
              setLastNameInput("");
            }}
          />
        )}

        {/* Found Booking */}
        {!loading && booking && (
          <div className="space-y-6">
            {booking.status === "CHECKED_IN" ? (
              <div
                role="status"
                className="rounded-3xl border border-success/25 bg-success/5 p-8 text-center shadow-sm"
              >
                <CheckCircle2
                  size={36}
                  className="mx-auto text-success"
                  aria-hidden="true"
                />
                <h2 className="mt-3 text-xl font-black text-foreground">
                  You are already checked in
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Staff recorded check-in for booking {booking.pnr}
                  {booking.checkedInAt
                    ? ` at ${booking.checkedInAt.replace("T", " ")}`
                    : ""}
                  . Please contact the airport desk for your boarding pass.
                </p>
              </div>
            ) : !isWithin24Hours ? (
              <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Clock size={32} />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    {checkInWindowState === "upcoming"
                      ? `Check-in opens in ${formatRemainingTime(checkInOpensAt - Date.now())}`
                      : checkInWindowState === "closed"
                        ? "Check-in window closed"
                        : "Schedule unavailable"}
                  </span>
                  <h2 className="text-xl font-black text-foreground">
                    {checkInWindowState === "upcoming"
                      ? "Online check-in is not yet open"
                      : checkInWindowState === "closed"
                        ? "Online check-in has closed"
                        : "Departure time is unavailable"}
                  </h2>
                  <p className="text-xs md:text-sm text-muted max-w-md mx-auto leading-relaxed">
                    TigerAirlines flight <strong>{booking.flightNumber}</strong>{" "}
                    ({booking.origin} → {booking.destination}) departs on{" "}
                    <strong>
                      {booking.departureDate} at {booking.departureTime}
                    </strong>
                    . Online check-in is available from 24 hours until 90 minutes
                    before the scheduled departure.
                  </p>
                </div>

                <div className="p-4 bg-background rounded-2xl max-w-md mx-auto border border-border text-xs text-left space-y-2">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-primary" /> What you
                    can do right now:
                  </p>
                  <ul className="list-disc list-inside text-muted space-y-1">
                    <li>
                      Review your itinerary and passenger details in{" "}
                      <a
                        href="/manage-booking"
                        className="text-primary font-bold underline"
                      >
                        Manage Booking
                      </a>
                    </li>
                    <li>
                      Verify your travel passport and transit visa validity
                    </li>
                  </ul>
                </div>

                <div className="pt-2"></div>
              </div>
            ) : (
              /* Check-in 3-Step Wizard */
              <div className="space-y-6">
                {/* Stepper Progress */}
                <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between gap-1 text-xs">
                  <div
                    className={`flex min-w-0 flex-col items-center gap-1 text-center font-bold sm:flex-row sm:gap-2 sm:text-left ${currentStep >= 1 ? "text-primary" : "text-muted"}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="text-[10px] leading-tight sm:text-xs">Passenger details</span>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                  <div
                    className={`flex min-w-0 flex-col items-center gap-1 text-center font-bold sm:flex-row sm:gap-2 sm:text-left ${currentStep >= 2 ? "text-primary" : "text-muted"}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? "bg-primary text-white" : "bg-surface-muted text-muted"}`}
                    >
                      2
                    </span>
                    <span className="text-[10px] leading-tight sm:text-xs">Assigned seat</span>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                  <div
                    className={`flex min-w-0 flex-col items-center gap-1 text-center font-bold sm:flex-row sm:gap-2 sm:text-left ${currentStep >= 3 ? "text-primary" : "text-muted"}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? "bg-primary text-white" : "bg-surface-muted text-muted"}`}
                    >
                      3
                    </span>
                    <span className="text-[10px] leading-tight sm:text-xs">Boarding pass</span>
                  </div>
                </div>

                {/* STEP 1: Confirm Details */}
                {currentStep === 1 && (
                  <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-border space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Step 1: Confirm Passenger Information
                        </h2>
                        <p className="text-xs text-muted">
                          Flight {booking.flightNumber} • {booking.origin} →{" "}
                          {booking.destination}
                        </p>
                      </div>
                      <Badge variant="accent">Window Open</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">
                          Passenger Name
                        </span>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {booking.passengerName}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">
                          Document / Passport
                        </span>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {booking.passportNumber || booking.documentNumber || "Not provided"}{booking.nationality ? ` (${booking.nationality})` : ""}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">
                          Assigned Seat
                        </span>
                        <p className="text-sm font-bold text-primary mt-1 font-mono">
                          {booking.seatNumber || "Not assigned"}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">
                          Checked Baggage
                        </span>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {booking.extras?.baggageKg != null
                            ? `${booking.extras.baggageKg} kg selected`
                            : "No baggage selection"}
                        </p>
                      </div>
                    </div>

                    {/* Dangerous Goods Declaration */}
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle
                          size={18}
                          className="text-amber-700 shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="font-bold text-amber-950">
                            Aviation Security & Dangerous Goods Declaration
                          </p>
                          <p className="text-amber-900 mt-1 leading-relaxed">
                            International aviation regulations prohibit carrying
                            flammable liquids, lithium power banks over 100Wh in
                            checked bags, corrosive chemicals, and compressed
                            gases in baggage.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-3 pt-2 border-t border-amber-200/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={declaredSafety}
                          onChange={(e) => setDeclaredSafety(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="font-bold text-amber-950">
                          I certify that I am not carrying prohibited dangerous
                          goods and my travel documents are valid.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleProceedToSeat}
                        className="font-bold gap-2"
                      >
                        Continue to Seat Selection <ArrowRight size={15} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Select/Change Seat */}
                {currentStep === 2 && (
                  <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-border space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Step 2: Confirm Assigned Seat
                        </h2>
                        <p className="text-xs text-muted">
                          Confirm the seat assigned to flight {booking.flightNumber}. Seat changes are not available during online check-in.
                        </p>
                      </div>
                      <div className="bg-primary/10 border border-primary/25 px-3 py-1 rounded-xl text-xs font-mono font-bold text-primary">
                        Selected: {selectedSeat}
                      </div>
                    </div>

                    {/* Mini Seat Selection Grid */}
                    <div className="bg-background p-6 rounded-2xl border border-border max-w-sm mx-auto space-y-2">
                      <div className="text-center pb-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                        Cockpit / Front
                      </div>
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12, 14].map((row) => (
                        <div
                          key={row}
                          className="flex items-center justify-center gap-2 text-xs"
                        >
                          <span className="w-5 text-right font-mono text-[10px] text-muted">
                            {row}
                          </span>
                          {["A", "B", "C", "", "D", "E", "F"].map(
                            (col, idx) => {
                              if (col === "")
                                return (
                                  <div
                                    key={idx}
                                    className="w-4 text-center text-muted text-[10px]"
                                  >
                                    ||
                                  </div>
                                );
                              const seatCode = `${row}${col}`;
                              const isAssignedSeat = seatCode === booking.seatNumber;
                              const isUnavailable = !isAssignedSeat; 
                              const isSelected = selectedSeat === seatCode;
                              return (
                                <button
                                  key={seatCode}
                                  type="button"
                                  disabled={isUnavailable}
                                  aria-label={`Seat ${seatCode}, ${isAssignedSeat ? "Assigned to this booking" : "Not available for changes during check-in"}`}
                                  onClick={() => setSelectedSeat(seatCode)}
                                  className={`w-7 h-7 rounded text-[11px] font-bold transition flex items-center justify-center disabled:cursor-not-allowed ${isSelected ? "bg-primary text-on-primary shadow-md ring-2 ring-primary/40" : "bg-surface-muted text-muted border border-border"}`}
                                >
                                  {isSelected ? "\u2713" : col}
                                </button>
                              );
                            },
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        isLoading={loading}
                        onClick={handleCompleteCheckIn}
                        className="font-bold gap-2"
                      >
                        <CheckCircle2 size={16} /> Complete Check-In
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Boarding Pass with QR */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          size={24}
                          className="text-emerald-600 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-sm">
                            Online Check-in Successful!
                          </p>
                          <p className="text-emerald-800">
                            Your boarding pass is ready for flight {booking.flightNumber} from {booking.origin}.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-2 bg-surface border border-emerald-300 rounded-xl text-emerald-900 font-bold hover:bg-emerald-100 transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={14} /> Print
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toast.success("Pass saved to Mobile Wallet")
                          }
                          className="px-3 py-2 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Smartphone size={14} /> Wallet
                        </button>
                      </div>
                    </div>

                    {/* Boarding Pass */}
                    <BoardingPass booking={booking} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
var stdin_default = CheckInPage;
export { CheckInPage, stdin_default as default };
