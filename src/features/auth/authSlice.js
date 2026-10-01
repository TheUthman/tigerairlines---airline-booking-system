import { createSlice } from "@reduxjs/toolkit";

const getInitialAuthState = () => {
  try {
    const isLoggedOut = localStorage.getItem("tiger_logged_out") === "true";
    if (isLoggedOut) {
      return {
        user: null,
        isAuthenticated: false,
        role: null,
        isAdmin: false,
        token: null,
        loading: false,
        error: null,
      };
    }
    const savedUserRaw = localStorage.getItem("tiger_auth_user");
    const token =
      localStorage.getItem("tiger_auth_token") ||
      localStorage.getItem("tiger_token");
    if (savedUserRaw && token) {
      const user = JSON.parse(savedUserRaw);
      const role = user.role || "CUSTOMER";
      const isAdmin = role === "ADMINISTRATOR" || role === "STAFF";
      return {
        user,
        isAuthenticated: true,
        role,
        isAdmin,
        token,
        loading: false,
        error: null,
      };
    }
    return {
      user: null,
      isAuthenticated: false,
      role: null,
      isAdmin: false,
      token: null,
      loading: false,
      error: null,
    };
  } catch {
    return {
      user: null,
      isAuthenticated: false,
      role: null,
      isAdmin: false,
      token: null,
      loading: false,
      error: null,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.role = action.payload.user.role;
      state.isAdmin =
        action.payload.user.role === "ADMINISTRATOR" ||
        action.payload.user.role === "STAFF";
      state.error = null;
      try {
        localStorage.removeItem("tiger_logged_out");
        localStorage.setItem(
          "tiger_auth_user",
          JSON.stringify(action.payload.user),
        );
        localStorage.setItem("tiger_auth_token", action.payload.token);
      } catch (e) {}
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.isAdmin = false;
      state.error = null;
      try {
        localStorage.setItem("tiger_logged_out", "true");
        localStorage.removeItem("tiger_auth_user");
        localStorage.removeItem("tiger_auth_token");
      } catch (e) {}
    },
    setAdminMode: (state, action) => {
      if (action.payload) {
        state.user = {
          ...state.user,
          role: "ADMINISTRATOR",
        };
        state.isAuthenticated = Boolean(state.user);
        state.role = "ADMINISTRATOR";
        state.isAdmin = true;
        try {
          localStorage.removeItem("tiger_logged_out");
          if (state.user) {
            localStorage.setItem("tiger_auth_user", JSON.stringify(state.user));
          }
        } catch {}
      } else {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.isAdmin = false;
        state.token = null;
        try {
          localStorage.removeItem("tiger_auth_user");
          localStorage.removeItem("tiger_auth_token");
        } catch {}
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});
const { loginSuccess, logout, setAdminMode, setError, setLoading } =
  authSlice.actions;
var stdin_default = authSlice.reducer;
export {
  authSlice,
  stdin_default as default,
  loginSuccess,
  logout,
  setAdminMode,
  setError,
  setLoading,
};
