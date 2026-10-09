import apiClient, { extractData } from "./apiClient";

const normalizePassenger = (passenger) => ({
  ...passenger,
  email: passenger.email ?? passenger.ownerEmail ?? "",
  passportNumber: passenger.passportNumber ?? passenger.documentNumber ?? "",
  nationality: passenger.nationality ?? passenger.passportNationality ?? "",
  tier: passenger.tier ?? "Standard",
});

const normalizePassengerList = (result) =>
  Array.isArray(result.data)
    ? { ...result, data: result.data.map(normalizePassenger) }
    : result;

const toPassengerRequest = (passenger) => ({
  firstName: passenger.firstName,
  lastName: passenger.lastName,
  dateOfBirth: passenger.dateOfBirth,
  phone: passenger.phone,
  documentNumber: passenger.documentNumber ?? passenger.passportNumber,
  passportNationality:
    passenger.passportNationality ?? passenger.nationality,
  passportExpiryDate: passenger.passportExpiryDate,
  savedTraveler: passenger.savedTraveler ?? true,
});

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
    return normalizePassengerList(extractData(res, []));
  },

  /**
   * GET /api/passengers/saved-travelers
   * List only the caller's travellers flagged as saved.
   */
  async getSavedTravelers() {
    const res = await apiClient.get("/passengers/saved-travelers");
    return normalizePassengerList(extractData(res, []));
  },

  /**
   * GET /api/passengers
   * Get all passengers (admin / system-wide registry).
   */
  async getPassengers() {
    const res = await apiClient.get("/passengers");
    return normalizePassengerList(extractData(res, []));
  },

  /**
   * POST /api/passengers/staff/manifest
   * Return names only for passengers on a staff flight manifest.
   * @param {Array<number|string>} ids
   */
  async getStaffManifestPassengers(ids) {
    const res = await apiClient.post("/passengers/staff/manifest", ids);
    return extractData(res, []);
  },

  /**
   * GET /api/passengers/{id}
   * Get passenger profile details by ID.
   * @param {number|string} id
   */
  async getPassengerById(id) {
    const res = await apiClient.get(`/passengers/${id}`);
    const result = extractData(res, null);
    return result.data
      ? { ...result, data: normalizePassenger(result.data) }
      : result;
  },

  /**
   * POST /api/passengers
   * Create a new traveller profile.
   * Payload: { firstName, lastName, dateOfBirth, phone, documentNumber, passportNationality, passportExpiryDate, savedTraveler }
   * @param {object} passengerData
   */
  async createPassenger(passengerData) {
    const res = await apiClient.post(
      "/passengers",
      toPassengerRequest(passengerData),
    );
    const result = extractData(res);
    return result.data
      ? { ...result, data: normalizePassenger(result.data) }
      : result;
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
