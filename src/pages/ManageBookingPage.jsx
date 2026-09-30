import { useState } from "react";
import {
  Search,
  Plane,
  AlertCircle,
  Calendar,
  Luggage,
  CheckCircle2,
  User,
  Shield,
  Utensils,
  Mail,
  X,
  FileText,
  AlertTriangle
} from "lucide-react";
import bookingService from "../services/bookingService";
import BoardingPass from "../features/ticket/BoardingPass";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { formatNaira } from "../utils/formatNaira";
const ManageBookingPage = () => {
  const toast = useToast();
  const [pnrInput, setPnrInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [selectedBaggage, setSelectedBaggage] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [hasPriorityBoarding, setHasPriorityBoarding] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pnrInput.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await bookingService.getBookingByPnrAndLastName(pnrInput.trim(), lastNameInput.trim());
      setBooking(res.data || null);
      if (res.data) {
        setSelectedSeat(res.data.seatNumber || "12A");
        setSelectedBaggage(res.data.extras?.baggageKg || 20);
        setSelectedMeal(res.data.extras?.mealPreference || "Standard Meal");
        setHasPriorityBoarding(!!res.data.extras?.priorityBoarding);
        setHasInsurance(!!res.data.extras?.travelInsurance);
      }
    } catch (err) {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };
  const handleResendEmail = async () => {
    if (!booking) return;
    setEmailLoading(true);
    setTimeout(() => {
      setEmailLoading(false);
      toast.success(
        `E-ticket and itinerary sent to passenger email for PNR ${booking.pnr}`,
        "Email Dispatched"
      );
    }, 600);
  };
  const handleConfirmCancel = async () => {
    if (!booking) return;
    setCancelLoading(true);
    try {
      const res = await bookingService.cancelBooking(booking.id);
      const refund = res.data?.refundAmount ?? Math.max(0, booking.totalAmount - 50);
      setBooking((prev) => prev ? { ...prev, status: "CANCELLED", paymentStatus: "REFUNDED" } : null);
      setShowCancelModal(false);
      toast.warning(
        `Booking ${booking.pnr} has been cancelled. A refund of $${refund.toFixed(2)} was credited to your original payment card.`,
        "Booking Cancelled"
      );
    } catch (err) {
      toast.error("Failed to cancel booking. Please try again.", "Error");
    } finally {
      setCancelLoading(false);
    }
  };
  const handleSaveSeat = async () => {
    if (!booking || !selectedSeat) return;
    try {
      if (booking.status !== "PENDING_PAYMENT") {
        throw new Error("Seat changes are available only while payment is pending.");
      }
      const res = await bookingService.upgradeBookingSeat(booking.id, selectedSeat, 0);
      if (res.data) {
        setBooking(res.data);
      } else {
        setBooking((prev) => prev ? { ...prev, seatNumber: selectedSeat } : null);
      }
      setShowSeatModal(false);
      toast.success(`Seat changed successfully to ${selectedSeat}`, "Seat Updated");
    } catch (err) {
      toast.error("Failed to update seat selection", "Error");
    }
  };
  const handleSaveExtras = async () => {
    if (!booking) return;
    toast.error("Post-booking extras are not available until the backend exposes an extras endpoint.", "Unavailable");
  };
  const occupiedSeats = /* @__PURE__ */ new Set(["1A", "1B", "2D", "3F", "5A", "6C", "7D", "9A", "10C", "11F", "12B", "14A", "15F"]);
  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">Confirmed & Ticketed</Badge>;
      case "CANCELLED":
        return <Badge variant="primary">Cancelled</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending Confirmation</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };
  return <div className="min-h-screen bg-background py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {
    /* Header */
  }
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Passenger Self-Service
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mt-2">
            Manage Your Booking
          </h1>
          <p className="text-xs md:text-sm text-muted mt-1.5 leading-relaxed">
            Retrieve your flight itinerary, select or change seats, add checked baggage, resend e-tickets, or process cancellation.
          </p>
        </div>

        {
    /* Search Box */
  }
        <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="pnr-input" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Booking Reference (PNR) *
              </label>
              <input
    id="pnr-input"
    type="text"
    maxLength={8}
    placeholder="e.g. TG88JK"
    value={pnrInput}
    onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm uppercase font-mono font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
    required
  />
            </div>

            <div>
              <label htmlFor="lastname-input" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Passenger Last Name
              </label>
              <input
    id="lastname-input"
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
                <Search size={16} /> Retrieve Itinerary
              </Button>
            </div>
          </form>

          {
    /* Demo PNR Quick Fillers */
  }
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-muted">Sample Records:</span>
            {[
    { code: "TG88JK", name: "Obi" },
    { code: "TGM992", name: "Adeleke" },
    { code: "TGA441", name: "Fashola" },
    { code: "TGE118", name: "Eze" }
  ].map((item) => <button
    key={item.code}
    type="button"
    onClick={() => {
      setPnrInput(item.code);
      setLastNameInput(item.name);
    }}
    className="font-mono text-xs font-semibold text-primary hover:bg-primary/15 bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg cursor-pointer transition"
  >
                {item.code} ({item.name})
              </button>)}
          </div>
        </div>

        {
    /* Loading Skeleton */
  }
        {loading && <div className="space-y-4">
            <Skeleton className="w-full h-48 rounded-2xl" />
            <Skeleton className="w-full h-32 rounded-2xl" />
          </div>}

        {
    /* Not Found State */
  }
        {!loading && searched && !booking && <EmptyState
    title="No Matching Booking Found"
    description={`We could not locate any reservation for booking reference "${pnrInput}" ${lastNameInput ? `and last name "${lastNameInput}"` : ""}. Please verify your ticket confirmation email or try one of the sample records above.`}
    actionLabel="Try Sample Booking"
    onAction={() => {
      setPnrInput("TG88JK");
      setLastNameInput("Obi");
    }}
  />}

        {
    /* Found Booking Details */
  }
        {!loading && booking && <div className="space-y-6">
            {
    /* Cancellation Notice Banner */
  }
            {booking.status === "CANCELLED" && <div className="p-4 bg-primary/10 border border-primary/25 text-red-900 rounded-2xl text-xs flex items-start gap-3">
                <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-primary">This Booking is Cancelled</p>
                  <p className="text-muted mt-0.5">
                    Your reservation has been cancelled. An electronic refund of {formatNaira(Math.max(0, booking.totalAmount - 15e3))} has been credited back to your original payment method.
                  </p>
                </div>
              </div>}

            {
    /* Flight Summary Card */
  }
            <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded">
                      PNR: {booking.pnr}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <h2 className="text-lg font-black text-foreground mt-2">
                    Flight {booking.flightNumber} • {booking.origin} to {booking.destination}
                  </h2>
                </div>

                <div className="text-right sm:text-right">
                  <p className="text-xs text-muted">Total Paid</p>
                  <p className="text-2xl font-black text-foreground">${booking.totalAmount}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Payment {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {
    /* Flight Itinerary Grid */
  }
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-background p-5 rounded-xl border border-border">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase text-muted">Departure</p>
                  <p className="text-lg font-black text-foreground">{booking.departureTime}</p>
                  <p className="text-xs font-semibold text-foreground">{booking.origin}</p>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <Calendar size={13} /> {booking.departureDate}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-muted bg-surface border border-border px-2.5 py-0.5 rounded-full">
                    Direct • Non-Stop
                  </span>
                  <div className="w-full flex items-center gap-2 text-muted">
                    <div className="h-0.5 bg-surface-muted flex-1" />
                    <Plane size={16} className="text-primary transform rotate-90" />
                    <div className="h-0.5 bg-surface-muted flex-1" />
                  </div>
                  <span className="text-[11px] font-medium text-muted">TigerAirlines Airbus A320</span>
                </div>

                <div className="space-y-1 md:text-right">
                  <p className="text-[11px] font-bold uppercase text-muted">Arrival Destination</p>
                  <p className="text-lg font-black text-foreground">11:45</p>
                  <p className="text-xs font-semibold text-foreground">{booking.destination}</p>
                  <p className="text-xs text-muted">{booking.departureDate}</p>
                </div>
              </div>

              {
    /* Passengers & Assigned Seats */
  }
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Traveler & Seat Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(booking.passengers && booking.passengers.length > 0 ? booking.passengers : [{ id: "1", firstName: booking.passengerName.split(" ")[0], lastName: booking.passengerName.split(" ")[1] || "", seat: booking.seatNumber, ticketNumber: "075-8910245190", passportNumber: "P7829104" }]).map((p, idx) => <div
    key={p.id || idx}
    className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl"
  >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-muted text-foreground flex items-center justify-center font-bold text-xs">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-[11px] text-muted font-mono">
                            Ticket: {p.ticketNumber || "075-4819204"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted block">Seat</span>
                        <span className="text-sm font-black text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/25">
                          {p.seat || booking.seatNumber || "12A"}
                        </span>
                      </div>
                    </div>)}
                </div>
              </div>

              {
    /* Baggage & Extras */
  }
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Included Extras & Services
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <p className="text-muted text-[10px] font-bold uppercase flex items-center gap-1">
                      <Luggage size={12} /> Baggage
                    </p>
                    <p className="font-bold text-foreground mt-1">{booking.extras?.baggageKg || 20} kg Checked</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <p className="text-muted text-[10px] font-bold uppercase flex items-center gap-1">
                      <Utensils size={12} /> In-Flight Meal
                    </p>
                    <p className="font-bold text-foreground mt-1">{booking.extras?.mealPreference || "Standard Meal"}</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <p className="text-muted text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> Priority Boarding
                    </p>
                    <p className="font-bold text-foreground mt-1">
                      {booking.extras?.priorityBoarding ? "Included" : "Standard"}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <p className="text-muted text-[10px] font-bold uppercase flex items-center gap-1">
                      <Shield size={12} /> Travel Cover
                    </p>
                    <p className="font-bold text-foreground mt-1">
                      {booking.extras?.travelInsurance ? "Active (Comprehensive)" : "None"}
                    </p>
                  </div>
                </div>
              </div>

              {
    /* Actions Toolbar */
  }
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
    type="button"
    variant="outline"
    size="sm"
    disabled={booking.status === "CANCELLED"}
    onClick={() => setShowSeatModal(true)}
    className="gap-1.5 font-bold"
  >
                    Change Seat
                  </Button>

                  <Button
    type="button"
    variant="outline"
    size="sm"
    disabled={booking.status === "CANCELLED"}
    onClick={() => setShowExtrasModal(true)}
    className="gap-1.5 font-bold"
  >
                    Add Extras
                  </Button>

                  <Button
    type="button"
    variant="ghost"
    size="sm"
    isLoading={emailLoading}
    onClick={handleResendEmail}
    className="gap-1.5 font-bold text-foreground"
  >
                    <Mail size={14} /> Resend E-Ticket
                  </Button>
                </div>

                {booking.status !== "CANCELLED" && <Button
    type="button"
    variant="danger"
    size="sm"
    onClick={() => setShowCancelModal(true)}
    className="font-bold gap-1.5"
  >
                    Cancel Booking
                  </Button>}
              </div>
            </div>

            {
    /* Boarding Pass Component Preview */
  }
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Boarding Pass & Travel Documents
              </h3>
              <BoardingPass booking={booking} />
            </div>
          </div>}

        {
    /* MODAL 1: Cancellation Flow with Policy Card & Fee Breakdown */
  }
        {showCancelModal && booking && <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-modal-title"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
  >
            <div className="bg-surface rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5 text-primary">
                  <AlertTriangle size={22} />
                  <h3 id="cancel-modal-title" className="text-lg font-black text-foreground">
                    Cancel Booking {booking.pnr}
                  </h3>
                </div>
                <button
    type="button"
    onClick={() => setShowCancelModal(false)}
    className="p-1 text-muted hover:text-muted rounded-lg"
  >
                  <X size={18} />
                </button>
              </div>

              {
    /* Policy Card */
  }
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Shield size={14} className="text-amber-700" /> TigerAirlines Cancellation Policy
                </p>
                <p className="text-amber-900 leading-relaxed">
                  Cancellations initiated more than 48 hours prior to departure are subject to a standard airline administrative cancellation fee of <strong>₦15,000</strong>. The remaining fare balance is returned to your original payment card within 3–5 business days.
                </p>
              </div>

              {
    /* Fee Breakdown */
  }
              <div className="bg-background rounded-2xl p-4 border border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Original Ticket Total Paid:</span>
                  <span className="font-mono font-bold text-foreground">₦{booking.totalAmount.toLocaleString("en-NG")}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Airline Administrative Fee:</span>
                  <span className="font-mono font-bold">-₦15,000</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between text-sm font-black text-foreground">
                  <span>Estimated Net Refund:</span>
                  <span className="font-mono text-emerald-600 text-base">
                    ₦{Math.max(0, booking.totalAmount - 15e3).toLocaleString("en-NG")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted">
                By confirming below, your seat reservation will be permanently released and your e-ticket cancelled.
              </p>

              {
    /* Action Buttons */
  }
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
    type="button"
    variant="outline"
    onClick={() => setShowCancelModal(false)}
    disabled={cancelLoading}
  >
                  Keep Reservation
                </Button>
                <Button
    type="button"
    variant="danger"
    isLoading={cancelLoading}
    onClick={handleConfirmCancel}
    className="font-bold"
  >
                  Confirm Cancellation & Refund
                </Button>
              </div>
            </div>
          </div>}

        {
    /* MODAL 2: Change Seat Modal */
  }
        {showSeatModal && booking && <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="seat-modal-title"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
  >
            <div className="bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 id="seat-modal-title" className="text-base font-black text-foreground">
                    Change Seat for {booking.passengerName}
                  </h3>
                  <p className="text-xs text-muted">Current Seat: {booking.seatNumber}</p>
                </div>
                <button
    type="button"
    onClick={() => setShowSeatModal(false)}
    className="p-1 text-muted hover:text-muted rounded-lg"
  >
                  <X size={18} />
                </button>
              </div>

              {
    /* Interactive Mini Seat Selector */
  }
              <div className="space-y-3">
                <div className="bg-background p-4 rounded-2xl border border-border space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-center pb-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                    Front of Aircraft
                  </div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].map((row) => <div key={row} className="flex items-center justify-center gap-1.5 text-xs">
                      <span className="w-5 text-right font-mono text-[10px] text-muted">{row}</span>
                      {["A", "B", "C", "", "D", "E", "F"].map((col, idx) => {
    if (col === "") return <div key={idx} className="w-4 text-center text-muted text-[10px]">||</div>;
    const seatCode = `${row}${col}`;
    const isOccupied = occupiedSeats.has(seatCode);
    const isSelected = selectedSeat === seatCode;
    return <button
      key={seatCode}
      type="button"
      disabled={isOccupied}
      aria-label={`Seat ${seatCode}, ${isOccupied ? "Occupied" : "Available"}`}
      onClick={() => setSelectedSeat(seatCode)}
      className={`w-7 h-7 rounded text-[11px] font-bold transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${isSelected ? "bg-primary text-white shadow-sm ring-2 ring-primary/40" : isOccupied ? "bg-surface-muted text-muted" : "bg-surface hover:bg-primary/10 text-foreground border border-border"}`}
    >
                            {isSelected ? "\u2713" : col}
                          </button>;
  })}
                    </div>)}
                </div>

                <div className="flex items-center justify-between text-xs px-2 text-muted">
                  <span>Selected Seat: <strong className="text-foreground">{selectedSeat}</strong></span>
                  <span className="text-[11px] text-emerald-600 font-semibold">Free Seat Change</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSeatModal(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleSaveSeat}>
                  Confirm Seat {selectedSeat}
                </Button>
              </div>
            </div>
          </div>}

        {
    /* MODAL 3: Add Extras Modal */
  }
        {showExtrasModal && booking && <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="extras-modal-title"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
  >
            <div className="bg-surface rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 id="extras-modal-title" className="text-lg font-black text-foreground">
                  Add Extras & Services
                </h3>
                <button
    type="button"
    onClick={() => setShowExtrasModal(false)}
    className="p-1 text-muted hover:text-muted rounded-lg"
  >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {
    /* Baggage upgrade */
  }
                <div className="p-3.5 bg-background rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Luggage size={14} className="text-primary" /> Additional Checked Baggage
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
    { kg: 20, label: "20 kg (Included)", price: 0 },
    { kg: 25, label: "+5 kg (\u20A68,000)", price: 8e3 },
    { kg: 30, label: "+10 kg (\u20A614,000)", price: 14e3 }
  ].map((opt) => <button
    key={opt.kg}
    type="button"
    onClick={() => setSelectedBaggage(opt.kg)}
    className={`p-2.5 rounded-xl text-left border text-xs font-medium cursor-pointer transition ${selectedBaggage === opt.kg ? "bg-primary/10 border-primary text-primary font-bold" : "bg-surface border-border text-foreground hover:bg-surface-muted"}`}
  >
                        <p>{opt.label}</p>
                      </button>)}
                  </div>
                </div>

                {
    /* Meal Upgrade */
  }
                <div className="p-3.5 bg-background rounded-2xl border border-border">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                    <Utensils size={14} className="text-primary" /> Meal Preference Selection
                  </span>
                  <select
    value={selectedMeal}
    onChange={(e) => setSelectedMeal(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
  >
                    <option value="Standard Meal">Standard Meal (Included)</option>
                    <option value="Vegetarian Meal">Vegetarian Meal (+ ₦4,000)</option>
                    <option value="Diabetic Meal">Diabetic / Low Glycemic (+ ₦4,000)</option>
                    <option value="Chef's Special">Chef's Nigerian Special Platter (+ ₦6,000)</option>
                  </select>
                </div>

                {
    /* Priority Boarding */
  }
                <label className="flex items-center justify-between p-3.5 bg-background rounded-2xl border border-border cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Priority Boarding</p>
                      <p className="text-[11px] text-muted">Board among Group 1 with dedicated overhead space</p>
                    </div>
                  </div>
                  <input
    type="checkbox"
    checked={hasPriorityBoarding}
    onChange={(e) => setHasPriorityBoarding(e.target.checked)}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                </label>

                {
    /* Travel Insurance */
  }
                <label className="flex items-center justify-between p-3.5 bg-background rounded-2xl border border-border cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">TigerShield Comprehensive Travel Insurance</p>
                      <p className="text-[11px] text-muted">Comprehensive medical, trip delay & luggage protection (₦12,500)</p>
                    </div>
                  </div>
                  <input
    type="checkbox"
    checked={hasInsurance}
    onChange={(e) => setHasInsurance(e.target.checked)}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowExtrasModal(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleSaveExtras}>
                  Save Extras
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};
var stdin_default = ManageBookingPage;
export {
  ManageBookingPage,
  stdin_default as default
};
