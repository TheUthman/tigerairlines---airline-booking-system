import { useEffect, useRef, useState } from "react";
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
import { bookingService, flightService, passengerService } from "../services";
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
  const [downloadError, setDownloadError] = useState("");
  const [detailsWarning, setDetailsWarning] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    setDetailsWarning("");

    const enrichBooking = async (reservation) => {
      const passengerName =
        reservation?.passengerName ||
        [reservation?.passenger?.firstName, reservation?.passenger?.lastName]
          .filter(Boolean)
          .join(" ");
      const shouldLoadFlight =
        reservation?.flightId &&
        (!reservation.flightNumber ||
          !reservation.origin ||
          !reservation.destination ||
          !reservation.departureDate ||
          !reservation.departureTime);
      const shouldLoadPassenger = reservation?.passengerId && !passengerName;
      const lookups = await Promise.allSettled([
        shouldLoadFlight
          ? flightService.getFlightById(reservation.flightId)
          : Promise.resolve(null),
        shouldLoadPassenger
          ? passengerService.getPassengerById(reservation.passengerId)
          : Promise.resolve(null),
      ]);
      const flightResult = lookups[0];
      const passengerResult = lookups[1];
      const flightDetails =
        flightResult.status === "fulfilled" ? flightResult.value?.data : null;
      const passengerDetails =
        passengerResult.status === "fulfilled"
          ? passengerResult.value?.data
          : null;
      const lookupFailed = lookups.some(
        (result) => result.status === "rejected",
      );

      if (lookupFailed && isActive) {
        setDetailsWarning(
          "Some reservation details could not be loaded. Please refresh to try again.",
        );
      }

      return {
        ...reservation,
        ...(flightDetails ? { flightDetails } : {}),
        ...(passengerDetails ? { passenger: passengerDetails } : {}),
      };
    };

    const loadBooking = async () => {
      if (storeBooking) {
        const enriched = await enrichBooking(storeBooking);
        if (isActive) {
          setBooking(enriched);
          setLoading(false);
        }
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
        const enriched = result ? await enrichBooking(result) : null;
        if (isActive) setBooking(enriched);
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

  useEffect(() => {
    if (!booking?.id || booking.status !== "PENDING_PAYMENT") return undefined;

    let isActive = true;
    let timerId;
    let attempts = 0;
    const pollBookingStatus = async () => {
      attempts += 1;
      try {
        const response = await bookingService.getBookingById(booking.id);
        const latestBooking = response?.data;
        if (!isActive) return;
        if (latestBooking?.status && latestBooking.status !== "PENDING_PAYMENT") {
          setBooking((current) => ({ ...current, ...latestBooking }));
          setDetailsWarning("");
          return;
        }
      } catch {
        if (isActive) {
          setDetailsWarning("We could not refresh the reservation status yet.");
        }
      }

      if (isActive && attempts < 20) {
        timerId = window.setTimeout(pollBookingStatus, 1000);
      }
    };

    timerId = window.setTimeout(pollBookingStatus, 500);
    return () => {
      isActive = false;
      window.clearTimeout(timerId);
    };
  }, [booking?.id, booking?.status]);

  const isConfirmed = ["CONFIRMED", "CHECKED_IN"].includes(booking?.status);
  const isCancelled = booking?.status === "CANCELLED";
  const paymentSucceeded = booking?.paymentStatus === "SUCCEEDED";
  const flightDetails = booking?.flightDetails || booking?.flight || {};
  const passengerDetails =
    booking?.passenger || booking?.passengers?.[0] || {};
  const getAirportCode = (airport) =>
    typeof airport === "string" ? airport : airport?.code || "";
  const passengerName =
    booking?.passengerName ||
    [passengerDetails.firstName, passengerDetails.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Passenger details unavailable";
  const flightNumber =
    booking?.flightNumber ||
    flightDetails.flightNumber ||
    (booking?.flightId ? `Flight ${booking.flightId}` : "Flight details unavailable");
  const origin = booking?.origin || getAirportCode(flightDetails.origin);
  const destination =
    booking?.destination || getAirportCode(flightDetails.destination);
  const departureDate =
    booking?.departureDate || flightDetails.departureDate || "Date unavailable";
  const departureTime =
    booking?.departureTime || flightDetails.departureTime || "Time unavailable";
  const totalAmount = booking?.totalAmount ?? booking?.amount;

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    setDownloadSuccess(false);
    setDownloadError("");
    setIsDownloading(true);
    try {
      if (!ticketRef.current) {
        throw new Error("The boarding pass is not available to export.");
      }
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const ticketX = margin;
      const ticketY = 24;
      const ticketWidth = pageWidth - margin * 2;
      const ticketHeight = pageHeight - 48;
      const stubWidth = 66;
      const mainWidth = ticketWidth - stubWidth;
      const primary = [242, 140, 40];
      const ink = [35, 35, 35];
      const muted = [102, 102, 102];
      const border = [229, 229, 226];
      const white = [255, 255, 255];
      const passengerFullName = passengerName || "Passenger details unavailable";
      const cabin = booking.cabinClass || "Economy";
      const status = isConfirmed ? "CONFIRMED" : booking.status || "PENDING";

      pdf.setFillColor(...white);
      pdf.setDrawColor(...border);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(ticketX, ticketY, ticketWidth, ticketHeight, 5, 5, "FD");

      pdf.setFillColor(...primary);
      pdf.roundedRect(ticketX, ticketY, ticketWidth, 20, 5, 5, "F");
      pdf.rect(ticketX, ticketY + 10, ticketWidth, 10, "F");
      pdf.setTextColor(...ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("TigerAirlines", ticketX + 8, ticketY + 9);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        isConfirmed ? "BOARDING PASS" : "RESERVATION SUMMARY",
        ticketX + 8,
        ticketY + 15,
      );
      pdf.setFont("helvetica", "bold");
      pdf.text(`BOOKING REF  ${booking.pnr || "Pending"}`, ticketX + ticketWidth - 8, ticketY + 12, {
        align: "right",
      });

      const left = ticketX + 9;
      const right = ticketX + mainWidth - 9;
      const contentTop = ticketY + 31;
      const drawLabel = (text, x, y) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(...muted);
        pdf.text(text.toUpperCase(), x, y);
      };
      const drawValue = (text, x, y, size = 11, color = ink, width = 74) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        pdf.text(pdf.splitTextToSize(String(text || "Not available"), width), x, y);
      };

      drawLabel("Passenger name", left, contentTop);
      drawValue(passengerFullName.toUpperCase(), left, contentTop + 6, 12);
      drawLabel("Flight", left + 94, contentTop);
      drawValue(flightNumber, left + 94, contentTop + 6, 10, primary, 52);
      drawLabel("Cabin", left + 154, contentTop);
      drawValue(`${cabin} Class`, left + 154, contentTop + 6, 9, ink, 44);

      const routeY = contentTop + 29;
      pdf.setFillColor(247, 247, 245);
      pdf.roundedRect(left - 3, routeY - 8, mainWidth - 18, 37, 3, 3, "F");
      drawLabel("From", left + 3, routeY);
      drawValue(origin || "---", left + 3, routeY + 10, 24, primary);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text(flightDetails.origin?.city || flightDetails.origin?.name || "", left + 3, routeY + 16);
      drawLabel("To", left + 110, routeY);
      drawValue(destination || "---", left + 110, routeY + 10, 24, primary);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text(flightDetails.destination?.city || flightDetails.destination?.name || "", left + 110, routeY + 16);
      pdf.setDrawColor(...primary);
      pdf.setLineWidth(0.7);
      pdf.line(left + 44, routeY + 7, left + 100, routeY + 7);
      pdf.setFillColor(...primary);
      pdf.circle(left + 44, routeY + 7, 1.2, "F");
      pdf.circle(left + 100, routeY + 7, 1.2, "F");

      const detailsY = routeY + 41;
      drawLabel("Date", left, detailsY);
      drawValue(departureDate, left, detailsY + 7, 8, ink, 43);
      drawLabel("Departure", left + 47, detailsY);
      drawValue(departureTime, left + 47, detailsY + 7, 8, ink, 43);
      drawLabel("Seat", left + 94, detailsY);
      drawValue(booking.seatNumber || "To be assigned", left + 94, detailsY + 7, 9, primary, 46);
      drawLabel("Total", left + 144, detailsY);
      drawValue(
        totalAmount === undefined ? "Unavailable" : formatNaira(Number(totalAmount)),
        left + 144,
        detailsY + 7,
        9,
        ink,
        48,
      );

      const stubX = ticketX + mainWidth;
      pdf.setDrawColor(...border);
      pdf.setLineDash([1.5, 1.5], 0);
      pdf.line(stubX, ticketY + 23, stubX, ticketY + ticketHeight - 6);
      pdf.setLineDash([], 0);
      pdf.setTextColor(...primary);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(isConfirmed ? "BOARDING STUB" : "RESERVATION", stubX + stubWidth / 2, ticketY + 34, {
        align: "center",
      });
      drawLabel("Passenger", stubX + 8, ticketY + 47);
      pdf.setTextColor(...ink);
      pdf.setFontSize(9);
      pdf.text(
        pdf.splitTextToSize(passengerFullName, stubWidth - 16),
        stubX + 8,
        ticketY + 54,
      );
      drawLabel("Flight / seat", stubX + 8, ticketY + 68);
      pdf.setTextColor(...ink);
      pdf.setFontSize(9);
      pdf.text(`${flightNumber} / ${booking.seatNumber || "TBA"}`, stubX + 8, ticketY + 75);
      drawLabel("Status", stubX + 8, ticketY + 88);
      pdf.setFillColor(...(isConfirmed ? [22, 123, 73] : primary));
      pdf.roundedRect(stubX + 8, ticketY + 92, stubWidth - 16, 9, 2, 2, "F");
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(status, stubX + stubWidth / 2, ticketY + 98, { align: "center" });

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        isConfirmed
          ? "Please present this pass and valid identification at the airport."
          : "Not valid for boarding until confirmed.",
        ticketX + 8,
        ticketY + ticketHeight - 5,
      );
      const safePnr = String(booking.pnr || booking.id || "reservation").replace(
        /[^a-zA-Z0-9_-]/g,
        "",
      );
      pdf.save(`tigerairlines-ticket-${safePnr}.pdf`);
      setDownloadSuccess(true);
      window.setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error("Ticket PDF download failed", error);
      setDownloadError(
        error instanceof Error
          ? `Unable to generate the ticket PDF: ${error.message}`
          : "Unable to generate the ticket PDF. Please try printing it instead.",
      );
    } finally {
      setIsDownloading(false);
    }
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
                    : paymentSucceeded
                      ? "Payment successful"
                      : "Payment request received"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isConfirmed
                  ? "Your booking is confirmed"
                  : isCancelled
                    ? "This booking was cancelled"
                    : paymentSucceeded
                      ? "Your booking is being confirmed"
                      : "We’re confirming your payment"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {isConfirmed
                  ? "Your reservation is confirmed. Your boarding pass is ready below."
                  : isCancelled
                    ? "This reservation is no longer active. Contact the airline if you need help with a refund update."
                    : paymentSucceeded
                      ? booking.paymentSimulated
                        ? "Test payment succeeded. No money was charged. We’re waiting for the booking service to finish confirming your reservation."
                        : "Your payment succeeded. We’re waiting for the booking service to finish confirming your reservation."
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
            {paymentSucceeded && !isConfirmed
              ? "PAYMENT SUCCEEDED · CONFIRMING BOOKING"
              : booking.status || "Status unavailable"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem label="Passenger" value={passengerName} />
          <SummaryItem label="Flight" value={flightNumber} mono />
          <SummaryItem
            label="Route"
            value={
              origin && destination
                ? `${origin} → ${destination}`
                : "Route details unavailable"
            }
          />
          <SummaryItem label="Date" value={departureDate} />
          <SummaryItem label="Departure" value={departureTime} />
          <SummaryItem label="Seat" value={booking.seatNumber || "Assigned after confirmation"} mono />
          {totalAmount !== undefined && (
            <SummaryItem label="Total" value={formatNaira(totalAmount)} strong />
          )}
        </div>
        {detailsWarning && (
          <p className="mt-4 text-sm text-warning" role="status">
            {detailsWarning}
          </p>
        )}
      </section>

      {isConfirmed && (
        <div
          id="boarding-pass-print-area"
          ref={ticketRef}
          className="boarding-pass-print-target mx-auto w-full max-w-6xl"
        >
          <BoardingPass booking={booking} />
        </div>
      )}

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
              <Button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
              >
                <Download size={15} aria-hidden="true" />
                {isDownloading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            </>
          )}
        </div>
      </div>

      {downloadError && (
        <p className="text-sm text-danger" role="alert">
          {downloadError}
        </p>
      )}
      {downloadSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
        >
          Ticket PDF for {booking.pnr} downloaded successfully.
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
