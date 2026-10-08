import apiClient, { extractData } from "./apiClient";

/**
 * Service handling reservation operations mapped to Booking Service (`booking-service`).
 */
export const bookingService = {
  /**
   * GET /api/bookings
   * List all bookings for caller (identified by X-User-Email header) or admin overview.
   */
  async getBookings() {
    const res = await apiClient.get("/bookings");
    return extractData(res, []);
  },

  /**
   * GET /api/bookings/{id}
   * Retrieve a single booking by numeric/string ID owned by caller.
   * @param {number|string} id
   */
  async getBookingById(id) {
    const res = await apiClient.get(`/bookings/${id}`);
    return extractData(res, null);
  },

  /**
   * GET /api/bookings/pnr/{pnr}
   * Retrieve booking details by 6-character PNR record locator.
   * @param {string} pnr
   */
  async getBookingByPnr(pnr) {
    const cleanPnr = pnr.trim().toUpperCase();
    const res = await apiClient.get(`/bookings/pnr/${cleanPnr}`);
    return extractData(res, null);
  },

  /**
   * GET /api/bookings/search
   * Search booking by PNR and passenger last name.
   * @param {string} pnr
   * @param {string} lastName
   */
  async getBookingByPnrAndLastName(pnr, lastName) {
    const cleanPnr = pnr.trim().toUpperCase();
    const cleanLast = lastName?.trim();
    const res = await apiClient.get("/bookings/search", {
      params: { pnr: cleanPnr, lastName: cleanLast }
    });
    return extractData(res, null);
  },

  /**
   * POST /api/bookings
   * Create a new booking and lock a seat for 10 minutes (Redis lock).
   * Expected payload: { flightId, passengerId, seatNumber, amount, cabinClass }
   * Returns newly created booking with status PENDING_PAYMENT.
   * @param {object} bookingData
   */
  async createBooking(bookingData) {
    const res = await apiClient.post("/bookings", bookingData);
    return extractData(res);
  },

  /**
   * POST /api/bookings/group
   * Create one pending booking per traveller (each seat locked independently).
   * Expected payload: { flightId, travelers: [ { passengerId, seatNumber, amount, cabinClass } ] }
   * @param {{ flightId: number|string, travelers: Array<{ passengerId: number|string, seatNumber: string, amount: number, cabinClass?: "ECONOMY"|"BUSINESS" }> }} payload
   */
  async createGroupBooking(payload) {
    const res = await apiClient.post("/bookings/group", payload);
    return extractData(res);
  },

  /**
   * POST /api/bookings/{id}/upgrade
   * Change a pending booking's seat and add price difference.
   * @param {number|string} id
   * @param {string} seatNumber
   * @param {number} additionalAmount
   */
  async upgradeBookingSeat(id, seatNumber, additionalAmount = 0) {
    const res = await apiClient.post(`/bookings/${id}/upgrade`, null, {
      params: { seatNumber, additionalAmount }
    });
    return extractData(res);
  },

  /**
   * POST /api/bookings/{id}/cancel
   * Cancel a pending booking (cannot cancel confirmed one).
   * @param {number|string} id
   */
  async cancelBooking(id) {
    const res = await apiClient.post(`/bookings/${id}/cancel`);
    return extractData(res, { id, status: "CANCELLED" });
  },

  // Status is changed only by booking-service event handling after payment.
};

export default bookingService;
