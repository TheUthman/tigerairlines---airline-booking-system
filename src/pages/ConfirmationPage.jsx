import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Home,
  Printer,
  XCircle,
} from "lucide-react";
import BoardingPass from "../features/ticket/BoardingPass";
import Button from "../components/ui/Button";
import bookingService from "../services/bookingService";
import { useAppSelector } from "../app/store";
import { formatNaira } from "../utils/formatNaira";

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pnrQuery = searchParams.get("pnr");
  const storeBooking = useAppSelector((state) => state.booking.confirmedBooking);
  const [booking, setBooking] = useState(storeBooking);
  const [loading, setLoading] = useState(!storeBooking);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadBooking = async () => {
      if (storeBooking) {
        setBooking(storeBooking);
        setLoading(false);
        return;
      }

      try {
        const response = pnrQuery
          ? await bookingService.getBookingByPnr(pnrQuery)
          : await bookingService.getBookings();
        const result = pnrQuery
          ? response?.data
          : Array.isArray(response?.data)
            ? response.data[0]
            : null;
        if (isActive) setBooking(result || null);
      } catch {
        if (isActive) setBooking(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadBooking();
    return () => {
      isActive = false;
    };
  }, [storeBooking, pnrQuery]);

  const isConfirmed = booking?.status === "CONFIRMED";
  const isCancelled = booking?.status === "CANCELLED";
  const passengerName =
    booking?.passengerName ||
    [booking?.passengers?.[0]?.firstName, booking?.passengers?.[0]?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Passenger";
  const totalAmount = booking?.totalAmount ?? booking?.amount;

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    window.setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (loading) {
    return (
      <main className="flex min-h-[55vh] items-center justify-center bg-background px-4 py-16">
        <div className="text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted">
            Retrieving your booking details…
          </p>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="page-container flex min-h-[55vh] items-center justify-center py-16">
        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Booking not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We could not retrieve this reservation. Check the reference and try again.
          </p>
          <Button className="mt-5" onClick={() => navigate("/")}>
            Return to homepage
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container space-y-6 py-8 md:py-10">
      <section
        role="status"
        aria-live="polite"
        className={`rounded-2xl border p-5 sm:p-7 ${
          isConfirmed
            ? "border-success/20 bg-success/5"
            : isCancelled
              ? "border-danger/20 bg-danger/5"
              : "border-warning/25 bg-warning/5"
        }`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isConfirmed
                  ? "bg-success/10 text-success"
                  : isCancelled
                    ? "bg-danger/10 text-danger"
                    : "bg-warning/10 text-warning"
              }`}
            >
              {isConfirmed ? (
                <CheckCircle2 size={25} aria-hidden="true" />
              ) : isCancelled ? (
                <XCircle size={25} aria-hidden="true" />
              ) : (
                <Clock3 size={25} aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {isConfirmed
                  ? "Reservation complete"
                  : isCancelled
                    ? "Reservation update"
                    : "Payment request received"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isConfirmed
                  ? "Your booking is confirmed"
                  : isCancelled
                    ? "This booking was cancelled"
                    : "We’re confirming your payment"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {isConfirmed
                  ? "Your reservation is confirmed. Your boarding pass is ready below."
                  : isCancelled
                    ? "This reservation is no longer active. Contact the airline if you need help with a refund update."
                    : "Your payment request has been submitted. We’ll show your boarding pass here once the payment provider confirms the booking."}
              </p>
            </div>
          </div>

          <div className="w-fit rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-[11px] font-medium text-muted">Booking reference</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wide text-primary">
              {booking.pnr || "Pending"}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="reservation-summary-title"
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Itinerary
            </p>
            <h2 id="reservation-summary-title" className="mt-1 text-lg font-semibold text-foreground">
              Reservation summary
            </h2>
          </div>
          <span className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
            {booking.status || "Status unavailable"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem label="Passenger" value={passengerName} />
          <SummaryItem label="Flight" value={booking.flightNumber || "—"} mono />
          <SummaryItem label="Route" value={`${booking.origin || "—"} → ${booking.destination || "—"}`} />
          <SummaryItem label="Date" value={booking.departureDate || "—"} />
          <SummaryItem label="Departure" value={booking.departureTime || "—"} />
          <SummaryItem label="Seat" value={booking.seatNumber || "Assigned after confirmation"} mono />
          {totalAmount !== undefined && (
            <SummaryItem label="Total" value={formatNaira(totalAmount)} strong />
          )}
        </div>
      </section>

      {isConfirmed && <BoardingPass booking={booking} />}

      {!isConfirmed && !isCancelled && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          <Clock3 size={17} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <p>
            You can return to this page using your booking reference to check the latest confirmation status.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center print:hidden">
        <Link
          to="/"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium text-muted transition hover:text-foreground focus-visible:outline-offset-2"
        >
          <Home size={16} aria-hidden="true" /> Return home
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/manage-booking"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline-offset-2"
          >
            View booking <ArrowRight size={15} aria-hidden="true" />
          </Link>
          {isConfirmed && (
            <>
              <Button type="button" variant="outline" onClick={handlePrint}>
                <Printer size={15} aria-hidden="true" /> Print ticket
              </Button>
              <Button type="button" onClick={handleDownloadPdf}>
                <Download size={15} aria-hidden="true" /> Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {downloadSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
        >
          E-ticket PDF for {booking.pnr} downloaded successfully.
        </div>
      )}
    </main>
  );
};

const SummaryItem = ({ label, value, mono = false, strong = false }) => (
  <div className="min-w-0 rounded-xl border border-border bg-background px-4 py-3">
    <p className="text-xs font-medium text-muted">{label}</p>
    <p
      className={`mt-1 break-words text-sm ${strong ? "font-semibold text-foreground" : "font-medium text-foreground"} ${mono ? "font-mono" : ""}`}
    >
      {value}
    </p>
  </div>
);

export { ConfirmationPage };
export default ConfirmationPage;
