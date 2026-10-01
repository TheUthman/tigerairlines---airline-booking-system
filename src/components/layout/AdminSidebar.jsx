import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const menuItems = [
    {
      to: "/admin",
      label: "Dashboard & Reports",
      icon: <LayoutDashboard size={18} />,
      end: true,
    },
    {
      to: "/admin/flights",
      label: "Flights Management",
      icon: <Plane size={18} />,
    },
    {
      to: "/admin/aircraft",
      label: "Fleet & Aircraft",
      icon: <Compass size={18} />,
    },
    {
      to: "/admin/airports",
      label: "Airports & Terminals",
      icon: <Building2 size={18} />,
    },
    {
      to: "/admin/passengers",
      label: "Passengers Registry",
      icon: <Users size={18} />,
    },
    {
      to: "/admin/bookings",
      label: "Reservations & PNRs",
      icon: <CreditCard size={18} />,
    },
    {
      to: "/admin/users",
      label: "User Access & Roles",
      icon: <Shield size={18} />,
    },
  ];
  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };
  return (
    <aside className="w-64 bg-background text-muted flex flex-col justify-between h-screen sticky top-0 border-r border-white/10 shrink-0 z-30">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-background">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fff8f1] border border-orange-200/80 flex items-center justify-center shadow-sm overflow-hidden">
              <img
                src="/logo.svg"
                alt="TigerAirlines logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Tiger
              </span>
              <span className="font-extrabold text-secondary text-base ml-0.5">
                Admin
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-white/10 text-secondary px-2 py-0.5 rounded-full font-bold">
            OPS
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
              {user?.role || "ADMINISTRATOR"}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${isActive ? "bg-primary text-white shadow-sm" : "text-muted hover:text-white hover:bg-white/10"}`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <NavLink
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white hover:bg-white/10 transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} /> Customer Portal
          </span>
          <ChevronRight size={14} />
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition cursor-pointer"
        >
          <LogOut size={14} /> Sign Out of Ops
        </button>
      </div>
    </aside>
  );
};
var stdin_default = AdminSidebar;
export { AdminSidebar, stdin_default as default };
