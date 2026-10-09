import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const StaffCheckInGuidancePage = () => (
  <div className="mx-auto max-w-3xl space-y-6 py-4">
    <header>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Service desk
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Staff check-in
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Find a booking by its reference and record check-in for a confirmed
        traveler. Staff counter check-in is not limited by the online check-in
        window.
      </p>
    </header>

    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-bold">Check-in a traveler</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Search using the traveler’s booking reference. Only confirmed bookings
        can be checked in; the check-in status and time are saved to the booking
        record.
      </p>
      <Link
        to="/staff/bookings"
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-on-primary hover:bg-primary-hover"
      >
        <CheckCircle2 size={15} aria-hidden="true" />
        Verify a booking
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </section>
  </div>
);

export { StaffCheckInGuidancePage };
export default StaffCheckInGuidancePage;
