export const getBookingPriceBreakdown = ({ flight, cabinClass, extras }) => {
  const baseFare = flight
    ? cabinClass === "Business"
      ? flight.priceBusiness
      : flight.priceEconomy
    : 45000;

  const baggageCost =
    extras?.baggageKg === 30 ? 10000 : extras?.baggageKg === 40 ? 18000 : 0;
  const mealCost = extras?.mealPreference === "Chef's Special" ? 4500 : 0;
  const insuranceCost = extras?.travelInsurance ? 5000 : 0;
  const priorityCost = extras?.priorityBoarding ? 2500 : 0;
  const loungeCost = extras?.loungeAccess ? 8000 : 0;
  const extrasTotal =
    baggageCost + mealCost + insuranceCost + priorityCost + loungeCost;
  const taxesAndFees = Math.round(baseFare * 0.075);

  return {
    baseFare,
    baggageCost,
    mealCost,
    insuranceCost,
    priorityCost,
    loungeCost,
    extrasTotal,
    taxesAndFees,
    grandTotal: baseFare + extrasTotal + taxesAndFees,
  };
};
