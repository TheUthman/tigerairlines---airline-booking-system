import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  User,
  Plus,
  Trash2,
  Award,
  FileText,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";
import { bookingService, passengerService } from "../services";
import { useAppSelector } from "../app/store";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import EmptyState from "../components/ui/EmptyState";
import BoardingPass from "../features/ticket/BoardingPass";
import { Skeleton, TripCardSkeleton } from "../components/ui/Skeleton";

const getAirportCode = (airport) => {
  const value = typeof airport === "string" ? airport.trim() : airport?.code || "";
  return value.match(/\(([A-Z0-9]{3})\)/)?.[1] || (/^[A-Z0-9]{3}$/.test(value) ? value : "");
};

const getRebookPath = (booking) => {
  const origin = getAirportCode(booking.origin);
  const destination = getAirportCode(booking.destination);
  return origin && destination
    ? `/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`
    : "/search";
};

const maskPassportNumber = (passportNumber) => {
  if (!passportNumber) return "Not provided";
  const value = String(passportNumber);
  return value.length > 4
    ? `${value.slice(0, 2)}••••${value.slice(-2)}`
    : "••••";
};

const MyTripsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTravelers, setIsLoadingTravelers] = useState(true);
  const [isSavingTraveler, setIsSavingTraveler] = useState(false);
  const [deletingTravelerId, setDeletingTravelerId] = useState(null);
  const [error, setError] = useState(null);
  const touchStartY = useRef(null);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);
  const [travelers, setTravelers] = useState(() => {
    try {
      const saved = localStorage.getItem("tigerairlines_saved_travelers");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [newTraveler, setNewTraveler] = useState({
    firstName: "",
    lastName: "",
    passportNumber: "",
    nationality: "",
    dateOfBirth: "",
    frequentFlyerNumber: "",
  });
  const profileName = user?.name || "Traveler";
  const profileEmail = user?.email || "Complete your account profile";

  const loadTrips = async ({ refresh = false } = {}) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const bookingsRes = await bookingService.getBookings();
      setBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : []);
    } catch (err) {
      setError(err?.message || "Unable to load your trips right now.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  const [pullDistance, setPullDistance] = useState(0);
  useEffect(() => {
    loadTrips();
    passengerService
      .getMyPassengers()
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setTravelers(res.data);
          try {
            localStorage.setItem(
              "tigerairlines_saved_travelers",
              JSON.stringify(res.data),
            );
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingTravelers(false));
  }, []);

  const handleTouchStart = (event) => {
    if (window.scrollY === 0) touchStartY.current = event.touches[0].clientY;
  };
  const handleTouchMove = (event) => {
    if (touchStartY.current === null || window.scrollY !== 0) return;
    const distance = event.touches[0].clientY - touchStartY.current;
    setPullDistance(Math.min(Math.max(distance, 0), 88));
  };
  const handleTouchEnd = () => {
    touchStartY.current = null;
    if (pullDistance >= 72 && !isRefreshing) loadTrips({ refresh: true });
    else setPullDistance(0);
  };

  const saveTravelersToStorage = (list) => {
    setTravelers(list);
    try {
      localStorage.setItem(
        "tigerairlines_saved_travelers",
        JSON.stringify(list),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTraveler = async (e) => {
    e.preventDefault();
    if (
      !newTraveler.firstName ||
      !newTraveler.lastName ||
      !newTraveler.passportNumber
    ) {
      toast.warning("Please complete all required passenger details.");
      return;
    }

    setIsSavingTraveler(true);
    const optimisticId = `pending-${Date.now()}`;
    const optimisticTraveler = {
      ...newTraveler,
      id: optimisticId,
      pending: true,
    };
    setTravelers((current) => [...current, optimisticTraveler]);
    try {
      // POST /api/passengers
      const createdRes = await passengerService.createPassenger({
        ...newTraveler,
        documentNumber: newTraveler.passportNumber,
      });
      const created = {
        ...newTraveler,
        ...(createdRes?.data || {}),
        id: createdRes?.data?.id || optimisticId,
        pending: false,
      };
      const updated = [...travelers, created];
      saveTravelersToStorage(updated);
      setShowAddTravelerModal(false);
      setNewTraveler({
        firstName: "",
        lastName: "",
    passportNumber: "",
    nationality: "",
    dateOfBirth: "",
    frequentFlyerNumber: "",
      });
      toast.success(
        `Saved traveler profile for ${created.firstName} ${created.lastName}`,
      );
    } catch (err) {
      setTravelers((current) =>
        current.filter((traveler) => traveler.id !== optimisticId),
      );
      toast.error(err?.message || "Failed to save passenger profile");
    } finally {
      setIsSavingTraveler(false);
    }
  };

  const handleDeleteTraveler = async (id, name) => {
    setDeletingTravelerId(id);
    try {
      await passengerService.deletePassenger(id);
      const updated = travelers.filter((t) => t.id !== id);
      saveTravelersToStorage(updated);
      toast.info(`Removed ${name} from saved travelers`);
    } catch (err) {
      toast.error(err?.message || `Failed to remove ${name}`);
    } finally {
      setDeletingTravelerId(null);
    }
  };
  const upcomingTrips = bookings.filter((b) => b.status !== "CANCELLED");
  const pastTrips = bookings.filter((b) => b.status === "CANCELLED");
  return (
    <div
      className="bg-background py-10 px-4 md:px-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {(pullDistance > 0 || isRefreshing) && (
          <div
            className="flex justify-center text-primary"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle
              size={20}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="ml-2 text-xs font-semibold">
              {isRefreshing
                ? "Refreshing trips..."
                : pullDistance >= 72
                  ? "Release to refresh"
                  : "Pull to refresh"}
            </span>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            isLoading={isRefreshing}
            onClick={() => loadTrips({ refresh: true })}
            disabled={loading || isRefreshing}
            aria-label="Refresh booking history"
          >
            <RotateCcw size={14} /> Refresh trips
          </Button>
        </div>
        {/* Customer Profile & Loyalty Points Balance Widget */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#171717] p-6 text-white shadow-sm md:p-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-radial from-primary/12 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black">
                {profileName.charAt(0).toUpperCase() || "T"}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                  {profileName}
                </h1>
                <p className="text-xs text-white/70 mt-0.5 font-mono">
                  {profileEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4 sm:p-5">
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Award size={14} aria-hidden="true" /> Upcoming trips
                </span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {upcomingTrips.length}
                </p>
              </div>
              <div className="h-10 w-px bg-white/15" aria-hidden="true" />
              <p className="max-w-36 text-xs leading-relaxed text-white/65">
                Your active reservations, in one place.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          >
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTrips({ refresh: true })}
              isLoading={isRefreshing}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("upcoming");
              setSelectedBookingForPass(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "upcoming" ? "bg-primary text-on-primary shadow-xs" : "text-muted hover:bg-surface-muted"}`}
          >
            Upcoming Trips ({upcomingTrips.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("past");
              setSelectedBookingForPass(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "past" ? "bg-primary text-on-primary shadow-xs" : "text-muted hover:bg-surface-muted"}`}
          >
            Past & Cancelled ({pastTrips.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("travelers");
              setSelectedBookingForPass(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "travelers" ? "bg-primary text-on-primary shadow-xs" : "text-muted hover:bg-surface-muted"}`}
          >
            Saved Travelers ({travelers.length})
          </button>
        </div>

        {/* TAB 1: Upcoming Trips */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            {loading ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                aria-label="Loading bookings"
              >
                <TripCardSkeleton />
                <TripCardSkeleton />
              </div>
            ) : error &&
              bookings.length === 0 ? null : selectedBookingForPass ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBookingForPass(null)}
                  className="font-bold"
                >
                  ← Back to Trips List
                </Button>
                <BoardingPass booking={selectedBookingForPass} />
              </div>
            ) : upcomingTrips.length === 0 ? (
              <EmptyState
                title="No Upcoming Flights"
                description="No upcoming reservations are available. Browse flights to plan your next journey."
                actionLabel="Book a Flight"
                onAction={() => navigate("/search")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingTrips.map((b) => (
                  <div
                    key={b.id}
                    className="bg-surface rounded-3xl p-6 shadow-sm border border-border hover:shadow-md transition space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded">
                          PNR: {b.pnr}
                        </span>
                        <p className="text-xs text-muted mt-1">
                          {b.createdAt
                            ? `Booked on ${new Date(b.createdAt).toLocaleDateString()}`
                            : "Booking date unavailable"}
                        </p>
                      </div>
                      <Badge variant={b.status === "CONFIRMED" ? "success" : "warning"}>
                        {b.status === "CONFIRMED" ? "Confirmed" : b.status === "PENDING_PAYMENT" ? "Payment pending" : b.status || "Status unavailable"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted">
                          Departure
                        </span>
                        <p className="text-lg font-black text-foreground">
                          {b.origin}
                        </p>
                        <p className="text-xs text-muted font-mono">
                          {b.departureDate} • {b.departureTime}
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted font-bold font-mono">
                          {b.flightNumber}
                        </span>
                        <Plane
                          size={18}
                          className="text-primary transform rotate-90 my-1"
                        />
                        <span className="text-[10px] font-bold text-muted">
                          {b.stops === 0 ? "Non-stop" : b.stops != null ? `${b.stops} stop${Number(b.stops) === 1 ? "" : "s"}` : "Route details"}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted">
                          Destination
                        </span>
                        <p className="text-lg font-black text-foreground">
                          {b.destination}
                        </p>
                        <p className="text-xs text-muted font-mono">{b.arrivalTime || "—"}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-background rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted text-[10px] uppercase font-bold block">
                          Passenger
                        </span>
                        <span className="font-bold text-foreground">
                          {b.passengerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] uppercase font-bold block">
                          Seat
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {b.seatNumber || "Unassigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] uppercase font-bold block">
                          Class
                        </span>
                        <span className="font-bold text-foreground">
                          {b.cabinClass}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForPass(b)}
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileText size={14} /> Boarding Pass
                      </button>

                      <div className="flex items-center gap-2">
                        <Link to={`/manage-booking`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs"
                          >
                            Manage
                          </Button>
                        </Link>
                        <Link to={getRebookPath(b)}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="font-bold text-xs gap-1"
                          >
                            Book Again <RotateCcw size={12} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Past / Cancelled Trips */}
        {activeTab === "past" && (
          <div className="space-y-6">
            {loading ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                aria-label="Loading booking history"
              >
                <TripCardSkeleton />
                <TripCardSkeleton />
              </div>
            ) : error && bookings.length === 0 ? null : pastTrips.length ===
              0 ? (
              <EmptyState
                title="No Past Trips"
                description="Cancelled reservations will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastTrips.map((b) => (
                  <div
                    key={b.id}
                    className="bg-surface rounded-3xl p-6 shadow-sm border border-border opacity-80 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="font-mono text-xs font-bold text-muted">
                        PNR: {b.pnr}
                      </span>
                      <Badge variant={b.paymentStatus === "REFUNDED" ? "success" : "default"}>
                        {b.paymentStatus === "REFUNDED" ? "Cancelled · refunded" : "Cancelled"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-foreground">
                          {b.origin} → {b.destination}
                        </p>
                        <p className="text-muted mt-0.5">{b.departureDate}</p>
                      </div>
                      <Link to={`/search`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-bold"
                        >
                          Rebook Route
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Saved Travelers */}
        {activeTab === "travelers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-foreground">
                  Saved Passenger Profiles
                </h2>
                <p className="text-xs text-muted">
                  Pre-save family and colleague details for instant 1-click
                  booking checkout.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowAddTravelerModal(true)}
                className="font-bold gap-1.5 text-xs"
              >
                <Plus size={15} /> Add Traveler
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingTravelers && travelers.length === 0 ? (
                <>
                  <div className="bg-surface rounded-2xl p-5 border border-border flex gap-3">
                    <Skeleton variant="circle" className="w-10 h-10" />
                    <div className="space-y-2">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-44 h-3" />
                    </div>
                  </div>
                  <div className="bg-surface rounded-2xl p-5 border border-border flex gap-3">
                    <Skeleton variant="circle" className="w-10 h-10" />
                    <div className="space-y-2">
                      <Skeleton className="w-28 h-4" />
                      <Skeleton className="w-40 h-3" />
                    </div>
                  </div>
                </>
              ) : travelers.length === 0 ? (
                <EmptyState
                  title="No saved travelers"
                  description="Add passenger details once to speed up future bookings."
                />
              ) : (
                travelers.map((t) => (
                  <div
                    key={t.id}
                    className="bg-surface rounded-2xl p-5 shadow-sm border border-border flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-muted text-foreground flex items-center justify-center font-bold text-sm shrink-0">
                        <User size={18} />
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-foreground text-sm">
                          {t.firstName} {t.lastName}
                        </p>
                        {t.pending && (
                          <p
                            className="inline-flex items-center gap-1 text-primary text-[11px] font-semibold"
                            role="status"
                          >
                            <LoaderCircle size={12} className="animate-spin" />{" "}
                            Saving traveler...
                          </p>
                        )}
                        <p className="text-muted font-mono">
                          Passport: {maskPassportNumber(t.passportNumber)}
                        </p>
                        <p className="text-muted">
                          Nationality: {t.nationality} • DOB: {t.dateOfBirth}
                        </p>
                        {t.frequentFlyerNumber && (
                          <span className="inline-block text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                            Miles ID: {t.frequentFlyerNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={t.pending || deletingTravelerId === t.id}
                      onClick={() =>
                        handleDeleteTraveler(
                          t.id,
                          `${t.firstName} ${t.lastName}`,
                        )
                      }
                      className="p-1.5 text-muted hover:text-red-600 rounded-lg transition disabled:opacity-50"
                      title="Delete traveler"
                    >
                      {deletingTravelerId === t.id ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal: Add Traveler */}
        {showAddTravelerModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="traveler-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <div className="bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h3
                id="traveler-modal-title"
                className="text-lg font-black text-foreground"
              >
                Add Saved Traveler Profile
              </h3>
              <form onSubmit={handleAddTraveler} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTraveler.firstName}
                      onChange={(e) =>
                        setNewTraveler({
                          ...newTraveler,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTraveler.lastName}
                      onChange={(e) =>
                        setNewTraveler({
                          ...newTraveler,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTraveler.passportNumber}
                    onChange={(e) =>
                      setNewTraveler({
                        ...newTraveler,
                        passportNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full border border-border rounded-xl px-3 py-2 font-mono uppercase text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={newTraveler.nationality}
                      onChange={(e) =>
                        setNewTraveler({
                          ...newTraveler,
                          nationality: e.target.value,
                        })
                      }
                      className="w-full border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={newTraveler.dateOfBirth}
                      onChange={(e) =>
                        setNewTraveler({
                          ...newTraveler,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    TigerMiles Frequent Flyer #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DM-10294"
                    value={newTraveler.frequentFlyerNumber}
                    onChange={(e) =>
                      setNewTraveler({
                        ...newTraveler,
                        frequentFlyerNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full border border-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddTravelerModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSavingTraveler}
                    disabled={isSavingTraveler}
                  >
                    Save Traveler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
var stdin_default = MyTripsPage;
export { MyTripsPage, stdin_default as default };
