import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Grid, PlusCircle, CheckSquare } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { setBookingStep } from "../features/booking/bookingSlice";
import PassengerStep from "../features/booking/PassengerStep";
import SeatMapStep from "../features/booking/SeatMapStep";
import ExtrasStep from "../features/booking/ExtrasStep";
import ReviewStep from "../features/booking/ReviewStep";
import flightService from "../services/flightService";
import { selectFlight } from "../features/booking/bookingSlice";
const BookingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.booking.currentStep);
  const selectedFlight = useAppSelector((state) => state.booking.selectedFlight);
  const stepContentRef = useRef(null);
  const prevStepRef = useRef(currentStep);
  useGSAP(() => {
    if (stepContentRef.current) {
      const direction = currentStep >= prevStepRef.current ? 1 : -1;
      prevStepRef.current = currentStep;
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, x: direction * 28 },
        { opacity: 1, x: 0, duration: 0.32, ease: "power2.out" }
      );
    }
  }, [currentStep]);
  useEffect(() => {
    if (!selectedFlight) {
      flightService.getFlights().then((res) => {
        if (res.data && res.data.length > 0) {
          dispatch(selectFlight(res.data[0]));
        }
      });
    }
  }, [selectedFlight, dispatch]);
  const steps = [
    { number: 1, label: "Passengers", icon: <User size={16} /> },
    { number: 2, label: "Seat Selection", icon: <Grid size={16} /> },
    { number: 3, label: "Add-ons & Extras", icon: <PlusCircle size={16} /> },
    { number: 4, label: "Review & Confirm", icon: <CheckSquare size={16} /> }
  ];
  return <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {
    /* Stepper Header */
  }
        <div className="bg-surface rounded-2xl p-4 md:p-6 shadow-sm border border-border mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s) => {
    const isCompleted = currentStep > s.number;
    const isCurrent = currentStep === s.number;
    return <button
      key={s.number}
      disabled={s.number > currentStep}
      onClick={() => dispatch(setBookingStep(s.number))}
      className={`flex items-center gap-3 p-2 rounded-xl transition text-left cursor-pointer disabled:cursor-not-allowed ${isCurrent ? "bg-primary/10 text-primary font-bold" : isCompleted ? "text-emerald-700 font-semibold" : "text-muted opacity-60"}`}
    >
                  <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent ? "bg-primary text-white shadow-xs" : isCompleted ? "bg-emerald-600 text-white" : "bg-surface-muted text-muted"}`}
    >
                    {isCompleted ? "\u2713" : s.number}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block opacity-75">
                      Step {s.number}
                    </span>
                    <span className="text-xs truncate block">{s.label}</span>
                  </div>
                </button>;
  })}
          </div>
        </div>

        {
    /* Step Body with GSAP animated transition wrapper */
  }
        <div ref={stepContentRef}>
          {currentStep === 1 && <PassengerStep />}
          {currentStep === 2 && <SeatMapStep />}
          {currentStep === 3 && <ExtrasStep />}
          {currentStep === 4 && <ReviewStep />}
        </div>
      </div>
    </div>;
};
var stdin_default = BookingPage;
export {
  BookingPage,
  stdin_default as default
};
