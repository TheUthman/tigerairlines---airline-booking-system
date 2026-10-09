import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Plane,
  Tag,
  Sparkles,
} from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../app/store";
import { setConfirmedBooking } from "../features/booking/bookingSlice";
import { bookingService, paymentService, pricingService } from "../services";
import { useToast } from "../components/ui/Toast";
import { BookingProgress, LoadingOverlay } from "../components/ui/LoadingState";
import { getApiErrorMessage } from "../services/apiClient";
import { getBookingPriceBreakdown } from "../features/booking/bookingPricing";

const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const flight = useAppSelector((state) => state.booking.selectedFlight);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const extras = useAppSelector((state) => state.booking.extras);
  const cabinClass = useAppSelector(
    (state) => state.booking.searchParams.cabinClass,
  );
  const passenger = passengers[0] || {};

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [pricingQuote, setPricingQuote] = useState(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [pricingError, setPricingError] = useState("");

  const rawBasePrice = Number(
    flight
      ? cabinClass?.toUpperCase() === "BUSINESS"
        ? flight.businessFare ?? flight.priceBusiness ?? 0
        : flight.fare ?? flight.priceEconomy ?? 0
      : 0,
  );

  // Recalculate dynamic pricing quote with pricingService
  useEffect(() => {
    let isSubscribed = true;
    const calculateDynamicQuote = async () => {
      if (!flight || !passenger.id) {
        setPricingQuote(null);
        setPricingError("");
        setIsCalculatingQuote(false);
        return;
      }

      setPricingQuote(null);
      setPricingError("");
      setIsCalculatingQuote(true);
      try {
        const quoteRes = await pricingService.getQuote({
          flightId: flight.id,
          baseFare: rawBasePrice,
          departureDate: flight.departureDate,
          availableSeats: flight.availableSeats ?? 0,
          totalSeats: flight.totalSeats ?? flight.availableSeats ?? 0,
          cabin: (cabinClass || "ECONOMY").toUpperCase(),
          promoCode: appliedPromo,
          frequentFlyerPoints:
            passenger.frequentFlyerPoints ?? passenger.loyaltyPoints ?? 0,
        });

        const quotedFare = Number(quoteRes?.data?.total);
        if (
          isSubscribed &&
          Number.isFinite(quotedFare) &&
          quotedFare >= 0
        ) {
          setPricingQuote({ ...quoteRes.data, total: quotedFare });
        } else if (isSubscribed) {
          throw new Error("Pricing service returned an invalid fare quote.");
        }
      } catch (err) {
        if (isSubscribed) {
          setPricingError(
            getApiErrorMessage(err, "The fare quote could not be loaded."),
          );
        }
      } finally {
        if (isSubscribed) setIsCalculatingQuote(false);
      }
    };

    calculateDynamicQuote();
    return () => {
      isSubscribed = false;
    };
  }, [
    flight,
    rawBasePrice,
    cabinClass,
    appliedPromo,
    passenger.id,
    passenger.frequentFlyerPoints,
    passenger.loyaltyPoints,
  ]);

  const effectiveBaseFare = pricingQuote?.total ?? 0;
  const {
    baggageCost,
    mealCost,
    insuranceCost,
    priorityCost,
    loungeCost,
    extrasTotal,
    taxesAndFees,
    grandTotal,
  } = getBookingPriceBreakdown({
    flight,
    cabinClass,
    extras,
    quotedBaseFare: effectiveBaseFare,
  });

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    setAppliedPromo(promoCodeInput.trim().toUpperCase());
    toast.info(`Applying promo code ${promoCodeInput.trim().toUpperCase()}...`);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cardNumber: "",
      cardHolder: `${passenger.firstName || ""} ${passenger.lastName || ""}`.trim().toUpperCase(),
      expiryDate: "",
      cvv: "",
    },
  });

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      if (!flight?.id || !passenger?.id) {
        throw new Error("Your flight or passenger details are missing. Return to booking and try again.");
      }
      if (isCalculatingQuote || !pricingQuote) {
        throw new Error(
          pricingError || "Wait for the fare quote before submitting payment.",
        );
      }
      if (
        !Number.isFinite(grandTotal) ||
        grandTotal <= 0 ||
        !Number.isFinite(rawBasePrice) ||
        rawBasePrice <= 0
      ) {
        throw new Error("A valid fare is not available for this flight yet.");
      }
      if (data.cvv === "000") {
        throw new Error(
          "Card declined by issuing bank (insufficient funds or simulated test decline)",
        );
      }
      const seatNumber = selectedSeats[0];
      if (!seatNumber) {
        throw new Error("Select a seat before continuing to payment.");
      }

      // Step 1: Create booking and lock seat for 10 min (Booking Service)
      const bookingPayload = {
        flightId: flight.id,
        passengerId: passenger.id,
        seatNumber,
        amount: grandTotal,
        cabinClass: (cabinClass || "Economy").toUpperCase(),
      };

      const bookingRes = await bookingService.createBooking(bookingPayload);
      const createdBooking = bookingRes.data || {};
      if (!createdBooking.id || !createdBooking.pnr) {
        throw new Error("Booking service returned an incomplete reservation.");
      }
      const bookingId = createdBooking.id;
      const pnr = createdBooking.pnr;

      // Local test mode may complete this payment immediately and publish the
      // same event as a successful provider webhook.
      const initRes = await paymentService.initiatePayment({
        bookingId,
        amount: grandTotal,
      });
      const payment = initRes?.data || {};
      const paymentSucceeded = payment.status === "SUCCEEDED";

      const pendingData = {
        ...createdBooking,
        id: bookingId,
        pnr,
        flightNumber: flight.flightNumber,
        origin:
          typeof flight.origin === "string"
            ? flight.origin
            : flight.origin?.code || "",
        destination:
          typeof flight.destination === "string"
            ? flight.destination
            : flight.destination?.code || "",
        departureDate: flight.departureDate || "",
        departureTime: flight.departureTime || "",
        passengerName: `${passenger.firstName || ""} ${passenger.lastName || ""}`.trim(),
        cabinClass: (cabinClass || "Economy").toUpperCase(),
        amount: createdBooking.amount ?? grandTotal,
        status: createdBooking.status || "PENDING_PAYMENT",
        paymentStatus: payment.status,
        paymentSimulated: payment.simulated === true,
        paymentId: payment.id,
        providerReference: payment.providerReference,
      };

      if (payment.simulated === true && paymentSucceeded) {
        toast.success(
          `Test payment succeeded for ₦${grandTotal.toLocaleString("en-NG")}. No money was charged.`,
          "Test Payment Successful",
        );
      } else {
        toast.success(
          `Payment request created for ₦${grandTotal.toLocaleString("en-NG")}. We will confirm PNR ${pnr} after the provider webhook succeeds.`,
          "Payment Pending",
        );
      }

      dispatch(setConfirmedBooking(pendingData));
      navigate(`/confirmation?pnr=${pnr}`);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          err?.message || "Unable to complete checkout. Please try again.",
        ),
        "Checkout Failed",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!flight || passengers.length === 0 || !passenger.id) {
    return (
      <main className="page-container flex min-h-[55vh] items-center justify-center py-12">
        <section className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Checkout paused</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Your booking details are missing</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">Return to your booking to select a flight and add passenger details before submitting payment.</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to="/search" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-hover focus-visible:outline-offset-2">Search flights</Link>
            <Link to="/book" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline-offset-2">Resume booking</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-background px-4 py-8 md:px-8 md:py-10">
      {isProcessing && <LoadingOverlay label="Submitting your payment request..." />}
      <div className="mx-auto max-w-6xl">
        <BookingProgress activeStep={6} />
        <button
          type="button"
          onClick={() => navigate("/book")}
          className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-xs font-bold text-primary transition hover:underline focus-visible:outline-offset-2"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Booking Wizard
        </button>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Checkout</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Complete your booking</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Enter your payment details and submit to reserve this itinerary. In local test mode, the payment is simulated; no money is charged.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Payment Methods & Card Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <h2 className="text-xl font-black text-foreground">
                    Payment Details
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Choose a payment method and submit your request securely.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  <ShieldCheck size={14} />
                  <span>Secure SSL</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-border text-foreground"
                  }`}
                >
                  <CreditCard size={18} className="mb-2" />
                  <p className="text-xs font-bold">Debit / Credit</p>
                  <p className="text-[10px] text-muted">
                    Mastercard, Visa, Verve
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentMethod === "transfer"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-border text-foreground"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-surface-muted mb-2.5" />
                  <p className="text-xs font-bold">Bank Transfer</p>
                  <p className="text-[10px] text-muted">Instant NIP Checkout</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("ussd")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentMethod === "ussd"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-border text-foreground"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-surface-muted mb-2.5" />
                  <p className="text-xs font-bold">USSD / Payattitude</p>
                  <p className="text-[10px] text-muted">*737#, *894#, *966#</p>
                </button>
              </div>

              {/* Card Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Cardholder Name *"
                  placeholder="e.g. JANE DOE"
                  {...register("cardHolder", {
                    required: "Cardholder name is required",
                  })}
                  error={errors.cardHolder?.message}
                />

                <Input
                  label="Card Number *"
                  placeholder="4242 4242 4242 4242"
                  icon={<CreditCard size={16} />}
                  {...register("cardNumber", {
                    required: "Card number is required",
                  })}
                  error={errors.cardNumber?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date *"
                    placeholder="MM/YY"
                    {...register("expiryDate", {
                      required: "Expiry date is required",
                    })}
                    error={errors.expiryDate?.message}
                  />

                  <Input
                    label="CVV / CVC *"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    icon={<Lock size={16} />}
                    {...register("cvv", { required: "CVV is required" })}
                    error={errors.cvv?.message}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    isLoading={isProcessing}
                    disabled={isCalculatingQuote || !pricingQuote}
                    className="w-full font-bold shadow-md hover:shadow-orange-500/25"
                  >
                    Submit payment request · ₦{grandTotal.toLocaleString("en-NG")}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary & Pricing Calculator Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border sticky top-6 space-y-5">
              <h3 className="text-base font-black text-foreground pb-3 border-b border-border flex items-center justify-between">
                <span>Order Summary</span>
                {pricingQuote?.appliedMultiplier && (
                  <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">
                    Pricing Rate: {pricingQuote.appliedMultiplier}x
                  </span>
                )}
              </h3>

              {/* Flight snippet */}
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between text-xs font-bold text-foreground mb-2">
                  <span>{flight.flightNumber || "Flight"}</span>
                  <span className="text-primary">{cabinClass}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-foreground">
                      {flight.origin?.code || "—"}
                    </span>
                    <p className="text-[11px] text-muted">
                      {flight.origin?.city || "Origin"}
                    </p>
                  </div>
                  <Plane size={16} className="text-secondary" />
                  <div className="text-right">
                    <span className="text-base font-black text-foreground">
                      {flight.destination?.code || "—"}
                    </span>
                    <p className="text-[11px] text-muted">
                      {flight.destination?.city || "Destination"}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted mt-2 font-mono">
                  Depart: {flight.departureDate || "Date unavailable"} at{" "}
                  {flight.departureTime || "Time unavailable"}
                </p>
              </div>

              {/* Promo Code & Pricing Service Calculator */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Tag size={13} className="text-secondary" />
                  <span>Dynamic Pricing & Promo Quote</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isCalculatingQuote}
                    className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-hover transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {pricingQuote?.rulesUsed &&
                  pricingQuote.rulesUsed.length > 0 && (
                    <div className="pt-1 text-[10px] text-muted space-y-0.5">
                      {pricingQuote.rulesUsed.map((rule, idx) => (
                        <p
                          key={idx}
                          className="flex items-center gap-1 text-emerald-700 font-medium"
                        >
                          <Sparkles size={10} />
                          <span>{rule}</span>
                        </p>
                      ))}
                    </div>
                  )}
              </div>

              {/* Items Breakdown */}
              {pricingError && (
                <p className="mb-3 text-sm text-danger" role="alert">
                  {pricingError} Payment is disabled until the fare can be verified.
                </p>
              )}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>
                    1x Adult Passenger ({passenger.firstName}{" "}
                    {passenger.lastName})
                  </span>
                  <span className="font-semibold text-foreground">
                    ₦{effectiveBaseFare.toLocaleString("en-NG")}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Assigned Seat ({selectedSeats[0] || "12A"})</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                {baggageCost > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Extra Baggage ({extras.baggageKg} kg)</span>
                    <span className="font-semibold text-foreground">
                      +₦{baggageCost.toLocaleString("en-NG")}
                    </span>
                  </div>
                )}
                {mealCost > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Special Meal ({extras.mealPreference})</span>
                    <span className="font-semibold text-foreground">
                      +₦{mealCost.toLocaleString("en-NG")}
                    </span>
                  </div>
                )}
                {insuranceCost > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Comprehensive Travel Insurance</span>
                    <span className="font-semibold text-foreground">
                      +₦{insuranceCost.toLocaleString("en-NG")}
                    </span>
                  </div>
                )}
                {priorityCost > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Priority Boarding & Fast Track</span>
                    <span className="font-semibold text-foreground">
                      +₦{priorityCost.toLocaleString("en-NG")}
                    </span>
                  </div>
                )}
                {loungeCost > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Lotus Lounge Access</span>
                    <span className="font-semibold text-foreground">
                      +₦{loungeCost.toLocaleString("en-NG")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Taxes, Security & Fuel Surcharge (7.5%)</span>
                  <span className="font-semibold text-foreground">
                    +₦{taxesAndFees.toLocaleString("en-NG")}
                  </span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-baseline font-black text-foreground">
                  <span className="text-sm">Total Due Today</span>
                  <span className="text-2xl text-primary">
                    ₦{grandTotal.toLocaleString("en-NG")}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-2 border-t border-border text-[11px] text-muted space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Fare rules apply to changes and cancellations</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Boarding pass appears after payment confirmation</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
