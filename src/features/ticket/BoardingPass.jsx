import { Plane, Luggage } from "lucide-react";
const BoardingPass = ({ booking }) => {
  const passenger = booking.passengers[0] || {
    firstName: "Chukwuemeka",
    lastName: "Obi",
    passportNumber: "A10293847",
    ticketNumber: "075-8910245190"
  };
  return <div className="bg-surface rounded-3xl shadow-xl overflow-hidden border border-border text-foreground font-sans print:shadow-none print:border-border">
      {
    /* Top Banner */
  }
      <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-surface text-primary flex items-center justify-center font-black">
            <Plane size={15} className="-rotate-45" />
          </div>
          <span className="font-black text-lg tracking-tight">TigerAirlines</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-white/80 block">Boarding Pass</span>
          <span className="font-mono text-sm font-bold text-secondary">{booking.cabinClass} Class</span>
        </div>
      </div>

      {
    /* Main Stub and Perforated Tear-off layout */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-2 divide-dashed divide-border">
        {
    /* Left Side: Full Ticket Info (8 cols) */
  }
        <div className="lg:col-span-8 p-6 md:p-8 space-y-6">
          {
    /* Passenger & Booking Code */
  }
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-border">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Passenger Name</p>
              <p className="text-sm font-extrabold text-foreground uppercase">
                {passenger.firstName} {passenger.lastName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">PNR / Booking Ref</p>
              <p className="text-base font-black text-primary font-mono">{booking.pnr}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">E-Ticket No.</p>
              <p className="text-xs font-mono text-foreground">{passenger.ticketNumber}</p>
            </div>
          </div>

          {
    /* Route Graphics */
  }
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-foreground leading-none">
                {booking.origin.split(" ")[1]?.replace("(", "").replace(")", "") || "LOS"}
              </p>
              <p className="text-xs font-bold text-muted mt-1">
                {booking.origin.split(" ")[0] || "Lagos"}
              </p>
            </div>

            <div className="flex-1 px-8 text-center">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {booking.flightNumber}
              </span>
              <div className="relative flex items-center my-2">
                <div className="w-full border-t-2 border-dashed border-border" />
                <Plane size={16} className="text-primary mx-auto absolute left-1/2 -top-2 -translate-x-1/2" />
              </div>
              <span className="text-[10px] text-muted uppercase tracking-wider">Confirmed</span>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-foreground leading-none">
                {booking.destination.split(" ")[1]?.replace("(", "").replace(")", "") || "ABV"}
              </p>
              <p className="text-xs font-bold text-muted mt-1">
                {booking.destination.split(" ")[0] || "Abuja"}
              </p>
            </div>
          </div>

          {
    /* Departure & Gate Details Grid */
  }
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-background p-4 rounded-2xl border border-border">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Date</p>
              <p className="text-xs font-bold text-foreground">{booking.departureDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Boarding Time</p>
              <p className="text-sm font-black text-primary">07:45 AM</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Gate</p>
              <p className="text-base font-black text-foreground">B2</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Seat</p>
              <p className="text-xl font-black text-primary leading-none">{booking.seatNumber}</p>
            </div>
          </div>

          {
    /* Baggage & Meal tags */
  }
          <div className="flex items-center gap-6 text-xs text-muted pt-2">
            <span className="flex items-center gap-1.5">
              <Luggage size={14} className="text-primary" /> {booking.extras?.baggageKg || 20} kg Checked Baggage
            </span>
            <span>Meal: {booking.extras?.mealPreference || "Standard Meal"}</span>
            {booking.extras?.priorityBoarding && <span className="text-secondary font-bold">Priority Group 1</span>}
          </div>
        </div>

        {
    /* Right Side: Perforated Boarding Stub (4 cols) */
  }
        <div className="lg:col-span-4 p-6 bg-background/60 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <p className="text-xs font-black text-primary uppercase tracking-wider">Boarding Stub</p>
            <p className="text-sm font-bold text-foreground mt-1 uppercase">
              {passenger.firstName} {passenger.lastName}
            </p>
            <p className="text-xs font-mono text-muted">{booking.flightNumber} • {booking.seatNumber}</p>

            <div className="flex justify-between items-center bg-surface p-2.5 rounded-xl border border-border my-4 text-xs font-bold">
              <div>
                <span className="text-[9px] text-muted block uppercase">Gate</span>
                <span>B2</span>
              </div>
              <div>
                <span className="text-[9px] text-muted block uppercase">Boarding</span>
                <span className="text-primary">07:45</span>
              </div>
              <div>
                <span className="text-[9px] text-muted block uppercase">Zone</span>
                <span>1</span>
              </div>
            </div>
          </div>

          {
    /* Mock QR Code Graphic */
  }
          <div className="my-2 p-3 bg-surface rounded-2xl border border-border shadow-xs flex flex-col items-center">
            {
    /* SVG simulated high-density QR code */
  }
            <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" fill="white" />
              {
    /* Corner 1 */
  }
              <rect x="5" y="5" width="26" height="26" fill="#1e293b" rx="4" />
              <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
              <rect x="13" y="13" width="10" height="10" fill="#E87516" rx="1" />
              {
    /* Corner 2 */
  }
              <rect x="69" y="5" width="26" height="26" fill="#1e293b" rx="4" />
              <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
              <rect x="77" y="13" width="10" height="10" fill="#E87516" rx="1" />
              {
    /* Corner 3 */
  }
              <rect x="5" y="69" width="26" height="26" fill="#1e293b" rx="4" />
              <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
              <rect x="13" y="77" width="10" height="10" fill="#E87516" rx="1" />
              {
    /* Data matrix dots */
  }
              <rect x="36" y="8" width="6" height="6" fill="#1e293b" />
              <rect x="48" y="12" width="6" height="6" fill="#1e293b" />
              <rect x="36" y="24" width="6" height="6" fill="#1e293b" />
              <rect x="12" y="38" width="6" height="6" fill="#1e293b" />
              <rect x="24" y="44" width="6" height="6" fill="#1e293b" />
              <rect x="38" y="38" width="6" height="6" fill="#1e293b" />
              <rect x="48" y="46" width="6" height="6" fill="#1e293b" />
              <rect x="58" y="38" width="6" height="6" fill="#1e293b" />
              <rect x="68" y="46" width="6" height="6" fill="#1e293b" />
              <rect x="80" y="38" width="6" height="6" fill="#1e293b" />
              <rect x="38" y="58" width="6" height="6" fill="#1e293b" />
              <rect x="48" y="68" width="6" height="6" fill="#1e293b" />
              <rect x="58" y="58" width="6" height="6" fill="#1e293b" />
              <rect x="68" y="68" width="6" height="6" fill="#1e293b" />
              <rect x="78" y="58" width="6" height="6" fill="#1e293b" />
              <rect x="38" y="78" width="6" height="6" fill="#1e293b" />
              <rect x="58" y="78" width="6" height="6" fill="#1e293b" />
              <rect x="78" y="78" width="6" height="6" fill="#1e293b" />
            </svg>
            <span className="text-[10px] font-mono text-muted mt-1">Scan at Gate B2</span>
          </div>

          <p className="text-[10px] text-muted mt-2">
            Please be at the boarding gate 40 minutes before departure.
          </p>
        </div>
      </div>
    </div>;
};
var stdin_default = BoardingPass;
export {
  BoardingPass,
  stdin_default as default
};
