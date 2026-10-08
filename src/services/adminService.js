import apiClient, { extractData } from "./apiClient";

const toAircraftView = (aircraft) => ({
  ...aircraft,
  tailNumber: aircraft.code,
  totalSeats: aircraft.seatCapacity,
  economySeats: aircraft.seatCapacity,
  businessSeats: 0,
  manufacturer: "",
  manufactureYear: "",
  status: "OPERATIONAL"
});

/**
 * Service handling administration, audit actions, and user governance mapped to Admin Service (`admin-service`).
 */
export const adminService = {
  /**
   * GET /api/admin/dashboard
   * View operational dashboard status and audit metrics.
   */
  async getAdminDashboard() {
    const res = await apiClient.get("/admin/dashboard");
    return extractData(res);
  },

  /**
   * POST /api/admin/actions
   * Record an administrative audit action.
   * @param {object} actionPayload
   */
  async recordAuditAction(actionPayload) {
    const res = await apiClient.post("/admin/actions", actionPayload);
    return extractData(res);
  },

  /**
   * GET /api/auth/users
   * List all registered users (admin-only operation).
   */
  async getUsers() {
    const res = await apiClient.get("/auth/users");
    const result = extractData(res, []);
    const userList = Array.isArray(result.data)
      ? result.data
      : (Array.isArray(result.data?.content) ? result.data.content : []);
    return { ...result, data: userList };
  },

  /**
   * PUT /api/auth/users/{userId}/role
   * Update user role (ADMIN, STAFF, PASSENGER).
   * @param {number|string} id
   * @param {string} role
   */
  async updateUserRole(id, role) {
    const normalizedRole =
      role === "ADMINISTRATOR"
        ? "ADMIN"
        : role === "USER" || role === "CUSTOMER"
          ? "PASSENGER"
          : role;

    const res = await apiClient.put(`/auth/users/${id}/role`, {
      role: normalizedRole,
    });
    return extractData(res);
  },

  /**
   * DELETE /api/auth/users/{id}
   * Delete a registered user account.
   * @param {number|string} id
   */
  async deleteUser(id) {
    const res = await apiClient.delete(`/auth/users/${id}`);
    return extractData(res);
  },

  /**
   * POST /api/auth/promote/{userId}
   * Promote an existing user to ADMIN or other specified role.
   * @param {number|string} userId
   * @param {string} [role]
   */
  async promoteUser(userId, role = "ADMIN") {
    const res = await apiClient.post(`/auth/promote/${userId}`, { role });
    return extractData(res);
  },

  /**
   * GET /api/admin/dashboard
   * Get operations stats for dashboard widgets.
   */
  async getDashboardStats() {
    const res = await apiClient.get("/admin/dashboard");
    return extractData(res, null);
  },

  /**
   * GET /api/aircraft or /api/flights/admin/aircraft
   * Get all aircraft in the fleet.
   */
  async getAircraft() {
    const res = await apiClient.get("/flights/admin/aircraft");
    const result = extractData(res, []);
    return { ...result, data: result.data.map(toAircraftView) };
  },

  /**
   * POST /api/aircraft
   * Create aircraft record in the fleet.
   * @param {object} aircraftData
   */
  async createAircraft(aircraftData) {
    const res = await apiClient.post("/flights/admin/aircraft", {
      code: aircraftData.tailNumber,
      model: aircraftData.model,
      seatCapacity: aircraftData.totalSeats
    });
    const result = extractData(res);
    return { ...result, data: toAircraftView(result.data) };
  },

  /**
   * PUT /api/aircraft/{id}
   * Update aircraft details.
   * @param {number|string} id
   * @param {object} updates
   */
  async updateAircraft(id, updates) {
    const res = await apiClient.put(`/flights/admin/aircraft/${id}`, {
      code: updates.tailNumber,
      model: updates.model,
      seatCapacity: updates.totalSeats
    });
    const result = extractData(res);
    return { ...result, data: toAircraftView(result.data) };
  },

  /**
   * DELETE /api/aircraft/{id}
   * Remove aircraft from fleet.
   * @param {number|string} id
   */
  async deleteAircraft(id) {
    const res = await apiClient.delete(`/flights/admin/aircraft/${id}`);
    return extractData(res, { id });
  }
};

export default adminService;
