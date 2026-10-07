import apiClient, { extractData } from "./apiClient";

/**
 * Service handling all authentication endpoints mapped to Auth Service (`authservice`).
 * Covers registration, login, JWT token refresh, role elevation, and password lifecycle.
 */
class AuthService {
  normalizeAuthResponse(res) {
    const payload = extractData(res).data || res?.data || {};
    const isAdmin = payload.role === "ADMIN" || payload.role === "ADMINISTRATOR";
    return {
      success: true,
      data: {
        token: payload.token || payload.accessToken,
        refreshToken: payload.refreshToken,
        user: {
          id: payload.userId || payload.id || payload.user?.id,
          name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || payload.name || payload.user?.name || "",
          firstName: payload.firstName || payload.user?.firstName,
          lastName: payload.lastName || payload.user?.lastName,
          email: payload.email || payload.user?.email,
          // The UI's existing guards use ADMINISTRATOR; the JWT still retains ADMIN.
          role: isAdmin ? "ADMINISTRATOR" : (payload.role || "CUSTOMER")
        }
      }
    };
  }
  /**
   * POST /api/auth/login
   * Authenticate with email/password and receive JWT + refresh token.
   * @param {{ email: string, password: string, rememberMe?: boolean }} payload
   */
  async login(payload) {
    if (payload.rememberMe) {
      try {
        localStorage.setItem("tiger_remember_email", payload.email);
      } catch (e) {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem("tiger_remember_email");
      } catch (e) {
        // ignore
      }
    }

    const res = await apiClient.post("/auth/login", payload);
    const result = this.normalizeAuthResponse(res);

    // Save refresh token if provided in response
    const refreshToken = result.data.refreshToken;
    if (refreshToken) {
      try {
        localStorage.setItem("tiger_refresh_token", refreshToken);
      } catch (e) {
        // ignore
      }
    }

    return result;
  }

  /**
   * POST /api/auth/register
   * Register a new user and issue JWT + refresh token.
   * @param {{ firstName: string, lastName: string, email: string, password: string }} payload
   */
  async register(payload) {
    const fullName = payload.fullName?.trim() || "";
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    const res = await apiClient.post("/auth/register", {
      firstName: payload.firstName || firstName || "",
      lastName: payload.lastName || lastNameParts.join(" ") || firstName || "",
      email: payload.email,
      password: payload.password
    });
    const result = this.normalizeAuthResponse(res);

    const refreshToken = result.data.refreshToken;
    if (refreshToken) {
      try {
        localStorage.setItem("tiger_refresh_token", refreshToken);
      } catch (e) {
        // ignore
      }
    }

    return result;
  }

  /**
   * POST /api/auth/refresh
   * Exchange an existing refresh token for a new access token + refresh token.
   * @param {string} [token] - Optional refresh token; defaults to stored token
   */
  async refreshToken(token) {
    const refreshToken =
      token ||
      localStorage.getItem("tiger_refresh_token") ||
      sessionStorage.getItem("tiger_refresh_token");

    const res = await apiClient.post("/auth/refresh", { refreshToken });
    const result = this.normalizeAuthResponse(res);

    const newAccessToken = result.data.token;
    const newRefreshToken = result.data.refreshToken;

    if (newAccessToken) {
      localStorage.setItem("tiger_auth_token", newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("tiger_refresh_token", newRefreshToken);
    }

    return result;
  }

  /**
   * POST /api/auth/promote/{userId}
   * Promote an existing user to ADMIN role (admin-only operation).
   * @param {number|string} userId
   */
  async promoteUser(userId) {
    const res = await apiClient.post(`/auth/promote/${userId}`);
    return extractData(res);
  }

  /**
   * POST /api/auth/verify-email
   * Verify email confirmation code.
   * @param {{ email: string, code: string }} payload
   */
  async requestEmailVerification(email) {
    const res = await apiClient.post("/auth/verification", { email });
    return extractData(res);
  }

  /**
   * POST /api/auth/resend-code
   * Resend email verification code.
   * @param {string} email
   */
  async confirmEmailVerification(token) {
    const res = await apiClient.post("/auth/verification/confirm", { token });
    return extractData(res);
  }

  /**
   * POST /api/auth/forgot-password
   * Request password reset link / email.
   * @param {string} email
   */
  async forgotPassword(email) {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return extractData(res);
  }

  /**
   * POST /api/auth/reset-password
   * Reset user password using security token and new password.
   * @param {{ token: string, password: string, email?: string }} payload
   */
  async resetPassword(payload) {
    const res = await apiClient.post("/auth/reset-password", payload);
    return extractData(res);
  }

  /**
   * Clear local stored session tokens and user state on logout.
   */
  clearSession() {
    try {
      localStorage.removeItem("tiger_auth_token");
      localStorage.removeItem("tiger_token");
      localStorage.removeItem("tiger_refresh_token");
      localStorage.removeItem("tiger_auth_user");
    } catch (e) {
      // ignore
    }
  }
}

export const authService = new AuthService();
export default authService;
