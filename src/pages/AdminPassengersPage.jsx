import { useEffect, useState } from "react";
import { Search, X, Edit2, Phone, Mail, Award, Plane, Check, Download, CheckSquare } from "lucide-react";
import passengerService from "../services/passengerService";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { exportToCsv } from "../utils/exportCsv";
import EmptyState from "../components/ui/EmptyState";
const maskPassportNumber = (passportNumber) => {
  if (!passportNumber) return "Not provided";
  const value = String(passportNumber);
  return value.length > 4
    ? `${value.slice(0, 2)}••••${value.slice(-2)}`
    : "••••";
};

const AdminPassengersPage = () => {
  const toast = useToast();
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const loadData = async () => {
    setLoading(true);
    const res = await passengerService.getPassengers();
    setPassengers(res.data);
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);
  const openDrawer = (p) => {
    setSelectedPassenger(p);
    setEditFormData(p);
    setIsEditing(false);
  };
  const closeDrawer = () => {
    setSelectedPassenger(null);
    setIsEditing(false);
  };
  const handleSave = async () => {
    if (!selectedPassenger) return;
    setIsSaving(true);
    try {
      await passengerService.updatePassenger(selectedPassenger.id, editFormData);
      setSelectedPassenger({ ...selectedPassenger, ...editFormData });
      setIsEditing(false);
      toast.success(`Updated passenger profile for ${selectedPassenger.firstName} ${selectedPassenger.lastName}`);
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };
  const handleBulkTierUpdate = async (tier) => {
    for (const id of selectedIds) {
      await passengerService.updatePassenger(id, { tier });
    }
    toast.success(`Upgraded ${selectedIds.size} passengers to ${tier} tier.`);
    setSelectedIds(/* @__PURE__ */ new Set());
    await loadData();
  };
  const handleExportCsv = () => {
    const exportData = filtered.map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      passportNumber: p.passportNumber,
      email: p.email,
      phone: p.phone,
      nationality: p.nationality,
      tier: p.tier || "Standard",
      frequentFlyerNumber: p.frequentFlyerNumber || "None",
      totalBookings: p.totalBookings ?? ""
    }));
    exportToCsv("TigerAirlines_Passengers", exportData, [
      { key: "name", label: "Passenger Name" },
      { key: "passportNumber", label: "Passport" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "nationality", label: "Nationality" },
      { key: "tier", label: "Loyalty Tier" },
      { key: "frequentFlyerNumber", label: "Miles ID" },
      { key: "totalBookings", label: "Total Bookings" }
    ]);
    toast.success("Passenger registry exported to CSV");
  };
  const filtered = passengers.filter(
    (p) =>
      [p.firstName, p.lastName, p.email, p.passportNumber, p.nationality]
        .some((value) =>
          String(value || "").toLowerCase().includes(search.toLowerCase())
        )
  );
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };
  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedIds(updated);
  };
  return <div className="admin-data-page p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            Passenger Directory & Miles Registry
          </h2>
          <p className="text-xs text-muted mt-0.5">
            View frequent traveler tiers, passports, and booking histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
    onClick={handleExportCsv}
    variant="outline"
    className="flex items-center gap-2 font-bold text-xs"
  >
            <Download size={14} /> Export CSV
          </Button>

          <div className="relative w-full sm:w-72">
            <input
    type="search"
    aria-label="Search passengers by name, passport, or email"
    placeholder="Search traveler by name, passport, email..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
  />
            <Search size={14} className="absolute left-3 top-2.5 text-muted" />
          </div>
        </div>
      </div>

      {
    /* Bulk Action Bar */
  }
      {selectedIds.size > 0 && <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-red-950 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold">
            <CheckSquare size={16} className="text-primary" />
            <span>{selectedIds.size} passenger(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted font-medium">Bulk Tier Upgrade:</span>
            <button
    type="button"
    onClick={() => handleBulkTierUpdate("Silver")}
    className="px-2.5 py-1 bg-surface border border-border rounded-lg font-bold hover:bg-surface-muted cursor-pointer"
  >
              Silver
            </button>
            <button
    type="button"
    onClick={() => handleBulkTierUpdate("Gold")}
    className="px-2.5 py-1 bg-surface border border-border rounded-lg font-bold hover:bg-surface-muted cursor-pointer text-amber-700"
  >
              Gold
            </button>
            <button
    type="button"
    onClick={() => handleBulkTierUpdate("Platinum")}
    className="px-2.5 py-1 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover cursor-pointer"
  >
              Platinum
            </button>
          </div>
        </div>}

      {
    /* Passengers Table */
  }
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
    type="checkbox"
    checked={selectedIds.size > 0 && selectedIds.size === filtered.length}
    onChange={toggleSelectAll}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                </th>
                <th className="py-3 px-4">Traveler</th>
                <th className="py-3 px-4">Passport</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4">Frequent Flyer Tier</th>
                <th className="py-3 px-4">Bookings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    Loading passenger database...
                  </td>
                </tr> : filtered.length === 0 ? <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <EmptyState
    title="No Passengers Found"
    description="No registered traveler matches your search filter."
    actionLabel="Clear Search"
    onAction={() => setSearch("")}
  />
                  </td>
                </tr> : filtered.map((p) => <tr
    key={p.id}
    className="hover:bg-surface-muted/80 transition"
  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
    type="checkbox"
    checked={selectedIds.has(p.id)}
    onChange={(e) => toggleSelectRow(p.id, e)}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">
                          {p.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-[11px] text-muted font-mono">
                            {p.frequentFlyerNumber || "Standard"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                      <span title="Full document number is available in passenger details">
                        {maskPassportNumber(p.passportNumber)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-foreground">{p.email}</p>
                      <p className="text-[11px] text-muted">{p.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-foreground">{p.nationality}</td>
                    <td className="py-3.5 px-4">
                      <Badge
    variant={p.tier === "Platinum" ? "accent" : p.tier === "Gold" ? "warning" : p.tier === "Silver" ? "neutral" : "blue"}
    size="sm"
  >
                        {p.tier || "Standard"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {p.totalBookings ?? "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
    type="button"
    onClick={() => openDrawer(p)}
    aria-label={`View details for ${p.firstName} ${p.lastName}`}
    className="text-xs font-bold text-primary hover:underline cursor-pointer focus-visible:outline-offset-2"
  >
                        View Details →
                      </button>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Slide-out Drawer */
  }
      {selectedPassenger && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDrawer(); }} className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-black/40 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" aria-labelledby="passenger-drawer-title" onMouseDown={(event) => event.stopPropagation()} className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-border bg-surface p-5 shadow-2xl animate-in slide-in-from-right duration-200 sm:p-6">
            <div>
              {
    /* Header */
  }
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {selectedPassenger.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 id="passenger-drawer-title" className="text-base font-bold text-foreground">
                      {selectedPassenger.firstName} {selectedPassenger.lastName}
                    </h3>
                    <p className="text-xs text-muted font-mono">
                      ID: {selectedPassenger.id}
                    </p>
                  </div>
                </div>
                <button
    type="button"
    onClick={closeDrawer}
    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-offset-2"
    aria-label="Close passenger details"
  >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {
    /* View or Edit mode */
  }
              {!isEditing ? <div className="space-y-6 pt-6 text-xs">
                  {
    /* Tier Banner */
  }
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        TigerMiles tier
                      </p>
                      <p className="text-base font-black text-foreground mt-0.5">
                        {selectedPassenger.tier || "Standard"} Member
                      </p>
                    </div>
                    <Award size={28} className="text-primary" />
                  </div>

                  {
    /* Travel Profile Info */
  }
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Identity & Passport
                    </h4>
                    <div className="bg-background p-4 rounded-xl space-y-2 border border-border">
                      <div className="flex justify-between">
                        <span className="text-muted">Passport Number</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedPassenger.passportNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Nationality</span>
                        <span className="font-semibold text-foreground">
                          {selectedPassenger.nationality}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Date of Birth</span>
                        <span className="text-foreground">
                          {selectedPassenger.dateOfBirth}
                        </span>
                      </div>
                    </div>
                  </div>

                  {
    /* Contact Info */
  }
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Contact Details
                    </h4>
                    <div className="bg-background p-4 rounded-xl space-y-2 border border-border">
                      <div className="flex items-center gap-2 text-foreground">
                        <Mail size={14} className="text-muted" />
                        <span>{selectedPassenger.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone size={14} className="text-muted" />
                        <span>{selectedPassenger.phone}</span>
                      </div>
                    </div>
                  </div>

                  {
    /* Flight Activity */
  }
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Travel Activity
                    </h4>
                    <div className="bg-background p-4 rounded-xl flex items-center justify-between border border-border">
                      <div>
                        <p className="text-muted">Total Bookings Completed</p>
                        <p className="text-xl font-mono font-black text-foreground mt-1">
                          {selectedPassenger.totalBookings ?? "—"} Flights
                        </p>
                      </div>
                      <Plane size={24} className="text-muted" />
                    </div>
                  </div>
                </div> : (
    /* Edit Form */
    <div className="space-y-4 pt-6 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">First Name</label>
                    <Input
      value={editFormData.firstName || ""}
      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Last Name</label>
                    <Input
      value={editFormData.lastName || ""}
      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Email</label>
                    <Input
      type="email"
      value={editFormData.email || ""}
      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Passport Number</label>
                    <Input
      value={editFormData.passportNumber || ""}
      onChange={(e) => setEditFormData({
        ...editFormData,
        passportNumber: e.target.value.toUpperCase()
      })}
    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Frequent Flyer Tier</label>
                    <select
      value={editFormData.tier || "Standard"}
      onChange={(e) => setEditFormData({
        ...editFormData,
        tier: e.target.value
      })}
      className="w-full bg-surface border border-border rounded-lg p-2 font-medium"
    >
                      <option value="Standard">Standard</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                </div>
  )}
            </div>

            {
    /* Bottom Actions */
  }
            <div className="pt-6 border-t border-border flex items-center justify-between">
              {!isEditing ? <>
                  <Button variant="secondary" onClick={closeDrawer}>
                    Close
                  </Button>
                  <Button
    variant="primary"
    onClick={() => setIsEditing(true)}
    className="flex items-center gap-1.5"
  >
                    <Edit2 size={13} /> Edit Profile
                  </Button>
                </> : <>
                  <Button
    variant="secondary"
    onClick={() => setIsEditing(false)}
    disabled={isSaving}
  >
                    Cancel
                  </Button>
                  <Button
    variant="primary"
    onClick={handleSave}
    isLoading={isSaving}
    className="flex items-center gap-1.5"
  >
                    <Check size={14} /> Save Changes
                  </Button>
                </>}
            </div>
          </div>
        </div>}
    </div>;
};
var stdin_default = AdminPassengersPage;
export {
  AdminPassengersPage,
  stdin_default as default
};
