import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/store";
import { logout } from "./authSlice";
import { ShieldAlert, ArrowRight, LogOut, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import { FullPageLoader } from "../../components/ui/LoadingState";
const RequireAuth = ({ children }) => {
  const { isAuthenticated, user, role, loading } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  if (loading) return <FullPageLoader />;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (
    role === "ADMINISTRATOR" ||
    role === "STAFF" ||
    user.role === "ADMINISTRATOR" ||
    user.role === "STAFF"
  ) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-background">
        <div className="max-w-md w-full bg-surface rounded-3xl shadow-xl border border-border p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={34} />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Operations Account Active ({user.role})
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Customer Portal Restricted
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              You are currently signed in with an operations session as{" "}
              <strong className="text-foreground">{user.name}</strong> (
              {user.email}). Flight staff and administrator accounts cannot view
              passenger itineraries, manage consumer bookings, or access the
              consumer ticket wizard.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link to="/admin" className="block w-full">
              <Button
                variant="primary"
                className="w-full justify-center gap-2 font-bold shadow-md h-11"
              >
                <span>Return to Operations Console</span>
                <ArrowRight size={16} />
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                navigate("/login", { state: { from: location } });
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-surface-muted text-foreground text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} className="text-muted" />
              <span>Sign Out & Switch to Customer Account</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-muted transition pt-1"
            >
              <ArrowLeft size={13} /> Back to Public Landing
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
var stdin_default = RequireAuth;
export { RequireAuth, stdin_default as default };
