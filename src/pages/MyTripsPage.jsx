import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  User,
  Plus,
  Trash2,
  Award,
  FileText,
  RotateCcw
} from "lucide-react";
import { bookingService, passengerService } from "../services";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import EmptyState from "../components/ui/EmptyState";
import BoardingPass from "../features/ticket/BoardingPass";

const DEFAULT_TRAVELERS = [
  {
    id: "trv-1",
    firstName: "Chukwuemeka",
    lastName: "Obi",
    passportNumber: "A10293847",
    nationality: "Nigerian",
    dateOfBirth: "1992-05-14",
    frequentFlyerNumber: "DM-89410"
  },
  {
    id: "trv-2",
    firstName: "Ngozi",
    lastName: "Adeleke",
    passportNumber: "B29384756",
    nationality: "Nigerian",
    dateOfBirth: "1988-11-20",
    frequentFlyerNumber: "DM-77201"
  }
];

const MyTripsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);
  const [travelers, setTravelers] = useState(() => {
    try {
      const saved = localStorage.getItem("tigerairlines_saved_travelers");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TRAVELERS;
  });
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [newTraveler, setNewTraveler] = useState({
    firstName: "",
    lastName: "",
    passportNumber: "",
    nationality: "Nigerian",
    dateOfBirth: "1995-01-01",
    frequentFlyerNumber: ""
  });

  useEffect(() => {
    // Fetch bookings for caller
    bookingService.getBookings().then((res) => {
      setBookings(res.data);
      setLoading(false);
    });

    // Fetch caller's registered passengers via GET /api/passengers/me
    passengerService.getMyPassengers().then((res) => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setTravelers(res.data);
        try {
          localStorage.setItem("tigerairlines_saved_travelers", JSON.stringify(res.data));
        } catch (e) {}
      }
    }).catch(() => {
      // Keep local travelers if offline/mock
    });
  }, []);

  const saveTravelersToStorage = (list) => {
    setTravelers(list);
    try {
      localStorage.setItem("tigerairlines_saved_travelers", JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTraveler = async (e) => {
    e.preventDefault();
    if (!newTraveler.firstName || !newTraveler.lastName || !newTraveler.passportNumber) {
      toast.warning("Please complete all required passenger details.");
      return;
    }

    try {
      // POST /api/passengers
      const createdRes = await passengerService.createPassenger({
        ...newTraveler,
        documentNumber: newTraveler.passportNumber
      });
      const created = createdRes?.data || newTraveler;
      const updated = [...travelers, created];
      saveTravelersToStorage(updated);
      setShowAddTravelerModal(false);
      setNewTraveler({
        firstName: "",
        lastName: "",
        passportNumber: "",
        nationality: "Nigerian",
        dateOfBirth: "1995-01-01",
        frequentFlyerNumber: ""
      });
      toast.success(`Saved traveler profile for ${created.firstName} ${created.lastName}`);
    } catch (err) {
      toast.error(err?.message || "Failed to save passenger profile");
    }
  };

  const handleDeleteTraveler = async (id, name) => {
    try {
      await passengerService.deletePassenger(id);
      const updated = travelers.filter((t) => t.id !== id);
      saveTravelersToStorage(updated);
      toast.info(`Removed ${name} from saved travelers`);
    } catch (err) {
      toast.error(err?.message || `Failed to remove ${name}`);
    }
  };
  const upcomingTrips = bookings.filter((b) => b.status !== "CANCELLED");
  const pastTrips = bookings.filter((b) => b.status === "CANCELLED");
  return <div className="min-h-screen bg-background py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {
    /* Customer Profile & Loyalty Points Balance Widget */
  }
        <div className="bg-gradient-to-r from-primary via-primary-hover to-[#111111] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-secondary/20 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black">
                PS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight">
                    Chukwuemeka Obi
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-secondary text-on-secondary px-2 py-0.5 rounded-full">
                    Gold Tier
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5 font-mono">
                  Member ID: DM-89410 • Lagos Resident
                </p>
              </div>
            </div>

            {
    /* Points Balance Widget */
  }
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <Award size={14} /> Tiger Miles Balance
                </span>
                <p className="text-2xl md:text-3xl font-black text-white mt-1">
                  18,450 <span className="text-xs font-normal text-white/70">Miles</span>
                </p>
              </div>

              <div className="space-y-1.5 w-full sm:w-48">
                <div className="flex justify-between text-[11px] text-white/80 font-medium">
                  <span>To Platinum</span>
                  <span>1,550 miles left</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-secondary rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {
    /* Navigation Tabs */
  }
        <div className="flex items-center gap-3 border-b border-border pb-2">
          <button
    type="button"
    onClick={() => {
      setActiveTab("upcoming");
      setSelectedBookingForPass(null);
    }}
    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "upcoming" ? "bg-primary text-white shadow-xs" : "text-muted hover:bg-surface-muted"}`}
  >
            Upcoming Trips ({upcomingTrips.length})
          </button>
          <button
    type="button"
    onClick={() => {
      setActiveTab("past");
      setSelectedBookingForPass(null);
    }}
    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "past" ? "bg-primary text-white shadow-xs" : "text-muted hover:bg-surface-muted"}`}
  >
            Past & Cancelled ({pastTrips.length})
          </button>
          <button
    type="button"
    onClick={() => {
      setActiveTab("travelers");
      setSelectedBookingForPass(null);
    }}
    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "travelers" ? "bg-primary text-white shadow-xs" : "text-muted hover:bg-surface-muted"}`}
  >
            Saved Travelers ({travelers.length})
          </button>
        </div>

        {
    /* TAB 1: Upcoming Trips */
  }
        {activeTab === "upcoming" && <div className="space-y-6">
            {selectedBookingForPass ? <div className="space-y-4">
                <Button
    variant="outline"
    size="sm"
    onClick={() => setSelectedBookingForPass(null)}
    className="font-bold"
  >
                  ← Back to Trips List
                </Button>
                <BoardingPass booking={selectedBookingForPass} />
              </div> : upcomingTrips.length === 0 ? <EmptyState
    title="No Upcoming Flights"
    description="You don't have any active bookings scheduled right now. Explore Nigerian routes and start your next journey."
    actionLabel="Book a Flight"
    onAction={() => navigate("/search")}
  /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingTrips.map((b) => <div
    key={b.id}
    className="bg-surface rounded-3xl p-6 shadow-sm border border-border hover:shadow-md transition space-y-5"
  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded">
                          PNR: {b.pnr}
                        </span>
                        <p className="text-xs text-muted mt-1">Booked on {new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="success">Confirmed</Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted">Departure</span>
                        <p className="text-lg font-black text-foreground">{b.origin}</p>
                        <p className="text-xs text-muted font-mono">{b.departureDate} • {b.departureTime}</p>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted font-bold font-mono">{b.flightNumber}</span>
                        <Plane size={18} className="text-primary transform rotate-90 my-1" />
                        <span className="text-[10px] text-emerald-600 font-bold">Direct</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted">Destination</span>
                        <p className="text-lg font-black text-foreground">{b.destination}</p>
                        <p className="text-xs text-muted font-mono">11:45</p>
                      </div>
                    </div>

                    <div className="p-3 bg-background rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted text-[10px] uppercase font-bold block">Passenger</span>
                        <span className="font-bold text-foreground">{b.passengerName}</span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] uppercase font-bold block">Seat</span>
                        <span className="font-mono font-bold text-primary">{b.seatNumber || "12A"}</span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] uppercase font-bold block">Class</span>
                        <span className="font-bold text-foreground">{b.cabinClass}</span>
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
                          <Button variant="outline" size="sm" className="font-bold text-xs">
                            Manage
                          </Button>
                        </Link>
                        <Link to={`/search?from=LOS&to=ABV`}>
                          <Button variant="primary" size="sm" className="font-bold text-xs gap-1">
                            Book Again <RotateCcw size={12} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>)}
              </div>}
          </div>}

        {
    /* TAB 2: Past / Cancelled Trips */
  }
        {activeTab === "past" && <div className="space-y-6">
            {pastTrips.length === 0 ? <EmptyState
    title="No Past Trips"
    description="Your flight history is clean with zero cancelled or past flights."
  /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastTrips.map((b) => <div
    key={b.id}
    className="bg-surface rounded-3xl p-6 shadow-sm border border-border opacity-80 space-y-4"
  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="font-mono text-xs font-bold text-muted">
                        PNR: {b.pnr}
                      </span>
                      <Badge variant="primary">Cancelled / Refunded</Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-foreground">{b.origin} → {b.destination}</p>
                        <p className="text-muted mt-0.5">{b.departureDate}</p>
                      </div>
                      <Link to={`/search`}>
                        <Button variant="outline" size="sm" className="text-xs font-bold">
                          Rebook Route
                        </Button>
                      </Link>
                    </div>
                  </div>)}
              </div>}
          </div>}

        {
    /* TAB 3: Saved Travelers */
  }
        {activeTab === "travelers" && <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-foreground">Saved Passenger Profiles</h2>
                <p className="text-xs text-muted">
                  Pre-save family and colleague details for instant 1-click booking checkout.
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
              {travelers.map((t) => <div
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
                      <p className="text-muted font-mono">Passport: {t.passportNumber}</p>
                      <p className="text-muted">Nationality: {t.nationality} • DOB: {t.dateOfBirth}</p>
                      {t.frequentFlyerNumber && <span className="inline-block text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          Miles ID: {t.frequentFlyerNumber}
                        </span>}
                    </div>
                  </div>

                  <button
    type="button"
    onClick={() => handleDeleteTraveler(t.id, `${t.firstName} ${t.lastName}`)}
    className="p-1.5 text-muted hover:text-red-600 rounded-lg transition"
    title="Delete traveler"
  >
                    <Trash2 size={16} />
                  </button>
                </div>)}
            </div>
          </div>}

        {
    /* Modal: Add Traveler */
  }
        {showAddTravelerModal && <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="traveler-modal-title"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
  >
            <div className="bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h3 id="traveler-modal-title" className="text-lg font-black text-foreground">
                Add Saved Traveler Profile
              </h3>
              <form onSubmit={handleAddTraveler} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">First Name *</label>
                    <input
    type="text"
    required
    value={newTraveler.firstName}
    onChange={(e) => setNewTraveler({ ...newTraveler, firstName: e.target.value })}
    className="w-full border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
  />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Last Name *</label>
                    <input
    type="text"
    required
    value={newTraveler.lastName}
    onChange={(e) => setNewTraveler({ ...newTraveler, lastName: e.target.value })}
    className="w-full border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
  />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Passport Number *</label>
                  <input
    type="text"
    required
    value={newTraveler.passportNumber}
    onChange={(e) => setNewTraveler({ ...newTraveler, passportNumber: e.target.value.toUpperCase() })}
    className="w-full border border-border rounded-xl px-3 py-2 font-mono uppercase text-xs focus:outline-none focus:border-primary"
  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Nationality</label>
                    <input
    type="text"
    value={newTraveler.nationality}
    onChange={(e) => setNewTraveler({ ...newTraveler, nationality: e.target.value })}
    className="w-full border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
  />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Date of Birth</label>
                    <input
    type="date"
    value={newTraveler.dateOfBirth}
    onChange={(e) => setNewTraveler({ ...newTraveler, dateOfBirth: e.target.value })}
    className="w-full border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
  />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Druk Miles Frequent Flyer #</label>
                  <input
    type="text"
    placeholder="e.g. DM-10294"
    value={newTraveler.frequentFlyerNumber}
    onChange={(e) => setNewTraveler({ ...newTraveler, frequentFlyerNumber: e.target.value.toUpperCase() })}
    className="w-full border border-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddTravelerModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Traveler
                  </Button>
                </div>
              </form>
            </div>
          </div>}
      </div>
    </div>;
};
var stdin_default = MyTripsPage;
export {
  MyTripsPage,
  stdin_default as default
};
