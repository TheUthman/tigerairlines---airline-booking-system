import apiClient, { extractData } from "./apiClient";

/**
 * Service handling financial transactions mapped to Payment Service (`payment-service`).
 */
export const paymentService = {
  /**
   * POST /api/payments/initiate
   * Create a pending payment record for a booking.
   * Header X-User-Email automatically attached by apiClient identifies the payer.
   *
   * @param {{ bookingId: number|string, amount: number }} payload
   */
  async initiatePayment(payload) {
    const res = await apiClient.post("/payments/initiate", payload);
    return extractData(res);
  },

  /**
   * POST /api/payments/{id}/refund
   * Refund a succeeded payment.
   * @param {number|string} id
   */
  async refundPayment(id) {
    const res = await apiClient.post(`/payments/${id}/refund`);
    return extractData(res);
  },

  /**
   * GET /api/payments/{id}/invoice
   * View a payment invoice.
   * @param {number|string} id
   */
  async getInvoice(id) {
    const res = await apiClient.get(`/payments/${id}/invoice`);
    return extractData(res);
  },

  /**
   * POST /api/payments/webhook
   * Endpoint called by payment provider or ops simulation to report success/failure.
   *
   * @param {{ providerReference: string, succeeded: boolean }} payload
   * @param {string} [webhookSecret]
   */
  async handleWebhook(payload, webhookSecret) {
    const headers = {};
    if (webhookSecret) {
      headers["X-Payment-Webhook-Secret"] = webhookSecret;
    }
    const res = await apiClient.post("/payments/webhook", payload, { headers });
    return extractData(res);
  },

  /**
   * GET /api/payments
   * Get all payment transactions (admin or user payment logs).
   */
  async getPayments() {
    const res = await apiClient.get("/payments");
    return extractData(res, []);
  },

  // Payment completion is provider-owned. The provider calls /payments/webhook,
  // which emits the event that confirms or cancels the booking.
};

export default paymentService;
