import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Clock3,
  Globe,
  HelpCircle,
  LogOut,
  Luggage,
  MapPin,
  Menu,
  Phone,
  Plane,
  Search,
  Shield,
  Tag,
  UserCheck,
  X,
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
  const isCustomer = Boolean(isAuthenticated && user?.role === "CUSTOMER");
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
    if (!mobileMenuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    dispatch(logout());
    toast.info("You have been logged out of your account.");
    navigate("/");
  };

  const primaryLinks = [
    { to: "/", label: "Flights", icon: Plane },
    { to: "/flight-status", label: "Flight status", icon: Clock3 },
    { to: "/destinations", label: "Destinations", icon: MapPin },
    { to: "/offers", label: "Offers", icon: Tag },
    { to: "/manage-booking", label: "Manage booking", icon: UserCheck },
  ];

  const moreLinks = [
    { to: "/check-in", label: "Online check-in", icon: Luggage },
    { to: "/my-trips", label: "My trips", icon: Plane },
    { to: "/faq", label: "Help centre", icon: HelpCircle },
    { to: "/contact", label: "Contact", icon: Phone },
  ];
  const moreIsActive = moreLinks.some((link) => isActive(link.to));
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Traveler";
  const initials = user?.name?.trim().charAt(0).toUpperCase() || "T";

  const navLinkClass = (path) =>
    `whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
      isActive(path)
        ? "bg-primary/10 text-primary-dark dark:text-primary"
        : "text-foreground/80 hover:bg-surface-muted hover:text-foreground"
    }`;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden border-b border-border/70 bg-surface-muted/70 text-muted md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] md:px-8">
          <span>Travel with confidence. We&apos;re here for the journey.</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAlertsModal}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Bell size={13} aria-hidden="true" />
              Travel alerts
            </button>
            <Link to="/faq" className="transition-colors hover:text-primary">
              Help centre
            </Link>
          </div>
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="border-b border-border bg-surface/95 shadow-sm backdrop-blur-lg"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="TigerAirlines home"
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <img
                src="/logo.svg"
                className="h-10 w-10 object-contain"
                alt=""
                style={{ transform: "rotate(180deg)" }}
              />
            </span>
            <span className="hidden items-baseline tracking-tight sm:flex">
              <span className="text-lg font-bold text-foreground">Tiger</span>
              <span className="ml-0.5 text-lg font-bold text-primary">Airlines</span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            {primaryLinks.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                {link.label}
              </Link>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  moreIsActive || moreMenuOpen
                    ? "bg-primary/10 text-primary-dark dark:text-primary"
                    : "text-foreground/80 hover:bg-surface-muted hover:text-foreground"
                }`}
                aria-expanded={moreMenuOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform ${moreMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 text-foreground shadow-xl">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isActive(link.to)
                            ? "bg-primary/10 font-medium text-primary-dark dark:text-primary"
                            : "text-foreground hover:bg-surface-muted"
                        }`}
                      >
                        <Icon size={16} className="text-primary" aria-hidden="true" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={onOpenAlertsModal}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open travel alerts"
              title="Travel alerts"
            >
              <Bell size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Search flights"
              title="Search flights"
            >
              <Search size={17} aria-hidden="true" />
            </button>

            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen((open) => !open)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Choose language"
                aria-expanded={langMenuOpen}
              >
                <Globe size={16} aria-hidden="true" />
                <span className="text-xs font-semibold">{selectedLang}</span>
                <ChevronDown size={12} aria-hidden="true" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-xl border border-border bg-surface p-1.5 text-sm text-foreground shadow-xl">
                  {[
                    { code: "EN", label: "English" },
                    { code: "HA", label: "Hausa" },
                    { code: "YO", label: "Yoruba" },
                  ].map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => {
                        setSelectedLang(language.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-muted ${
                        selectedLang === language.code
                          ? "font-semibold text-primary-dark dark:text-primary"
                          : "text-foreground"
                      }`}
                      aria-current={selectedLang === language.code ? "true" : undefined}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle />

            {isCustomer && user ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((open) => !open)}
                  className="inline-flex h-10 max-w-40 items-center gap-2 rounded-full border border-border bg-surface px-2.5 text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-expanded={userDropdownOpen}
                  aria-label="Open account menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-dark dark:text-primary">
                    {initials}
                  </span>
                  <span className="max-w-20 truncate text-xs font-semibold">
                    {firstName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-xl">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <span className="mt-2 inline-flex rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                        Customer account
                      </span>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/my-trips"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                      >
                        <Luggage size={16} className="text-primary" aria-hidden="true" />
                        My trips & bookings
                      </Link>
                      <Link
                        to="/manage-booking"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                      >
                        <UserCheck size={16} className="text-muted" aria-hidden="true" />
                        Manage itinerary
                      </Link>
                    </div>
                    <div className="border-t border-border p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                      >
                        <LogOut size={16} aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isStaff && user ? (
              <div className="ml-1 flex items-center gap-2">
                <Link
                  to="/admin"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3.5 text-xs font-semibold text-on-secondary transition-colors hover:bg-secondary-hover"
                  title="Open operations dashboard"
                >
                  <Shield size={14} aria-hidden="true" />
                  Operations
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-2 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted 2xl:inline-flex"
                >
                  Create account
                </Link>
                <Link
                  to="/"
                  className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Book a flight
                </Link>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
            <button
              type="button"
              onClick={onOpenAlertsModal}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open travel alerts"
            >
              <Bell size={17} aria-hidden="true" />
            </button>
            <ThemeToggle />
            {isCustomer && user && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-dark dark:text-primary"
                aria-label={`Signed in as ${firstName}`}
              >
                {initials}
              </span>
            )}
            {isStaff && user && (
              <Link
                to="/admin"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary"
                aria-label="Open operations dashboard"
              >
                <Shield size={14} aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 bg-black/25 backdrop-blur-sm md:top-24 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
          />
          <div
            id="mobile-navigation"
            className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface px-5 pb-8 pt-5 text-foreground shadow-2xl"
          >
            {isCustomer && user ? (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary-dark dark:text-primary">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  Sign out
                </button>
              </div>
            ) : isStaff && user ? (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted p-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Shield size={16} className="shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.role}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
                >
                  Create account
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {primaryLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "bg-primary/10 text-primary-dark dark:text-primary"
                        : "text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    <Icon size={17} className="text-primary" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="my-4 border-t border-border" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Plan and manage
            </p>
            <div className="space-y-1">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "bg-primary/10 text-primary-dark dark:text-primary"
                        : "text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    <Icon size={17} className="text-muted" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <label htmlFor="mobile-flight-search" className="mb-2 block text-xs font-medium text-muted">
                Search flights
              </label>
              <div className="relative">
                <input
                  id="mobile-flight-search"
                  type="search"
                  placeholder="City or airport code"
                  className="min-h-11 w-full rounded-lg border border-border bg-surface px-3.5 pr-10 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                      setMobileMenuOpen(false);
                      navigate(`/search?q=${encodeURIComponent(event.currentTarget.value)}`);
                    }
                  }}
                />
                <Search
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangMenuOpen((open) => !open)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
                  aria-expanded={langMenuOpen}
                >
                  <Globe size={16} aria-hidden="true" />
                  {selectedLang}
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
                {langMenuOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-36 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                    {[
                      { code: "EN", label: "English" },
                      { code: "HA", label: "Hausa" },
                      { code: "YO", label: "Yoruba" },
                    ].map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(language.code);
                          setLangMenuOpen(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted"
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
              >
                Book a flight
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
