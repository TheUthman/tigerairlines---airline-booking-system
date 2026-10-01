import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [promoCodeInput, setPromoCodeInput] = useState("WELCOME10");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [pricingQuote, setPricingQuote] = useState(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);

  const rawBasePrice = flight
    ? cabinClass === "Business"
      ? flight.priceBusiness
      : flight.priceEconomy
    : 45000;

  const baggageCost =
    extras.baggageKg === 30 ? 8000 : extras.baggageKg === 40 ? 15000 : 0;
  const mealCost = extras.mealPreference === "Chef's Special" ? 3500 : 0;
  const insuranceCost = extras.travelInsurance ? 5000 : 0;
  const priorityCost = extras.priorityBoarding ? 2500 : 0;
  const loungeCost = extras.loungeAccess ? 8000 : 0;
  const extrasTotal =
    baggageCost + mealCost + insuranceCost + priorityCost + loungeCost;

  // Recalculate dynamic pricing quote with pricingService
  useEffect(() => {
    let isSubscribed = true;
    const calculateDynamicQuote = async () => {
      setIsCalculatingQuote(true);
      try {
        const quoteRes = await pricingService.getQuote({
          flightId: flight?.id || 101,
          baseFare: rawBasePrice,
          departureDate: flight?.departureDate || "2026-10-15",
          availableSeats: flight?.availableSeats || 30,
          totalSeats: 180,
          cabin: (cabinClass || "ECONOMY").toUpperCase(),
          promoCode: appliedPromo,
          frequentFlyerPoints: 500,
        });

        if (isSubscribed && quoteRes?.data) {
          setPricingQuote(quoteRes.data);
        }
      } catch (err) {
        // Fallback already handled inside pricingService
      } finally {
        if (isSubscribed) setIsCalculatingQuote(false);
      }
    };

    calculateDynamicQuote();
    return () => {
      isSubscribed = false;
    };
  }, [flight, rawBasePrice, cabinClass, appliedPromo]);

  const effectiveBaseFare =
    pricingQuote?.total !== undefined ? pricingQuote.total : rawBasePrice;
  const taxesAndFees = Math.round(effectiveBaseFare * 0.12);
  const grandTotal = effectiveBaseFare + extrasTotal + taxesAndFees;

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
      cardNumber: "4242 •••• •••• 4242",
      cardHolder: `${passenger.firstName} ${passenger.lastName}`.toUpperCase(),
      expiryDate: "12/28",
      cvv: "883",
    },
  });

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      if (data.cvv === "000") {
        throw new Error(
          "Card declined by issuing bank (insufficient funds or simulated test decline)",
        );
      }

      // Step 1: Create booking and lock seat for 10 min (Booking Service)
      const bookingPayload = {
        flightId: flight?.id || 101,
        flightNumber: flight?.flightNumber || "TG-101",
        passengerId: passenger.id || 1,
        passengerName: `${passenger.firstName} ${passenger.lastName}`,
        origin: `${flight?.origin?.city || "Lagos"} (${flight?.origin?.code || "LOS"})`,
        destination: `${flight?.destination?.city || "Abuja"} (${flight?.destination?.code || "ABV"})`,
        departureDate: flight?.departureDate || "2026-10-15",
        departureTime: flight?.departureTime || "06:00",
        cabinClass: cabinClass || "Economy",
        status: "PENDING_PAYMENT",
        seatNumber: selectedSeats[0] || "12A",
        amount: grandTotal,
      };

      const bookingRes = await bookingService.createBooking(bookingPayload);
      const createdBooking = bookingRes.data || {};
      if (!createdBooking.id || !createdBooking.pnr) {
        throw new Error("Booking service returned an incomplete reservation.");
      }
      const bookingId = createdBooking.id;
      const pnr = createdBooking.pnr;

      // Step 2: Initiate pending payment record (Payment Service)
      const initRes = await paymentService.initiatePayment({
        bookingId,
        amount: grandTotal,
      });

      // The payment provider calls the backend webhook. Its event confirms the
      // booking asynchronously; the browser must not call that protected route.
      const pendingData = {
        ...createdBooking,
        id: bookingId,
        pnr,
        status: "PENDING_PAYMENT",
        paymentId: initRes?.data?.id,
        providerReference: initRes?.data?.providerReference,
      };

      toast.success(
        `Payment request created for ₦${grandTotal.toLocaleString("en-NG")}. We will confirm PNR ${pnr} after the provider webhook succeeds.`,
        "Payment Pending",
      );

      dispatch(setConfirmedBooking(pendingData));
      navigate(`/confirmation?pnr=${pnr}`);
    } catch (err) {
      toast.error(
        err?.message ||
          "Payment authorization failed. Please check your card number or expiration.",
        "Payment Declined",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/book")}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Booking Wizard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Payment Methods & Card Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <h2 className="text-xl font-black text-foreground">
                    Payment Details
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Safe & encrypted transaction under 256-bit TLS
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
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
                    className="w-full font-bold shadow-md hover:shadow-orange-500/25"
                  >
                    Pay ₦{grandTotal.toLocaleString("en-NG")} & Confirm Booking
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
                  <span>{flight?.flightNumber || "TG-101"}</span>
                  <span className="text-primary">{cabinClass}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-foreground">
                      {flight?.origin?.code || "LOS"}
                    </span>
                    <p className="text-[11px] text-muted">
                      {flight?.origin?.city || "Lagos"}
                    </p>
                  </div>
                  <Plane size={16} className="text-secondary" />
                  <div className="text-right">
                    <span className="text-base font-black text-foreground">
                      {flight?.destination?.code || "ABV"}
                    </span>
                    <p className="text-[11px] text-muted">
                      {flight?.destination?.city || "Abuja"}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted mt-2 font-mono">
                  Depart: {flight?.departureDate || "2026-10-15"} at{" "}
                  {flight?.departureTime || "08:30"}
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
                  <span>Taxes, Security & Fuel Surcharge (12%)</span>
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
                  <span>24-Hour Free Cancellation Policy</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Instant E-Ticket & Boarding Pass Issuance</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
