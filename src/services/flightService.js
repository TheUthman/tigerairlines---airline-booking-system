import apiClient, { extractData } from "./apiClient";

/**
 * Service handling flights and airport operations mapped to Flight Service (`flight-service`).
 */
export const flightService = {
  /**
   * GET /api/flights/search
   * Search active flights matching origin, destination, date and required seats.
   *
   * @param {{
   *   origin?: string,
   *   destination?: string,
   *   originCode?: string,
   *   destinationCode?: string,
   *   date?: string,
   *   passengers?: number,
   *   airline?: string,
   *   maxPrice?: number,
   *   maxDurationMinutes?: number
   * }} params
   */
  async searchFlights(params = {}) {
    const origin = params.origin || params.originCode || "";
    const destination = params.destination || params.destinationCode || "";
    const queryParams = {
      origin,
      destination,
      date: params.date,
      passengers: params.passengers ?? 1,
      airline: params.airline,
      maxPrice: params.maxPrice,
      maxDurationMinutes: params.maxDurationMinutes
    };

    const res = await apiClient.get("/flights/search", { params: queryParams });
    return extractData(res, []);
  },

  /**
   * GET /api/flights/{id}
   * Retrieve flight details by ID.
   * @param {number|string} id
   */
  async getFlightById(id) {
    const res = await apiClient.get(`/flights/${id}`);
    return extractData(res, null);
  },

  /**
   * GET /api/flights
   * Get all flights in the schedule.
   */
  async getFlights() {
    const res = await apiClient.get("/flights");
    return extractData(res, []);
  },

  /**
   * POST /api/flights/admin
   * Admin - create a new flight record.
   * @param {object} flightData
   */
  async createFlight(flightData) {
    const res = await apiClient.post("/flights/admin", flightData);
    return extractData(res);
  },

  /**
   * PUT /api/flights/admin/{id}
   * Admin - update an existing flight record.
   * @param {number|string} id
   * @param {object} updates
   */
  async updateFlight(id, updates) {
    const res = await apiClient.put(`/flights/admin/${id}`, updates);
    return extractData(res);
  },

  /**
   * POST /api/flights/admin/{id}/delay
   * Admin - delay a flight by N minutes.
   * @param {number|string} id
   * @param {number} minutes
   */
  async delayFlight(id, minutes) {
    const res = await apiClient.post(`/flights/admin/${id}/delay`, null, {
      params: { minutes }
    });
    return extractData(res);
  },

  /**
   * POST /api/flights/admin/{id}/cancel
   * Admin - cancel a flight and mark it inactive.
   * @param {number|string} id
   */
  async cancelFlight(id) {
    const res = await apiClient.post(`/flights/admin/${id}/cancel`);
    return extractData(res);
  },
  /**
   * GET /api/flights/admin/airports or /api/airports
   * List airports catalogue.
   */
  async getAirports() {
    const res = await apiClient.get("/flights/airports");
    return extractData(res, []);
  },

  async getAdminAirports() {
    const res = await apiClient.get("/flights/admin/airports");
    return extractData(res, []);
  },

  /**
   * POST /api/flights/admin/airports or /api/airports
   * Add an airport.
   * @param {object} airportData
   */
  async createAirport(airportData) {
    const res = await apiClient.post("/flights/admin/airports", airportData);
    return extractData(res);
  },

  /**
   * PUT /api/flights/admin/airports/{id}
   * Update an airport.
   * @param {number|string} id
   * @param {object} airportData
   */
  async updateAirport(id, airportData) {
    const res = await apiClient.put(`/flights/admin/airports/${id}`, airportData);
    return extractData(res);
  },

  /**
   * DELETE /api/flights/admin/airports/{id} or /api/airports/{id}
   * Delete an airport.
   * @param {number|string} id
   */
  async deleteAirport(id) {
    const res = await apiClient.delete(`/flights/admin/airports/${id}`);
    return extractData(res, { id });
  },

  /**
   * GET /api/flights/admin/aircraft or /api/aircraft
   * List aircraft catalogue.
   */
  async getAircraft() {
    const res = await apiClient.get("/flights/admin/aircraft");
    return extractData(res, []);
  },

  /**
   * POST /api/flights/admin/aircraft or /api/aircraft
   * Add an aircraft.
   * @param {object} aircraftData
   */
  async createAircraft(aircraftData) {
    const res = await apiClient.post("/flights/admin/aircraft", aircraftData);
    return extractData(res);
  },

  /**
   * PUT /api/flights/admin/aircraft/{id}
   * Update an aircraft.
   * @param {number|string} id
   * @param {object} aircraftData
   */
  async updateAircraft(id, aircraftData) {
    const res = await apiClient.put(`/flights/admin/aircraft/${id}`, aircraftData);
    return extractData(res);
  },

  /**
   * DELETE /api/flights/admin/aircraft/{id} or /api/aircraft/{id}
   * Delete an aircraft.
   * @param {number|string} id
   */
  async deleteAircraft(id) {
    const res = await apiClient.delete(`/flights/admin/aircraft/${id}`);
    return extractData(res, { id });
  }
};

export default flightService;
