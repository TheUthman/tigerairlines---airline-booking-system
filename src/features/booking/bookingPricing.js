export const getBookingPriceBreakdown = ({
  flight,
  cabinClass,
  extras,
  quotedBaseFare,
}) => {
  const baseFare = Number(
    quotedBaseFare ??
      (cabinClass?.toUpperCase() === "BUSINESS"
        ? flight?.businessFare ?? flight?.priceBusiness
        : flight?.fare ?? flight?.priceEconomy),
  );

  const baggageCost =
    extras?.baggageKg === 30 ? 10000 : extras?.baggageKg === 40 ? 18000 : 0;
  const mealCost = extras?.mealPreference === "Chef's Special" ? 4500 : 0;
  const insuranceCost = extras?.travelInsurance ? 5000 : 0;
  const priorityCost = extras?.priorityBoarding ? 2500 : 0;
  const loungeCost = extras?.loungeAccess ? 8000 : 0;
  const extrasTotal =
    baggageCost + mealCost + insuranceCost + priorityCost + loungeCost;
  const safeBaseFare = Number.isFinite(baseFare) ? baseFare : 0;
  const taxesAndFees = Math.round(safeBaseFare * 0.075);

  return {
    baseFare: safeBaseFare,
    baggageCost,
    mealCost,
    insuranceCost,
    priorityCost,
    loungeCost,
    extrasTotal,
    taxesAndFees,
    grandTotal: safeBaseFare + extrasTotal + taxesAndFees,
  };
};
