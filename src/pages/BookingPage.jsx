import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Grid, PlusCircle, CheckSquare, Check, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { setBookingStep, selectFlight } from "../features/booking/bookingSlice";
import PassengerStep from "../features/booking/PassengerStep";
import SeatMapStep from "../features/booking/SeatMapStep";
import ExtrasStep from "../features/booking/ExtrasStep";
import ReviewStep from "../features/booking/ReviewStep";
import BookingSummary from "../features/booking/BookingSummary";
import flightService from "../services/flightService";
import { BookingProgress } from "../components/ui/LoadingState";

const BookingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.booking.currentStep);
  const selectedFlight = useAppSelector(
    (state) => state.booking.selectedFlight,
  );
  const stepContentRef = useRef(null);
  const prevStepRef = useRef(currentStep);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (stepContentRef.current) {
      const direction = currentStep >= prevStepRef.current ? 1 : -1;
      prevStepRef.current = currentStep;
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, x: direction * 20 },
        { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" },
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
    { number: 1, label: "Passengers", icon: <User size={16} aria-hidden="true" /> },
    { number: 2, label: "Seat selection", icon: <Grid size={16} aria-hidden="true" /> },
    { number: 3, label: "Extras", icon: <PlusCircle size={16} aria-hidden="true" /> },
    { number: 4, label: "Review", icon: <CheckSquare size={16} aria-hidden="true" /> },
  ];

  return (
    <main className="min-h-[70vh] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BookingProgress activeStep={currentStep + 1} />

        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Reservation in progress
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Complete your booking
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Add traveler details, select a seat, and review your itinerary before payment.
          </p>
        </header>

        <details className="group mb-5 rounded-2xl border border-border bg-surface shadow-sm lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Booking summary
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                View your itinerary and current fare
              </span>
            </span>
            <ChevronDown size={18} className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="border-t border-border p-3">
            <BookingSummary idPrefix="mobile-booking-summary" />
          </div>
        </details>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="min-w-0 space-y-5">
            <nav
              className="rounded-2xl border border-border bg-surface p-3 shadow-sm"
              aria-label="Booking details steps"
            >
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {steps.map((step) => {
                  const isCompleted = currentStep > step.number;
                  const isCurrent = currentStep === step.number;
                  return (
                    <li key={step.number} className="min-w-0">
                      <button
                        type="button"
                        disabled={step.number > currentStep}
                        aria-current={isCurrent ? "step" : undefined}
                        onClick={() => dispatch(setBookingStep(step.number))}
                        className={`flex min-h-12 w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-55 ${
                          isCurrent
                            ? "border-primary/35 bg-primary-soft text-primary-dark dark:text-primary"
                            : isCompleted
                              ? "border-success/20 bg-success/5 text-success"
                              : "border-border bg-surface text-muted"
                        }`}
                      >
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isCurrent
                              ? "bg-primary text-on-primary"
                              : isCompleted
                                ? "bg-success text-white"
                                : "bg-surface-muted text-muted"
                          }`}
                        >
                          {isCompleted ? <Check size={15} aria-hidden="true" /> : step.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[10px] font-medium uppercase tracking-wide opacity-75">
                            Step {step.number}
                          </span>
                          <span className="block truncate text-xs font-semibold">
                            {step.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div ref={stepContentRef}>
              {currentStep === 1 && <PassengerStep />}
              {currentStep === 2 && <SeatMapStep />}
              {currentStep === 3 && <ExtrasStep />}
              {currentStep === 4 && <ReviewStep />}
            </div>
          </div>

          <aside className="sticky top-28 hidden lg:block" aria-label="Booking summary">
            <BookingSummary idPrefix="desktop-booking-summary" />
          </aside>
        </div>
      </div>
    </main>
  );
};

export { BookingPage };
export default BookingPage;
