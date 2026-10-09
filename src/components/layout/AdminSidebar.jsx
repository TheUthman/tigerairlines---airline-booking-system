import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plane,
  Building2,
  Users,
  Compass,
  CreditCard,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  X,
  ClipboardList,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../features/auth/authSlice";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        to: "/admin",
        label: "Dashboard & reports",
        icon: <LayoutDashboard size={18} aria-hidden="true" />,
        end: true,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        to: "/admin/flights",
        label: "Flights",
        icon: <Plane size={18} aria-hidden="true" />,
      },
      {
        to: "/admin/aircraft",
        label: "Fleet & aircraft",
        icon: <Compass size={18} aria-hidden="true" />,
      },
      {
        to: "/admin/airports",
        label: "Airports",
        icon: <Building2 size={18} aria-hidden="true" />,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        to: "/admin/passengers",
        label: "Passengers",
        icon: <Users size={18} aria-hidden="true" />,
      },
      {
        to: "/admin/bookings",
        label: "Reservations & PNRs",
        icon: <CreditCard size={18} aria-hidden="true" />,
      },
      {
        to: "/admin/users",
        label: "User access",
        icon: <Shield size={18} aria-hidden="true" />,
      },
    ],
  },
];

const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="flex h-full min-h-screen w-[17rem] shrink-0 flex-col justify-between overflow-y-auto border-r border-white/10 bg-[#171717] text-white shadow-xl lg:sticky lg:top-0 lg:h-dvh lg:min-h-0 lg:shadow-none">
      <div>
        <div className="flex h-[4.5rem] items-center justify-between border-b border-white/10 px-5">
          <Link to="/admin" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
              <img src="/logo.svg" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight">
                Tiger<span className="text-primary">Airlines</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Operations
              </span>
            </span>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white focus-visible:outline-white lg:hidden"
              aria-label="Close admin navigation"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-[#171717]">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-white">
              {user?.name || "Administrator"}
            </span>
            <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-wider text-white/55">
              {user?.role || "Administrator"}
            </span>
          </span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-primary">
            OPS
          </span>
        </div>

        <nav aria-label="Operations navigation" className="space-y-5 px-3 pb-5 pt-5">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                {group.label}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-white ${
                        isActive
                          ? "bg-primary font-semibold text-[#171717] shadow-sm"
                          : "text-white/65 hover:bg-white/[0.07] hover:text-white"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/staff"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-white"
        >
          <ClipboardList size={15} aria-hidden="true" /> Staff service desk
        </Link>
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-white"
        >
          <span className="flex items-center gap-2.5">
            <ExternalLink size={15} aria-hidden="true" /> Customer portal
          </span>
          <ChevronRight size={15} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-white/60 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-white"
        >
          <LogOut size={15} aria-hidden="true" /> Sign out
        </button>
      </div>
    </aside>
  );
};

export { AdminSidebar };
export default AdminSidebar;
