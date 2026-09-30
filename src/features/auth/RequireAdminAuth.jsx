import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/store";
const RequireAdminAuth = ({ children }) => {
  const { isAuthenticated, user, role } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isStaffOrAdmin = isAuthenticated && user && (role === "ADMINISTRATOR" || role === "STAFF" || user.role === "ADMINISTRATOR" || user.role === "STAFF");
  if (!isStaffOrAdmin) {
    const isCustomer = user?.role === "CUSTOMER";
    return <Navigate
      to="/admin/login"
      state={{
        from: location,
        error: isCustomer ? `Access Denied: You are currently signed in as a Customer (${user.name}). TigerAirlines Operations requires Staff or Administrator credentials.` : void 0
      }}
      replace
    />;
  }
  return <>{children}</>;
};
var stdin_default = RequireAdminAuth;
export {
  RequireAdminAuth,
  stdin_default as default
};
