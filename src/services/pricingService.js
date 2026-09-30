import apiClient, { extractData } from "./apiClient";

/**
 * Service handling dynamic pricing quote calculations matching Pricing Service (`pricing-service`).
 */
export const pricingService = {
  /**
   * POST /api/pricing/quote
   * Calculate a dynamic quote with all pricing rules applied.
   *
   * @param {{
   *   flightId: number|string,
   *   baseFare: number,
   *   departureDate: string,
   *   availableSeats?: number,
   *   totalSeats?: number,
   *   cabin?: "ECONOMY"|"BUSINESS"|"FIRST"|"Economy"|"Business"|"First",
   *   promoCode?: string,
   *   frequentFlyerPoints?: number
   * }} payload
   */
  async getQuote(payload) {
    const res = await apiClient.post("/pricing/quote", payload);
    return extractData(res);
  },

  /**
   * Client-side dynamic pricing calculator utility for UI previews when explicit requested.
   */
  calculateLocalQuote(payload) {
    const {
      flightId,
      baseFare = 45000,
      departureDate,
      availableSeats = 30,
      totalSeats = 180,
      cabin = "ECONOMY",
      promoCode = "",
      frequentFlyerPoints = 0
    } = payload;

    let multiplier = 1.0;
    const rulesUsed = [];

    // 1. Advance purchase rule
    if (departureDate) {
      const today = new Date();
      const depDate = new Date(departureDate);
      const diffDays = Math.ceil((depDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays >= 0) {
        multiplier += 0.35;
        rulesUsed.push("Advance purchase <= 3 days (+35%)");
      } else if (diffDays >= 4 && diffDays <= 14) {
        multiplier += 0.15;
        rulesUsed.push("Advance purchase 4–14 days (+15%)");
      }
    }

    // 2. Load-factor / occupancy rule
    if (totalSeats > 0 && availableSeats !== undefined) {
      const occupied = totalSeats - availableSeats;
      const occupancyRate = occupied / totalSeats;
      if (occupancyRate >= 0.85) {
        multiplier += 0.25;
        rulesUsed.push("High flight occupancy >= 85% (+25%)");
      } else if (occupancyRate >= 0.65) {
        multiplier += 0.10;
        rulesUsed.push("Moderate flight occupancy >= 65% (+10%)");
      }
    }

    // 3. Cabin class multiplier
    const normalizedCabin = (cabin || "").toUpperCase();
    if (normalizedCabin.includes("FIRST")) {
      multiplier *= 2.75;
      rulesUsed.push("First class multiplier (2.75x)");
    } else if (normalizedCabin.includes("BUSINESS")) {
      multiplier *= 1.80;
      rulesUsed.push("Business class multiplier (1.80x)");
    }

    const calculatedFare = Math.round(baseFare * multiplier);

    // 4. Promo code discount
    let promoDiscount = 0;
    const cleanPromo = (promoCode || "").trim().toUpperCase();
    if (cleanPromo === "WELCOME10" || cleanPromo === "TIGER10") {
      promoDiscount = Math.round(calculatedFare * 0.10);
      rulesUsed.push(`Promo code ${cleanPromo} applied (-10%)`);
    } else if (cleanPromo === "TIGER20") {
      promoDiscount = Math.round(calculatedFare * 0.20);
      rulesUsed.push(`Promo code ${cleanPromo} applied (-20%)`);
    }

    // 5. Frequent flyer points discount: every 100 points = 1 currency unit, max 100 currency units
    const pointsDiscount = Math.min(Math.floor((frequentFlyerPoints || 0) / 100), 100);
    if (pointsDiscount > 0) {
      rulesUsed.push(`Frequent flyer loyalty redemption (-${pointsDiscount})`);
    }

    const totalDiscounts = promoDiscount + pointsDiscount;
    const finalTotal = Math.max(0, calculatedFare - totalDiscounts);

    return {
      flightId,
      baseFare,
      appliedMultiplier: parseFloat(multiplier.toFixed(2)),
      calculatedFare,
      discounts: {
        promoDiscount,
        pointsDiscount,
        total: totalDiscounts
      },
      total: finalTotal,
      rulesUsed
    };
  }
};

export default pricingService;
