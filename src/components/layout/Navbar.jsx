import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Shield,
  Plane,
  LogOut,
  ChevronDown,
  Luggage,
  UserCheck,
  Bell,
  Search,
  Globe,
  MapPin,
  Tag,
  HelpCircle,
  Phone,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { useToast } from "../ui/Toast";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar = ({ onOpenAlertsModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isCustomer = Boolean(
    isAuthenticated && user && user.role === "CUSTOMER",
  );
  const isStaff = Boolean(
    isAuthenticated &&
    user &&
    (user.role === "ADMINISTRATOR" || user.role === "STAFF"),
  );
  const dropdownRef = useRef(null);
  const langRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    dispatch(logout());
    toast.info("You have been logged out of your account.");
    navigate("/");
  };

  const primaryLinks = [
    { to: "/", label: "Book" },
    { to: "/check-in", label: "Check-In" },
    { to: "/manage-booking", label: "Manage" },
    { to: "/flight-status", label: "Status" },
    { to: "/my-trips", label: "My Trips" },
  ];

  const moreLinks = [
    { to: "/destinations", label: "Destinations", icon: MapPin },
    { to: "/offers", label: "Offers", icon: Tag },
    { to: "/faq", label: "Help Centre", icon: HelpCircle },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  const mobileLinks = [
    ...primaryLinks,
    ...moreLinks.map(({ to, label }) => ({ to, label })),
  ];
  const moreIsActive = moreLinks.some((link) => isActive(link.to));

  const linkClass = (path) =>
    `text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
      isActive(path) ? "text-secondary" : "text-white/90 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 bg-primary text-white shadow-md z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div style={{ backgroundColor: "white" }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                <img
                  src="/logo.svg"
                  className="w-full h-full object-contain"
                  alt="TigerAirlines logo"
                />
              </div>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-lg sm:text-xl font-extrabold text-white">
                Tiger
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-secondary ml-0.5 hidden xs:inline sm:inline">
                Airlines
              </span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-5 min-w-0">
            {primaryLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                {link.label}
              </Link>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors cursor-pointer ${
                  moreIsActive
                    ? "text-secondary"
                    : "text-white/90 hover:text-white"
                }`}
                aria-expanded={moreMenuOpen}
              >
                Explore
                <ChevronDown
                  size={14}
                  className={`transition-transform ${moreMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {moreMenuOpen && (
                <div className="absolute left-0 mt-3 w-52 bg-surface border border-border rounded-2xl shadow-xl z-50 py-2 text-foreground">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-surface-muted transition ${
                          isActive(link.to) ? "text-primary" : "text-foreground"
                        }`}
                      >
                        <Icon size={14} className="text-primary" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 text-sm shrink-0">
            <button
              type="button"
              onClick={onOpenAlertsModal}
              className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Travel alerts"
              title="Travel Alerts"
            >
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary border border-primary" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Search flights"
              title="Search Flights"
            >
              <Search size={17} />
            </button>

            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Language"
              >
                <Globe size={16} />
                <span className="text-xs font-bold">{selectedLang}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 text-xs text-foreground">
                  {[
                    { code: "EN", flag: "🇬🇧", label: "English" },
                    { code: "HA", flag: "🇳🇬", label: "Hausa" },
                    { code: "YO", flag: "🇳🇬", label: "Yoruba" },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setSelectedLang(l.code);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-surface-muted flex items-center gap-2 transition"
                    >
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle variant="inverse" />

            {isCustomer && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                  aria-expanded={userDropdownOpen}
                  aria-label="User Account Menu"
                >
                  <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-black">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-2xl border border-border py-2 text-foreground z-50">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        {user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50">
                          Customer
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ● Active
                        </span>
                      </div>
                    </div>
                    <div className="py-1 text-xs">
                      <Link
                        to="/my-trips"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-muted text-foreground font-medium transition"
                      >
                        <Luggage size={15} className="text-primary" />
                        <span>My Trips & Bookings</span>
                      </Link>
                      <Link
                        to="/manage-booking"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-muted text-foreground font-medium transition"
                      >
                        <UserCheck size={15} className="text-muted" />
                        <span>Manage Itinerary</span>
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-border px-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary/10 text-red-600 dark:text-red-400 font-semibold text-xs transition cursor-pointer text-left"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isStaff && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary-hover text-on-secondary text-xs font-black transition cursor-pointer shadow-xs"
                  title="Switch to Operations Dashboard"
                >
                  <Shield size={13} />
                  <span>Ops: {user.name.split(" ")[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-white/80 hover:text-white cursor-pointer px-1 py-0.5 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary-hover text-on-secondary text-xs font-black transition cursor-pointer shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="xl:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenAlertsModal}
              className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Alerts"
            >
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary border border-primary" />
            </button>
            <ThemeToggle variant="inverse" />
            {isCustomer && user && (
              <span className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-black">
                {user.name.charAt(0)}
              </span>
            )}
            {isStaff && user && (
              <span
                className="w-7 h-7 rounded-full bg-surface border border-secondary text-secondary flex items-center justify-center text-xs font-black"
                title="Staff session active"
              >
                <Shield size={12} />
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden bg-primary-hover border-t border-white/10 px-4 pt-3 pb-6 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {isCustomer && user ? (
            <div className="p-3 bg-black/20 rounded-xl mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-white/70 truncate">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs bg-red-800 hover:bg-red-700 px-2.5 py-1 rounded-lg text-white font-semibold shrink-0 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : isStaff && user ? (
            <div className="p-3 bg-black/30 rounded-xl mb-3 flex items-center justify-between gap-3 border border-secondary/30">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-secondary" />
                  <p className="text-xs font-bold text-white truncate">
                    {user.name}
                  </p>
                </div>
                <p className="text-[10px] text-secondary font-semibold">
                  {user.role}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to="/admin"
                  className="text-[11px] bg-secondary text-on-secondary px-2.5 py-1 rounded-lg font-bold"
                >
                  Ops
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] bg-red-800 hover:bg-red-700 px-2 py-1 rounded-lg text-white font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                to="/login"
                className="text-center py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-center py-2 rounded-xl bg-secondary text-on-secondary font-black text-xs"
              >
                Register
              </Link>
            </div>
          )}

          {mobileLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                isActive(link.to)
                  ? "bg-white/15 text-secondary"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-white/10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search flights, routes..."
                className="w-full pl-3 pr-8 py-2 text-xs border border-white/20 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-secondary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMobileMenuOpen(false);
                    navigate(`/search?q=${e.target.value}`);
                  }
                }}
              />
              <Search
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
