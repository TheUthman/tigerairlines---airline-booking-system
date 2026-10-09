import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LogOut,
  Plane,
  LayoutDashboard,
  ShieldCheck,
  TicketCheck,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../features/auth/authSlice";

const navigation = [
  { to: "/staff", label: "Service desk", icon: LayoutDashboard, end: true },
  { to: "/staff/bookings", label: "Booking lookup", icon: ClipboardList },
  { to: "/staff/flights", label: "Flight status", icon: Plane },
  { to: "/staff/manifest", label: "Passenger manifest", icon: Users },
  { to: "/staff/check-in", label: "Staff check-in", icon: TicketCheck },
];

const StaffLayout = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/staff" className="flex items-center gap-3 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Plane size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm">TigerAirlines</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted">
                Staff service desk
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-muted sm:inline-flex">
              <ShieldCheck size={15} aria-hidden="true" />
              {user?.name || "Staff"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <LogOut size={15} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <nav
          aria-label="Staff service desk navigation"
          className="flex flex-wrap gap-2"
        >
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "border border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground"
                }`
              }
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export { StaffLayout };
export default StaffLayout;
