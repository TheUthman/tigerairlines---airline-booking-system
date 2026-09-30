import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield, Plane, LogOut, ChevronDown, Luggage, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { useToast } from "../ui/Toast";
import ThemeToggle from "../ui/ThemeToggle";
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const isCustomer = Boolean(isAuthenticated && user && user.role === "CUSTOMER");
  const isStaff = Boolean(isAuthenticated && user && (user.role === "ADMINISTRATOR" || user.role === "STAFF"));
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
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
  return <nav className="bg-primary text-white shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {
    /* Brand Logo & Wordmark */
  }
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <div className="w-6 h-6 rounded-md bg-surface flex items-center justify-center text-primary">
                <Plane size={16} className="transform -rotate-45 fill-current" />
              </div>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-xl font-extrabold text-white">Tiger</span>
              <span className="text-xl font-extrabold text-secondary ml-0.5">Airlines</span>
            </div>
          </Link>

          {
    /* Center Navigation Links */
  }
          <div className="hidden lg:flex items-center space-x-6">
            <Link
    to="/"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              Plan Travel
            </Link>
            <Link
    to="/check-in"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/check-in") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              Check-In
            </Link>
            <Link
    to="/manage-booking"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/manage-booking") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              Manage Booking
            </Link>
            <Link
    to="/flight-status"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/flight-status") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              Flight Status
            </Link>
            <Link
    to="/my-trips"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/my-trips") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              My Trips
            </Link>
            <Link
    to="/destinations"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/destinations") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              Destinations
            </Link>
            <Link
    to="/offers"
    className={`text-sm font-semibold transition-colors duration-150 ${isActive("/offers") ? "text-secondary" : "text-white/90 hover:text-white"}`}
  >
              Offers
            </Link>
          </div>

          {
    /* Right Navigation & Auth State */
  }
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <ThemeToggle variant="inverse" />
            {
    /* If logged in as CUSTOMER: User Avatar Dropdown */
  }
            {isCustomer && user ? <div className="relative" ref={dropdownRef}>
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
                  <span className="text-xs font-bold truncate max-w-[130px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
    size={14}
    className={`transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
  />
                </button>

                {
    /* Dropdown Menu */
  }
                {userDropdownOpen && <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-2xl border border-border py-2 text-foreground z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[11px] text-muted truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          Customer
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">● Active</span>
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
    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary/10 text-red-600 font-semibold text-xs transition cursor-pointer text-left"
  >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>}
              </div> : isStaff && user ? (
    /* If logged in as STAFF/ADMIN: Show clear Operations session indicator with link to Admin */
    <div className="flex items-center gap-2">
                <Link
      to="/admin"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary-hover text-on-secondary text-xs font-black transition cursor-pointer shadow-xs"
      title="Switch to Operations Dashboard"
    >
                  <Shield size={13} />
                  <span>Ops: {user.name.split(" ")[0]} ({user.role === "ADMINISTRATOR" ? "Admin" : "Staff"})</span>
                </Link>
                <button
      type="button"
      onClick={handleLogout}
      className="text-xs text-white/80 hover:text-white underline cursor-pointer px-1 py-0.5 font-medium"
    >
                  Sign Out
                </button>
              </div>
  ) : (
    /* If NOT logged in: Swap with Login & Register buttons */
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

            {
    /* Quick Admin Portal link */
  }
            {!isStaff && <Link
    to="/admin"
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-bold text-white/90 hover:text-white transition cursor-pointer"
    title="Switch to Admin Dashboard"
  >
                <Shield size={13} className="text-secondary" />
                <span>Admin</span>
              </Link>}
          </div>

          {
    /* Mobile menu button */
  }
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle variant="inverse" />
            {isCustomer && user && <span className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-black">
                {user.name.charAt(0)}
              </span>}
            {isStaff && user && <span className="w-7 h-7 rounded-full bg-[#111111] border border-secondary text-secondary flex items-center justify-center text-xs font-black" title="Staff session active">
                <Shield size={12} />
              </span>}
            <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
    aria-label="Toggle Navigation Menu"
  >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {
    /* Mobile Drawer */
  }
      {mobileMenuOpen && <div className="lg:hidden bg-primary-hover border-t border-white/10 px-4 pt-3 pb-6 space-y-2">
          {isCustomer && user ? <div className="p-3 bg-black/20 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-white/70">{user.email}</p>
              </div>
              <button
    type="button"
    onClick={handleLogout}
    className="text-xs bg-red-800 hover:bg-red-700 px-2.5 py-1 rounded-lg text-white font-semibold"
  >
                Log Out
              </button>
            </div> : isStaff && user ? <div className="p-3 bg-black/30 rounded-xl mb-3 flex items-center justify-between border border-amber-400/30">
              <div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-secondary" />
                  <p className="text-xs font-bold text-white">{user.name}</p>
                </div>
                <p className="text-[10px] text-secondary font-semibold">{user.role} (Operations)</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
    to="/admin"
    onClick={() => setMobileMenuOpen(false)}
    className="text-[11px] bg-secondary text-on-secondary px-2.5 py-1 rounded-lg font-bold"
  >
                  Ops Console
                </Link>
                <button
    type="button"
    onClick={handleLogout}
    className="text-[11px] bg-red-800 hover:bg-red-700 px-2 py-1 rounded-lg text-white font-semibold"
  >
                  Sign Out
                </button>
              </div>
            </div> : <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
    to="/login"
    onClick={() => setMobileMenuOpen(false)}
    className="text-center py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
  >
                Sign In
              </Link>
              <Link
    to="/register"
    onClick={() => setMobileMenuOpen(false)}
    className="text-center py-2 rounded-xl bg-secondary text-on-secondary font-black text-xs"
  >
                Register
              </Link>
            </div>}

          <Link
    to="/"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-semibold text-secondary"
  >
            Plan Travel
          </Link>
          <Link
    to="/check-in"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
  >
            Check-In
          </Link>
          <Link
    to="/manage-booking"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
  >
            Manage Booking
          </Link>
          <Link
    to="/flight-status"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
  >
            Flight Status
          </Link>
          <Link
    to="/my-trips"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
  >
            My Trips & Loyalty
          </Link>
          <Link
    to="/destinations"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
  >
            Destinations
          </Link>
          <Link
    to="/offers"
    onClick={() => setMobileMenuOpen(false)}
    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
  >
            Special Offers
          </Link>

          <div className="pt-2 border-t border-white/20">
            <Link
    to="/admin"
    onClick={() => setMobileMenuOpen(false)}
    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold bg-white/10 text-white"
  >
              <Shield size={16} className="text-secondary" />
              Admin Portal
            </Link>
          </div>
        </div>}
    </nav>;
};
var stdin_default = Navbar;
export {
  Navbar,
  stdin_default as default
};
