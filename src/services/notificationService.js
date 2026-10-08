import apiClient, { extractData } from "./apiClient";

/**
 * Service handling system and user communications mapped to Notification Service (`notification-service`).
 */
export const notificationService = {
  /**
   * GET /api/notifications
   * Fetch the 50 most recent notifications for the logged-in user identified by X-User-Email.
   */
  async getNotifications() {
    try {
      const res = await apiClient.get("/notifications");
      const extracted = extractData(res, []);
      const raw = Array.isArray(extracted?.data)
        ? extracted.data
        : Array.isArray(extracted?.data?.notifications)
        ? extracted.data.notifications
        : Array.isArray(extracted?.notifications)
        ? extracted.notifications
        : Array.isArray(extracted)
        ? extracted
        : [];

      const normalized = raw.map((item, idx) => ({
        id: item.id || `notif-${idx}`,
        title: item.title || item.eventType?.replace(/_/g, " ") || "Notification",
        message:
          item.message ||
          (typeof item.payload === "string" ? item.payload : item.deliveryStatus || "Update available"),
        type:
          item.type ||
          (item.eventType?.includes("FLIGHT")
            ? "FLIGHT"
            : item.eventType?.includes("PAYMENT")
            ? "PAYMENT"
            : "INFO"),
        read: Boolean(item.read),
        timestamp:
          item.timestamp ||
          (item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "")
      }));

      return { success: true, data: normalized };
    } catch {
      return { success: false, data: [] };
    }
  },

  /**
   * POST /api/notifications/account/password-reset
   * Payload: { recipientEmail, resetUrl, userName, expireInMinutes }
   */
  async sendPasswordResetNotification(payload) {
    const res = await apiClient.post("/notifications/account/password-reset", payload);
    return extractData(res);
  },

  /**
   * POST /api/notifications/account/verification
   * Payload: { recipientEmail, verificationUrl, userName }
   */
  async sendAccountVerificationNotification(payload) {
    const res = await apiClient.post("/notifications/account/verification", payload);
    return extractData(res);
  },

  /**
   * POST /api/notifications/booking/confirmation
   * Payload: { recipientEmail, bookingId, bookingReference, flightNumber, origin, destination, departureTime, arrivalTime, totalAmount, passengerNames }
   */
  async sendBookingConfirmation(payload) {
    const res = await apiClient.post("/notifications/booking/confirmation", payload);
    return extractData(res);
  },

  /**
   * POST /api/notifications/flight/update
   * Payload: { recipientEmail, flightNumber, origin, destination, scheduledDeparture, newDeparture, gate, statusMessage }
   */
  async sendFlightUpdate(payload) {
    const res = await apiClient.post("/notifications/flight/update", payload);
    return extractData(res);
  },

  /**
   * POST /api/notifications/flight/cancellation
   * Payload: { recipientEmail, flightNumber, origin, destination, departureDate, reason, refundPolicyUrl }
   */
  async sendFlightCancellation(payload) {
    const res = await apiClient.post("/notifications/flight/cancellation", payload);
    return extractData(res);
  },

  /**
   * POST /api/notifications/payment/confirmation
   * Payload: { recipientEmail, bookingId, paymentId, providerReference, amount, paymentMethod }
   */
  async sendPaymentConfirmation(payload) {
    const res = await apiClient.post("/notifications/payment/confirmation", payload);
    return extractData(res);
  },

  // Backwards compatible aliases
  sendAccountNotification(payload) {
    return this.sendAccountVerificationNotification(payload);
  },
  sendBookingNotification(payload) {
    return this.sendBookingConfirmation(payload);
  },
  sendFlightNotification(payload) {
    return this.sendFlightUpdate(payload);
  },
  sendPaymentNotification(payload) {
    return this.sendPaymentConfirmation(payload);
  }
};

export default notificationService;
