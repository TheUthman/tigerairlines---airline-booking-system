import axios from "axios";
import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "/api";
};

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const logDevelopmentApiError = (error) => {
  if (!import.meta.env.DEV) return;

  const request = error?.config;
  const responseData = error?.response?.data;
  console.error("API request failed", {
    method: request?.method?.toUpperCase(),
    url: request?.baseURL
      ? `${request.baseURL}${request.url || ""}`
      : request?.url,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    response: responseData,
    serverMessage:
      typeof responseData === "object"
        ? responseData?.message || responseData?.error
        : responseData,
    code: error?.code,
    message: error?.message,
  });
};

const PUBLIC_AUTH_PATHS = [
  "/auth/register",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verification",
];

const isPublicAuthRoute = (url) =>
  PUBLIC_AUTH_PATHS.some((p) => url?.includes(p));

apiClient.interceptors.request.use((config) => {
  if (config.baseURL?.endsWith("/api") && config.url?.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api/, "");
  }
  if (isPublicAuthRoute(config.url) && config.headers) {
    delete config.headers.Authorization;
  }
  if (!isPublicAuthRoute(config.url)) {
    const token =
      localStorage.getItem("tiger_auth_token") ||
      localStorage.getItem("tiger_token") ||
      sessionStorage.getItem("tiger_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }
  }

  return config;
});

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
    logDevelopmentApiError(error);
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
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
          const baseURL = apiClient.defaults.baseURL || "";
          const refreshRes = await axios.post(
            `${baseURL}/auth/refresh`,
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
          } else {
            throw new Error("Token refresh response did not include an access token.");
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          store.dispatch(logout());
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  },
);

export const extractData = (res, fallback = null) => {
  if (!res) return { success: false, data: fallback };
  const payload = res.data;
  if (
    typeof payload === "string" &&
    (payload.trim().startsWith("<!DOCTYPE") ||
      payload.trim().startsWith("<html"))
  ) {
    return { success: false, data: fallback };
  }
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
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;

    const fieldErrors = Array.isArray(data?.errors)
      ? data.errors
          .map((e) => {
            if (typeof e === "string") return e;
            if (e?.field && e?.defaultMessage) return `${e.field}: ${e.defaultMessage}`;
            return e?.defaultMessage || e?.msg || e?.message || null;
          })
          .filter(Boolean)
          .join(", ")
      : data?.errors && typeof data.errors === "object"
        ? Object.entries(data.errors)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(", ")
        : null;

    const rawMessage = data?.message || data?.detail;
    const isGenericErrorPhrase =
      typeof data?.error === "string" &&
      ["bad request", "internal server error", "unauthorized", "forbidden", "not found"].includes(
        data.error.trim().toLowerCase(),
      );
    const specificError = !isGenericErrorPhrase ? data?.error : null;

    const serverMessage = rawMessage || fieldErrors || specificError;

    if (serverMessage) {
      if (typeof serverMessage === "string" && serverMessage.toLowerCase().includes("already exists")) {
        return "An account with this email address already exists. Please log in.";
      }
      return serverMessage;
    }

    if (error.response.status === 400) {
      return "Invalid request. Please check the information provided and try again.";
    }
    if (error.response.status === 401) {
      return "Your session has expired or credentials are invalid.";
    }
    if (error.response.status === 403) {
      return "You do not have permission to perform this action.";
    }
    if (error.response.status === 404) {
      return "The requested record could not be found.";
    }
    if (error.response.status === 409) {
      return "An account with this email address already exists. Please log in.";
    }
    if (error.response.status >= 500) {
      return "The server encountered an error. Please try again in a moment.";
    }
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    (typeof error.message === "string" &&
      error.message.toLowerCase().includes("timeout"))
  ) {
    return "Request timed out. The server is taking too long to respond.";
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "We can’t reach the service right now. Please check your internet connection and try again in a moment.";
  }

  return error.message || fallback;
};

export { apiClient };
export default apiClient;
