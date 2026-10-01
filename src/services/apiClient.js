import axios from "axios";

const apiClient = axios.create({
  // The gateway exposes routes below /api (not /api/v1). Use its local address
  // by default so the Vite development server does not need a proxy.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// The gateway derives caller identity from the JWT and injects service headers.
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("tiger_auth_token") ||
    localStorage.getItem("tiger_token") ||
    sessionStorage.getItem("tiger_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle token refresh on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      const refreshToken =
        localStorage.getItem("tiger_refresh_token") ||
        sessionStorage.getItem("tiger_refresh_token");

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );

          const { token: accessToken, refreshToken: newRefreshToken } =
            refreshRes.data?.data || refreshRes.data || {};

          if (accessToken) {
            localStorage.setItem("tiger_auth_token", accessToken);
            if (newRefreshToken) {
              localStorage.setItem("tiger_refresh_token", newRefreshToken);
            }
            apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem("tiger_auth_token");
          localStorage.removeItem("tiger_refresh_token");
          localStorage.removeItem("tiger_auth_user");
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Standardizes API responses so both raw responses and wrapped { data, success } formats
 * work seamlessly with frontend components expecting res.data.
 */
export const extractData = (res, fallback = null) => {
  if (!res) return { success: false, data: fallback };
  const payload = res.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload;
  }
  return {
    success: true,
    data: payload !== undefined ? payload : fallback,
  };
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  if (!error) return fallback;

  if (error.response) {
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail;

    if (serverMessage) return serverMessage;

    if (error.response.status === 404) {
      return "The requested record could not be found.";
    }

    if (error.response.status === 500) {
      return "The server is currently unavailable. Please try again in a moment.";
    }
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Unable to connect to the backend right now. Please check your connection and try again.";
  }

  return error.message || fallback;
};

export { apiClient };
export default apiClient;
