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
  ChevronRight
} from "lucide-react";
import bookingService from "../services/bookingService";
import BoardingPass from "../features/ticket/BoardingPass";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import EmptyState from "../components/ui/EmptyState";
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
  const [forceWindowOpen, setForceWindowOpen] = useState(false);
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pnrInput.trim()) return;
    setLoading(true);
    setSearched(true);
    setCurrentStep(1);
    try {
      const res = await bookingService.getBookingByPnrAndLastName(pnrInput.trim(), lastNameInput.trim());
      setBooking(res.data || null);
      if (res.data) {
        setSelectedSeat(res.data.seatNumber || "12A");
      }
    } catch (err) {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };
  const isWithin24Hours = forceWindowOpen || booking?.pnr === "TG88JK_DEMO_OPEN";
  const handleProceedToSeat = () => {
    if (!declaredSafety) {
      toast.warning("Please confirm the aviation safety and hazardous goods declaration before proceeding.");
      return;
    }
    setCurrentStep(2);
  };
  const handleCompleteCheckIn = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      if (selectedSeat !== booking.seatNumber) {
        throw new Error("Seat changes must be completed before payment confirmation.");
      }
      setBooking((prev) => prev ? { ...prev, seatNumber: selectedSeat } : null);
      setCurrentStep(3);
      toast.success(
        `Check-in confirmed for ${booking.passengerName}. Seat ${selectedSeat} secured!`,
        "Check-In Complete"
      );
    } catch (err) {
      toast.error("Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-background py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {
    /* Header */
  }
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Online Check-In
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mt-2">
            Flight Check-In & Boarding Pass
          </h1>
          <p className="text-xs md:text-sm text-muted mt-1.5 leading-relaxed">
            Check in online between 24 hours and 90 minutes before scheduled departure to choose your seat and obtain mobile boarding passes.
          </p>
        </div>

        {
    /* Lookup Card */
  }
        <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="checkin-pnr" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
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
              <label htmlFor="checkin-lastname" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Passenger Last Name
              </label>
              <input
    id="checkin-lastname"
    type="text"
    placeholder="e.g. Obi"
    value={lastNameInput}
    onChange={(e) => setLastNameInput(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
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

          {
    /* Sample PNRs */
  }
          <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-muted">Sample Bookings:</span>
            {[
    { code: "TG88JK", name: "Obi" },
    { code: "TGM992", name: "Adeleke" },
    { code: "TGA441", name: "Fashola" }
  ].map((item) => <button
    key={item.code}
    type="button"
    onClick={() => {
      setPnrInput(item.code);
      setLastNameInput(item.name);
    }}
    className="font-mono text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-2 py-0.5 rounded cursor-pointer transition border border-primary/25"
  >
                {item.code}
              </button>)}
          </div>
        </div>

        {
    /* Not Found */
  }
        {!loading && searched && !booking && <EmptyState
    title="Booking Not Found"
    description="We could not find an active reservation with the specified PNR and last name. Please verify your confirmation email."
    actionLabel="Try Sample PNR TG88JK"
    onAction={() => {
      setPnrInput("TG88JK");
      setLastNameInput("Obi");
    }}
  />}

        {
    /* Found Booking */
  }
        {!loading && booking && <div className="space-y-6">
            {
    /* If flight departure is too early (>24h away) AND not forced */
  }
            {!isWithin24Hours ? <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Clock size={32} />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    Check-in Opens in 18h 42m
                  </span>
                  <h2 className="text-xl font-black text-foreground">
                    Online Check-In Is Not Yet Open
                  </h2>
                  <p className="text-xs md:text-sm text-muted max-w-md mx-auto leading-relaxed">
                    TigerAirlines flight <strong>{booking.flightNumber}</strong> ({booking.origin} → {booking.destination}) departs on <strong>{booking.departureDate} at {booking.departureTime}</strong>. Online check-in opens 24 hours prior to departure.
                  </p>
                </div>

                <div className="p-4 bg-background rounded-2xl max-w-md mx-auto border border-border text-xs text-left space-y-2">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-primary" /> What you can do right now:
                  </p>
                  <ul className="list-disc list-inside text-muted space-y-1">
                    <li>Add checked luggage or special dietary meals via <a href="/manage-booking" className="text-primary font-bold underline">Manage Booking</a></li>
                    <li>Verify your travel passport and transit visa validity</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
    type="button"
    onClick={() => setForceWindowOpen(true)}
    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition cursor-pointer"
  >
                    Simulate 24h Check-in Window Open (Demo Mode) →
                  </button>
                </div>
              </div> : (
    /* Check-in 3-Step Wizard */
    <div className="space-y-6">
                {
      /* Stepper Progress */
    }
                <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-2 font-bold ${currentStep >= 1 ? "text-primary" : "text-muted"}`}>
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                    <span>Passenger Details</span>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                  <div className={`flex items-center gap-2 font-bold ${currentStep >= 2 ? "text-primary" : "text-muted"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? "bg-primary text-white" : "bg-surface-muted text-muted"}`}>2</span>
                    <span>Seat Selection</span>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                  <div className={`flex items-center gap-2 font-bold ${currentStep >= 3 ? "text-primary" : "text-muted"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? "bg-primary text-white" : "bg-surface-muted text-muted"}`}>3</span>
                    <span>Boarding Pass</span>
                  </div>
                </div>

                {
      /* STEP 1: Confirm Details */
    }
                {currentStep === 1 && <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-border space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                        <h2 className="text-lg font-black text-foreground">Step 1: Confirm Passenger Information</h2>
                        <p className="text-xs text-muted">Flight {booking.flightNumber} • {booking.origin} → {booking.destination}</p>
                      </div>
                      <Badge variant="accent">Window Open</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">Passenger Name</span>
                        <p className="text-sm font-bold text-foreground mt-1">{booking.passengerName}</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">Document / Passport</span>
                        <p className="text-sm font-bold text-foreground mt-1">A10293847 (Nigeria)</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">Assigned Seat</span>
                        <p className="text-sm font-bold text-primary mt-1 font-mono">{booking.seatNumber || "12A"}</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <span className="text-muted font-bold uppercase text-[10px]">Checked Baggage</span>
                        <p className="text-sm font-bold text-foreground mt-1">{booking.extras?.baggageKg || 20} kg Allowance</p>
                      </div>
                    </div>

                    {
      /* Dangerous Goods Declaration */
    }
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-950">Aviation Security & Dangerous Goods Declaration</p>
                          <p className="text-amber-900 mt-1 leading-relaxed">
                            International aviation regulations prohibit carrying flammable liquids, lithium power banks over 100Wh in checked bags, corrosive chemicals, and compressed gases in baggage.
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
                          I certify that I am not carrying prohibited dangerous goods and my travel documents are valid.
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
                  </div>}

                {
      /* STEP 2: Select/Change Seat */
    }
                {currentStep === 2 && <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-border space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                        <h2 className="text-lg font-black text-foreground">Step 2: Confirm or Change Seat</h2>
                        <p className="text-xs text-muted">Select an available seat for flight {booking.flightNumber}</p>
                      </div>
                      <div className="bg-primary/10 border border-primary/25 px-3 py-1 rounded-xl text-xs font-mono font-bold text-primary">
                        Selected: {selectedSeat}
                      </div>
                    </div>

                    {
      /* Mini Seat Selection Grid */
    }
                    <div className="bg-background p-6 rounded-2xl border border-border max-w-sm mx-auto space-y-2">
                      <div className="text-center pb-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                        Cockpit / Front
                      </div>
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12, 14].map((row) => <div key={row} className="flex items-center justify-center gap-2 text-xs">
                          <span className="w-5 text-right font-mono text-[10px] text-muted">{row}</span>
                          {["A", "B", "C", "", "D", "E", "F"].map((col, idx) => {
      if (col === "") return <div key={idx} className="w-4 text-center text-muted text-[10px]">||</div>;
      const seatCode = `${row}${col}`;
      const isOccupied = ["4C", "5A", "7B", "9E", "11F"].includes(seatCode);
      const isSelected = selectedSeat === seatCode;
      return <button
        key={seatCode}
        type="button"
        disabled={isOccupied}
        aria-label={`Seat ${seatCode}, ${isOccupied ? "Occupied" : "Available"}`}
        onClick={() => setSelectedSeat(seatCode)}
        className={`w-7 h-7 rounded text-[11px] font-bold transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${isSelected ? "bg-primary text-white shadow-md ring-2 ring-primary/40" : isOccupied ? "bg-surface-muted text-muted" : "bg-surface hover:bg-primary/10 text-foreground border border-border"}`}
      >
                                {isSelected ? "\u2713" : col}
                              </button>;
    })}
                        </div>)}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                        Back
                      </Button>
                      <Button
      type="button"
      variant="primary"
      isLoading={loading}
      onClick={handleCompleteCheckIn}
      className="font-bold gap-2"
    >
                        <CheckCircle2 size={16} /> Confirm & Issue Boarding Pass
                      </Button>
                    </div>
                  </div>}

                {
      /* STEP 3: Boarding Pass with QR */
    }
                {currentStep === 3 && <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Online Check-in Successful!</p>
                          <p className="text-emerald-800">Your boarding pass has been generated. Please arrive at Lagos Airport at least 45 minutes before departure.</p>
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
      onClick={() => toast.success("Pass saved to Mobile Wallet")}
      className="px-3 py-2 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition inline-flex items-center gap-1.5 cursor-pointer"
    >
                          <Smartphone size={14} /> Wallet
                        </button>
                      </div>
                    </div>

                    {
      /* Boarding Pass */
    }
                    <BoardingPass booking={booking} />
                  </div>}
              </div>
  )}
          </div>}
      </div>
    </div>;
};
var stdin_default = CheckInPage;
export {
  CheckInPage,
  stdin_default as default
};
