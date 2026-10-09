import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/store";
import { FullPageLoader } from "../../components/ui/LoadingState";
const RequireAdminAuth = ({ children }) => {
  const { isAuthenticated, user, role, loading } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();
  if (loading) return <FullPageLoader label="Loading operations console..." />;
  const isAdministrator =
    isAuthenticated &&
    user &&
    (role === "ADMINISTRATOR" || user.role === "ADMINISTRATOR");
  if (!isAdministrator) {
    const isCustomer = user?.role === "CUSTOMER";
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          error: isCustomer
            ? `Access Denied: You are currently signed in as a Customer (${user.name}). Administrator access is required.`
            : user?.role === "STAFF"
              ? "Staff accounts use the service desk, not administrator controls."
              : undefined,
        }}
        replace
      />
    );
  }
  return <>{children}</>;
};
var stdin_default = RequireAdminAuth;
export { RequireAdminAuth, stdin_default as default };
