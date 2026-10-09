import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/store";
import { FullPageLoader } from "../../components/ui/LoadingState";

const RequireStaffAuth = ({ children }) => {
  const { isAuthenticated, user, role, loading } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  if (loading) return <FullPageLoader label="Loading staff service desk..." />;

  const hasStaffAccess =
    isAuthenticated &&
    user &&
    (role === "STAFF" ||
      role === "ADMINISTRATOR" ||
      user.role === "STAFF" ||
      user.role === "ADMINISTRATOR");

  if (!hasStaffAccess) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          error: user
            ? "Staff or administrator access is required for the service desk."
            : undefined,
        }}
        replace
      />
    );
  }

  return children;
};

export { RequireStaffAuth };
export default RequireStaffAuth;
