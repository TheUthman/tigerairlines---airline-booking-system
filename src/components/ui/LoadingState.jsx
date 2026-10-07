import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const FullPageLoader = ({ label = "Loading your account..." }) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted"
    role="status"
    aria-live="polite"
  >
    <LoaderCircle size={30} className="animate-spin text-primary" />
    <span className="text-sm font-semibold">{label}</span>
  </div>
);

const LoadingOverlay = ({ label = "Please wait..." }) => (
  <div
    className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm"
    role="status"
    aria-live="assertive"
  >
    <LoaderCircle size={34} className="animate-spin text-primary" />
    <span className="text-sm font-bold text-foreground">{label}</span>
  </div>
);

const RouteProgress = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(timeout);
  }, [location.key]);

  return visible ? (
    <div
      className="route-progress"
      role="progressbar"
      aria-label="Loading page"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext="Page loading"
    />
  ) : null;
};

const BookingProgress = ({ activeStep }) => {
  const steps = ["Flight", "Passenger", "Seats", "Extras", "Review", "Payment"];
  const currentStep = Math.min(Math.max(activeStep, 1), steps.length);
  const progress = Math.round((currentStep / steps.length) * 100);

  return (
    <section className="mb-7" aria-label="Booking progress">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Step {currentStep} of {steps.length}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {steps[currentStep - 1]}
          </p>
        </div>
        <span className="text-sm font-medium tabular-nums text-muted">
          {progress}% complete
        </span>
      </div>
      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Booking steps">
        {steps.map((step, index) => {
          const isComplete = index + 1 < currentStep;
          const isCurrent = index + 1 === currentStep;
          return (
            <li key={step} className="min-w-0">
              <div
                aria-current={isCurrent ? "step" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-xl border px-2 py-2 sm:flex-col sm:justify-center sm:gap-1 sm:px-1 ${
                  isCurrent
                    ? "border-primary/40 bg-primary-soft text-primary-dark dark:text-primary"
                    : isComplete
                      ? "border-success/20 bg-success/5 text-success"
                      : "border-border bg-surface text-muted"
                }`}
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold tabular-nums sm:h-7 sm:w-7">
                  {isComplete ? <Check size={14} aria-hidden="true" /> : index + 1}
                </span>
                <span className="truncate text-[11px] font-medium sm:text-xs">
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <div
        className="sr-only"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={`${progress}% of booking complete`}
      />
    </section>
  );
};

export { BookingProgress, FullPageLoader, LoadingOverlay, RouteProgress };
