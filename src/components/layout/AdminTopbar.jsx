import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  Search,
  Plane,
  Users,
  Ticket,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAppSelector } from "../../app/store";
import {
  flightService,
  passengerService,
  bookingService,
  notificationService
} from "../../services";

const AdminTopbar = ({
  onToggleMobileSidebar,
  title = "Operations Console"
}) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Notifications State from notificationService (API_ENDPOINTS.md)
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    Promise.all([
      flightService.getFlights(),
      passengerService.getPassengers(),
      bookingService.getBookings(),
      notificationService.getNotifications()
    ]).then(([fRes, pRes, bRes, nRes]) => {
      setFlights(fRes.data || []);
      setPassengers(pRes.data || []);
      setBookings(bRes.data || []);
      setNotifications(nRes.data || []);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const q = searchQuery.toLowerCase().trim();
  const matchedFlights = q
    ? flights
        .filter(
          (f) =>
            f.flightNumber?.toLowerCase().includes(q) ||
            f.origin?.city?.toLowerCase().includes(q) ||
            f.destination?.city?.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedPassengers = q
    ? passengers
        .filter(
          (p) =>
            p.firstName?.toLowerCase().includes(q) ||
            p.lastName?.toLowerCase().includes(q) ||
            p.passportNumber?.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedBookings = q
    ? bookings
        .filter(
          (b) =>
            b.pnr?.toLowerCase().includes(q) ||
            b.passengerName?.toLowerCase().includes(q) ||
            b.flightNumber?.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const totalMatches =
    matchedFlights.length + matchedPassengers.length + matchedBookings.length;

  return (
    <header className="h-16 bg-surface border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-muted hover:bg-surface-muted cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base md:text-lg font-black text-foreground tracking-tight">
          {title}
        </h1>
      </div>

      {/* Global Search Bar with Autocomplete Dropdown */}
      <div ref={searchContainerRef} className="relative hidden md:block w-72 lg:w-96">
        <div className="relative">
          <input
            type="text"
            placeholder="Global search (flights, PNR, passengers)..."
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full bg-surface-muted hover:bg-surface-muted focus:bg-surface border border-border rounded-full pl-9 pr-8 py-2 text-xs text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsOpen(false);
              }}
              className="absolute right-2.5 top-2.5 text-muted hover:text-muted p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Global Search Dropdown */}
        {isOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-11 left-0 right-0 bg-surface rounded-2xl shadow-2xl border border-border p-3 space-y-3 z-50 text-xs">
            {totalMatches === 0 ? (
              <p className="text-center text-muted py-3">
                No matching records found for "{searchQuery}"
              </p>
            ) : (
              <>
                {/* Flights matches */}
                {matchedFlights.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-1 px-1">
                      <Plane size={11} className="text-primary" /> Flights
                    </span>
                    <div className="space-y-1">
                      {matchedFlights.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin/flights");
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-surface-muted flex items-center justify-between cursor-pointer transition"
                        >
                          <span className="font-mono font-bold text-primary">
                            {f.flightNumber}
                          </span>
                          <span className="text-muted">
                            {f.origin?.city} → {f.destination?.city}
                          </span>
                          <span className="text-muted font-mono text-[11px]">
                            {f.departureTime}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bookings matches */}
                {matchedBookings.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-1 px-1">
                      <Ticket size={11} className="text-secondary" /> Bookings
                    </span>
                    <div className="space-y-1">
                      {matchedBookings.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin/bookings");
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-surface-muted flex items-center justify-between cursor-pointer transition"
                        >
                          <span className="font-mono font-bold text-foreground bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px]">
                            {b.pnr}
                          </span>
                          <span className="text-foreground font-medium">
                            {b.passengerName}
                          </span>
                          <span className="text-muted">{b.flightNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passengers matches */}
                {matchedPassengers.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-1 px-1">
                      <Users size={11} className="text-emerald-600" /> Passengers
                    </span>
                    <div className="space-y-1">
                      {matchedPassengers.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin/passengers");
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-surface-muted flex items-center justify-between cursor-pointer transition"
                        >
                          <span className="font-bold text-foreground">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="font-mono text-muted">
                            {p.passportNumber}
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {p.tier || "Standard"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <ThemeToggle />
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Flight Control: ONLINE</span>
        </div>

        {/* Dynamic Notification Bell with Dropdown (Notification Service) */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-muted transition cursor-pointer"
            title="Flight Ops Alerts & Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-2xl border border-border py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Notifications</h4>
                  <p className="text-[10px] text-muted">
                    Live microservice feeds & user alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted py-6 text-xs">
                    No active notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-2.5 hover:bg-surface-muted transition cursor-pointer text-xs ${
                        !n.read ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === "FLIGHT" ? (
                          <Plane size={14} className="text-primary shrink-0 mt-0.5" />
                        ) : n.type === "PAYMENT" ? (
                          <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-foreground text-[11px] leading-snug">
                            {n.title}
                          </p>
                          <p className="text-[10px] text-muted mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-muted mt-1 block">
                            {n.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User preview */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-foreground leading-tight">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[10px] text-muted font-semibold">
              {user?.role || "ADMINISTRATOR"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
