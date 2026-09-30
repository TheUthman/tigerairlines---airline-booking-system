import { useState, useRef, useEffect } from "react";
import { Plane, Check, ArrowLeft, Clock } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setSelectedSeats, setBookingStep } from "./bookingSlice";
import { useToast } from "../../components/ui/Toast";
const SeatMapStep = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const flight = useAppSelector((state) => state.booking.selectedFlight);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const [currentSeat, setCurrentSeat] = useState(selectedSeats[0] || "12A");
  const cabinRef = useRef(null);
  const [secondsRemaining, setSecondsRemaining] = useState(480);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const [occupiedSeats, setOccupiedSeats] = useState(
    /* @__PURE__ */ new Set([
      "1A",
      "1B",
      "2D",
      "3F",
      "5A",
      "5B",
      "6C",
      "7D",
      "9A",
      "10C",
      "11F",
      "12B",
      "12C",
      "14A",
      "15E",
      "15F"
    ])
  );
  const raceConditionSeat = "14D";
  const rows = [
    { num: 1, type: "business", letters: ["A", "C", "", "D", "F"] },
    { num: 2, type: "business", letters: ["A", "C", "", "D", "F"] },
    { num: 3, type: "business", letters: ["A", "C", "", "D", "F"] },
    { num: 4, type: "economy-extra", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 5, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 6, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 7, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 8, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 9, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 10, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 11, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 12, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 14, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] },
    { num: 15, type: "economy", letters: ["A", "B", "C", "", "D", "E", "F"] }
  ];
  useGSAP(
    () => {
      gsap.from(".seat-item-btn", {
        scale: 0.7,
        opacity: 0,
        duration: 0.28,
        stagger: {
          amount: 0.25,
          from: "center",
          grid: [14, 6]
        },
        ease: "power2.out"
      });
    },
    { scope: cabinRef }
  );
  const handleSeatClick = (seatCode, e) => {
    if (seatCode === raceConditionSeat) {
      toast.warning(
        `Seat ${seatCode} was just secured by another customer browsing simultaneously. Please pick another seat.`,
        "Seat Unavailable"
      );
      setOccupiedSeats((prev) => /* @__PURE__ */ new Set([...prev, raceConditionSeat]));
      return;
    }
    if (occupiedSeats.has(seatCode)) return;
    setCurrentSeat(seatCode);
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.92 },
      { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }
    );
  };
  const handleConfirm = () => {
    dispatch(setSelectedSeats([currentSeat]));
    toast.info(`Seat ${currentSeat} reserved for ${passengers[0]?.firstName || "passenger"}. Proceeding to trip extras.`);
    dispatch(setBookingStep(3));
  };
  return <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-sm border border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-black text-foreground">Select Your Seat</h2>
          <p className="text-xs text-muted mt-1">
            Aircraft: <span className="font-semibold text-foreground">{flight?.aircraft || "Airbus A320neo"}</span> • Passenger:{" "}
            <span className="font-semibold text-foreground">
              {passengers[0]?.firstName || "Primary"} {passengers[0]?.lastName || "Traveler"}
            </span>
          </p>
        </div>

        {
    /* Real-time Session Hold Countdown & Selected Seat */
  }
        <div className="flex items-center gap-3">
          {
    /* 8:00 Hold Timer */
  }
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2 flex items-center gap-2">
            <Clock size={16} className="text-amber-700 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Seats Held For</p>
              <p className="text-xs font-mono font-black text-amber-950">{formatTimer(secondsRemaining)}</p>
            </div>
          </div>

          {
    /* Assigned Seat Indicator */
  }
          <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {currentSeat}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Selected Seat</p>
              <p className="text-xs font-semibold text-foreground">Standard Economy</p>
            </div>
          </div>
        </div>
      </div>

      {
    /* Legend */
  }
      <div className="flex flex-wrap items-center justify-center gap-6 py-3 bg-background rounded-2xl text-xs font-medium text-muted mb-8 border border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-surface border border-border shadow-2xs" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
            ✓
          </div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-surface-muted border border-border text-muted flex items-center justify-center text-[10px]">
            ✕
          </div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center text-[10px] font-bold">
            ★
          </div>
          <span>Extra Legroom</span>
        </div>
      </div>

      {
    /* Aircraft Fuselage Representation */
  }
      <div
    ref={cabinRef}
    className="max-w-md mx-auto bg-surface-muted/70 p-6 rounded-3xl border-2 border-border relative mb-8"
  >
        {
    /* Cockpit Curve */
  }
        <div className="text-center pb-4 mb-4 border-b border-border">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted text-muted text-[11px] font-bold uppercase tracking-wider">
            <Plane size={14} className="-rotate-45" /> Front of Aircraft (Cockpit)
          </div>
        </div>

        {
    /* Seat grid */
  }
        <div className="space-y-2">
          {rows.map((row) => <div key={row.num} className="flex items-center justify-between gap-1 text-xs">
              <span className="w-6 text-center font-bold text-muted font-mono text-[11px]">
                {row.num}
              </span>

              <div className="flex items-center gap-1.5 flex-1 justify-center">
                {row.letters.map((letter, i) => {
    if (letter === "") {
      return <div key={i} className="w-6 text-center text-muted text-[10px] font-mono">||</div>;
    }
    const seatCode = `${row.num}${letter}`;
    const isOccupied = occupiedSeats.has(seatCode);
    const isSelected = currentSeat === seatCode;
    const isExtraLegroom = row.type === "economy-extra";
    const isWindow = letter === "A" || letter === "F";
    const isAisle = letter === "C" || letter === "D";
    const seatFeature = isWindow ? "Window" : isAisle ? "Aisle" : "Middle";
    return <button
      key={seatCode}
      disabled={isOccupied}
      aria-label={`Seat ${seatCode}, ${seatFeature}, ${isOccupied ? "Occupied" : isSelected ? "Selected" : "Available"}`}
      onClick={(e) => handleSeatClick(seatCode, e)}
      className={`seat-item-btn w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? "bg-primary text-white shadow-md scale-105 ring-2 ring-primary/40" : isOccupied ? "bg-surface-muted text-muted border border-border" : isExtraLegroom ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300" : "bg-surface hover:bg-primary/10 text-foreground border border-border shadow-2xs hover:border-primary"}`}
      title={`Seat ${seatCode} (${seatFeature}) ${isOccupied ? "- Occupied" : ""}`}
    >
                      {isSelected ? <Check size={14} /> : isOccupied ? "\u2715" : letter}
                    </button>;
  })}
              </div>
            </div>)}
        </div>

        {
    /* Rear Exit */
  }
        <div className="text-center pt-4 mt-4 border-t border-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Rear Galley & Restrooms
          </span>
        </div>
      </div>

      {
    /* Navigation Buttons */
  }
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
    type="button"
    variant="secondary"
    onClick={() => dispatch(setBookingStep(1))}
    className="flex items-center gap-2"
  >
          <ArrowLeft size={16} /> Back to Passengers
        </Button>

        <Button
    type="button"
    variant="accent"
    size="lg"
    onClick={handleConfirm}
    className="px-8 font-bold"
  >
          Confirm Seat ({currentSeat}) & Continue →
        </Button>
      </div>
    </div>;
};
var stdin_default = SeatMapStep;
export {
  SeatMapStep,
  stdin_default as default
};
