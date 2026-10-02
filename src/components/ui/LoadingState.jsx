import { LoaderCircle } from "lucide-react";
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
  const progress = Math.round((activeStep / steps.length) * 100);

  return (
    <div className="mb-6" aria-label="Booking progress">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold text-foreground">
          {steps[activeStep - 1]}
        </span>
        <span className="font-mono text-muted">
          Step {activeStep} of {steps.length}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={`${progress}% of booking complete`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export { BookingProgress, FullPageLoader, LoadingOverlay, RouteProgress };
