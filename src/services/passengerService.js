import apiClient, { extractData } from "./apiClient";

/**
 * Service handling passenger operations mapped to Passenger Service (`passenger-service`).
 */
export const passengerService = {
  /**
   * GET /api/passengers/me
   * Return all passengers owned by the caller (identified by X-User-Email header).
   */
  async getMyPassengers() {
    const res = await apiClient.get("/passengers/me");
    return extractData(res, []);
  },

  /**
   * GET /api/passengers/saved-travelers
   * List only the caller's travellers flagged as saved.
   */
  async getSavedTravelers() {
    const res = await apiClient.get("/passengers/saved-travelers");
    return extractData(res, []);
  },

  /**
   * GET /api/passengers
   * Get all passengers (admin / system-wide registry).
   */
  async getPassengers() {
    const res = await apiClient.get("/passengers");
    return extractData(res, []);
  },

  /**
   * GET /api/passengers/{id}
   * Get passenger profile details by ID.
   * @param {number|string} id
   */
  async getPassengerById(id) {
    const res = await apiClient.get(`/passengers/${id}`);
    return extractData(res, null);
  },

  /**
   * POST /api/passengers
   * Create a new traveller profile.
   * Payload: { firstName, lastName, dateOfBirth, phone, documentNumber, passportNationality, passportExpiryDate, savedTraveler }
   * @param {object} passengerData
   */
  async createPassenger(passengerData) {
    const res = await apiClient.post("/passengers", passengerData);
    return extractData(res);
  },

  /**
   * PUT /api/passengers/{id}
   * Update an existing passenger (owner only).
   * @param {number|string} id
   * @param {object} updates
   */
  async updatePassenger(id, updates) {
    const res = await apiClient.put(`/passengers/${id}`, updates);
    return extractData(res);
  },

  /**
   * POST /api/passengers/{id}/points
   * Add frequent-flyer points to a passenger (owner only).
   * @param {number|string} id
   * @param {number} points
   */
  async addPoints(id, points) {
    const res = await apiClient.post(`/passengers/${id}/points`, null, {
      params: { points }
    });
    return extractData(res);
  },

  /**
   * DELETE /api/passengers/{id}
   * Delete passenger record.
   * @param {number|string} id
   */
  async deletePassenger(id) {
    const res = await apiClient.delete(`/passengers/${id}`);
    return extractData(res, { id });
  }
};

export default passengerService;
