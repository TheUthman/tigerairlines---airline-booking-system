import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Download, Printer, Home } from "lucide-react";
import BoardingPass from "../features/ticket/BoardingPass";
import Button from "../components/ui/Button";
import bookingService from "../services/bookingService";
import { useAppSelector } from "../app/store";
const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pnrQuery = searchParams.get("pnr");
  const storeBooking = useAppSelector((state) => state.booking.confirmedBooking);
  const [booking, setBooking] = useState(storeBooking);
  const [loading, setLoading] = useState(!storeBooking);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  useEffect(() => {
    if (!storeBooking && pnrQuery) {
      bookingService.getBookingByPnr(pnrQuery).then((res) => {
        if (res.data) setBooking(res.data);
        setLoading(false);
      });
    } else if (!storeBooking && !pnrQuery) {
      bookingService.getBookings().then((res) => {
        if (res.data && res.data.length > 0) setBooking(res.data[0]);
        setLoading(false);
      });
    }
  }, [storeBooking, pnrQuery]);
  const handlePrint = () => {
    window.print();
  };
  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3e3);
  };
  if (loading) {
    return <div className="bg-background flex items-center justify-center py-24 px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted">Generating your boarding pass...</p>
        </div>
      </div>;
  }
  if (!booking) {
    return <div className="bg-background flex items-center justify-center py-24 px-4">
        <div className="bg-surface p-8 rounded-2xl text-center max-w-md shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-2">Booking Not Found</h2>
          <p className="text-xs text-muted mb-4">We could not retrieve this reservation.</p>
          <Button onClick={() => navigate("/")}>Return to Homepage</Button>
        </div>
      </div>;
  }
  return <div className="bg-background py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {
    /* Success Header banner */
  }
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 rounded-3xl p-6 md:p-8 text-center print:hidden">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950 dark:text-emerald-100">
            Booking Confirmed & Ticket Issued!
          </h1>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1 max-w-md mx-auto">
            Your e-ticket and official boarding pass have been confirmed. A confirmation email has been dispatched.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700/50 shadow-xs">
            <span className="text-xs text-muted font-medium">Booking Reference (PNR):</span>
            <span className="text-sm font-mono font-black text-primary">{booking.pnr}</span>
          </div>
        </div>

        {
    /* Boarding Pass Component */
  }
        <BoardingPass booking={booking} />

        {
    /* Action Buttons */
  }
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden pt-2">
          <Link
    to="/"
    className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground"
  >
            <Home size={15} /> Return to Homepage
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Button
    type="button"
    variant="outline"
    onClick={handlePrint}
    className="flex items-center gap-2"
  >
              <Printer size={15} /> Print Ticket
            </Button>

            <Button
    type="button"
    variant="primary"
    onClick={handleDownloadPdf}
    className="flex items-center gap-2 font-bold"
  >
              <Download size={15} /> Download PDF Boarding Pass
            </Button>
          </div>
        </div>

        {downloadSuccess && <div className="bg-surface text-foreground border border-border text-xs py-3 px-5 rounded-xl text-center shadow-lg animate-in fade-in">
            ✓ E-Ticket PDF for {booking.pnr} downloaded successfully!
          </div>}
      </div>
    </div>;
};
var stdin_default = ConfirmationPage;
export {
  ConfirmationPage,
  stdin_default as default
};
