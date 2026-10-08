import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Ban,
  ArrowRight,
  Download,
  CheckSquare,
  Clock3
} from "lucide-react";
import flightService from "../services/flightService";
import { getApiErrorMessage } from "../services/apiClient";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import FlightForm from "../features/admin/flights/FlightForm";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/Toast";
import { exportToCsv } from "../utils/exportCsv";
import { formatNaira } from "../utils/formatNaira";
import EmptyState from "../components/ui/EmptyState";
const AdminFlightsPage = () => {
  const toast = useToast();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const loadFlights = async () => {
    setLoading(true);
    try {
      const res = await flightService.getFlights();
      const records = res?.data;
      setFlights(Array.isArray(records) ? records : Array.isArray(records?.content) ? records.content : []);
    } catch (error) {
      setFlights([]);
      toast.error(getApiErrorMessage(error, "Unable to load flights."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadFlights();
  }, []);
  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const flightRequest = {
        ...formData,
        airline: editingFlight?.airline || "TigerAirlines",
        fare: Number(formData.fare),
        businessFare: Number(formData.businessFare),
        availableSeats: Number(formData.availableSeats),
        totalSeats: Number(formData.totalSeats),
      };
      if (editingFlight) {
        await flightService.updateFlight(editingFlight.id, flightRequest);
        toast.success(`Flight ${formData.flightNumber} successfully updated.`);
      } else {
        await flightService.createFlight(flightRequest);
        toast.success(`Flight ${formData.flightNumber} added to schedule.`);
      }
      setModalOpen(false);
      setEditingFlight(null);
      await loadFlights();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          error.message ||
            "Unable to save the flight. Check the details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await flightService.cancelFlight(deleteTarget.id);
      toast.info(`Flight ${deleteTarget.flightNumber} was cancelled.`);
      setDeleteTarget(null);
      await loadFlights();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to cancel this flight."));
    } finally {
      setIsDeleting(false);
    }
  };
  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await flightService.cancelFlight(id);
      }
      toast.info(`Successfully cancelled ${selectedIds.size} flights.`);
      setSelectedIds(/* @__PURE__ */ new Set());
      setShowBulkDeleteModal(false);
      await loadFlights();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to cancel the selected flights."));
      await loadFlights();
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDelayFlight = async (flight) => {
    try {
      await flightService.delayFlight(flight.id, 15);
      toast.success(`Flight ${flight.flightNumber} delayed by 15 minutes.`);
      await loadFlights();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delay this flight."));
    }
  };
  const handleExportCsv = () => {
    const exportData = filtered.map((f) => ({
      flightNumber: f.flightNumber,
      origin: typeof f.origin === "string" ? f.origin : f.origin?.code || "",
      destination: typeof f.destination === "string" ? f.destination : f.destination?.code || "",
      departureDate: f.departureDate,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      airline: f.airline,
      aircraftCode: f.aircraftCode || f.aircraft,
      fare: f.fare ?? f.priceEconomy,
      businessFare: f.businessFare ?? f.priceBusiness ?? 0,
      availableSeats: f.availableSeats ?? f.availableSeatsEconomy,
      totalSeats: f.totalSeats,
      status: f.status,
    }));
    exportToCsv("TigerAirlines_Flights", exportData, [
      { key: "flightNumber", label: "Flight Number" },
      { key: "origin", label: "Origin" },
      { key: "destination", label: "Destination" },
      { key: "departureDate", label: "Date" },
      { key: "departureTime", label: "Departure" },
      { key: "arrivalTime", label: "Arrival" },
      { key: "airline", label: "Airline" },
      { key: "aircraftCode", label: "Aircraft Code" },
      { key: "status", label: "Status" },
      { key: "fare", label: "Fare (NGN)" },
      { key: "businessFare", label: "Business Fare (NGN)" },
      { key: "availableSeats", label: "Available Seats" },
      { key: "totalSeats", label: "Total Seats" },
    ]);
    toast.success("Flight manifest exported to CSV");
  };
  const filtered = flights.filter((f) => {
    const searchText = search.toLowerCase();
    const origin = typeof f.origin === "string" ? f.origin : f.origin?.code || "";
    const destination = typeof f.destination === "string" ? f.destination : f.destination?.code || "";
    const aircraftCode = f.aircraftCode || f.aircraft || "";
    const matchesSearch = [f.flightNumber, origin, destination, f.airline, aircraftCode]
      .some((value) => String(value || "").toLowerCase().includes(searchText));
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedFlights = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedFlights.length) {
      setSelectedIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedIds(new Set(paginatedFlights.map((f) => f.id)));
    }
  };
  const toggleSelectRow = (id) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedIds(updated);
  };
  return <div className="admin-data-page p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {
    /* Top Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            Flights Management
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Manage flight schedules, fares, seat capacity, delays, and cancellations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
    onClick={handleExportCsv}
    variant="outline"
    className="flex items-center gap-2 font-bold text-xs"
  >
            <Download size={14} /> Export CSV
          </Button>

          <Button
    onClick={() => {
      setEditingFlight(null);
      setModalOpen(true);
    }}
    variant="primary"
    className="flex items-center gap-2 font-bold shadow-sm text-xs"
  >
            <Plus size={16} /> Schedule New Flight
          </Button>
        </div>
      </div>

      {
    /* Filter, Search, and Bulk Actions Toolbar */
  }
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <input
    type="text"
    placeholder="Search flight #, airport code, airline, or aircraft..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }}
    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
  />
          <Search size={14} className="absolute left-3 top-2.5 text-muted" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted">Status:</span>
          <select
    value={statusFilter}
    onChange={(e) => {
      setStatusFilter(e.target.value);
      setCurrentPage(1);
    }}
    className="bg-surface border border-border rounded-lg px-2.5 py-1.5 font-medium text-foreground focus:outline-none text-xs"
  >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="BOARDING">BOARDING</option>
            <option value="DEPARTED">DEPARTED</option>
            <option value="DELAYED">DELAYED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {
    /* Bulk Action Bar (when rows are selected) */
  }
      {selectedIds.size > 0 && <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-red-950 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold">
            <CheckSquare size={16} className="text-primary" />
            <span>{selectedIds.size} flight(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
    variant="danger"
    size="sm"
    onClick={() => setShowBulkDeleteModal(true)}
    className="font-bold text-xs"
  >
              Cancel Selected ({selectedIds.size})
            </Button>
          </div>
        </div>}

      {
    /* Flights Table */
  }
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
    type="checkbox"
    checked={selectedIds.size > 0 && selectedIds.size === paginatedFlights.length}
    onChange={toggleSelectAll}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                </th>
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Departure / Arrival</th>
                <th className="py-3 px-4">Airline / Aircraft</th>
                <th className="py-3 px-4">Economy / Business</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? <tr>
                  <td colSpan={9} className="py-12 text-center text-muted">
                    Loading flight data...
                  </td>
                </tr> : paginatedFlights.length === 0 ? <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <EmptyState
    title="No Flights Found"
    description="No flight records matched your search query or status filter."
    actionLabel="Reset Filters"
    onAction={() => {
      setSearch("");
      setStatusFilter("ALL");
    }}
  />
                  </td>
                </tr> : paginatedFlights.map((f) => <tr key={f.id} className="hover:bg-surface-muted/70 transition">
                    <td className="py-3.5 px-4">
                      <input
    type="checkbox"
    checked={selectedIds.has(f.id)}
    onChange={() => toggleSelectRow(f.id)}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                      {f.flightNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">
                        {typeof f.origin === "string" ? f.origin : f.origin?.code || "—"}
                        {" "}<ArrowRight size={12} className="inline text-muted" />{" "}
                        {typeof f.destination === "string" ? f.destination : f.destination?.code || "—"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-foreground">
                        {f.departureTime} – {f.arrivalTime}
                      </div>
                      <div className="text-[11px] text-muted">{f.departureDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{f.airline || "—"}</div>
                      <div className="text-[11px] text-muted">{f.aircraftCode || f.aircraft || "No aircraft code"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-foreground">
                      <div><span className="font-semibold">E:</span> {formatNaira(f.fare ?? f.priceEconomy ?? 0)}</div>
                      <div className="text-muted"><span className="font-semibold">B:</span> {Number(f.businessFare ?? f.priceBusiness) > 0 ? formatNaira(f.businessFare ?? f.priceBusiness) : "Not offered"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div><span className="font-bold">{f.availableSeats ?? f.availableSeatsEconomy ?? 0}</span> available</div>
                      <div className="text-muted">of {f.totalSeats ?? "—"} total</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
    variant={f.status === "BOARDING" ? "accent" : f.status === "DEPARTED" ? "blue" : f.status === "DELAYED" ? "warning" : f.status === "CANCELLED" ? "primary" : "success"}
  >
                        {f.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
    onClick={() => handleDelayFlight(f)}
    disabled={!f.active || f.status === "CANCELLED" || f.status === "DEPARTED"}
    className="p-1.5 text-muted hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
    title="Delay flight by 15 minutes"
  >
                          <Clock3 size={14} />
                        </button>
                        <button
    onClick={() => {
      setEditingFlight(f);
      setModalOpen(true);
    }}
    className="p-1.5 text-muted hover:text-foreground hover:bg-surface-muted rounded-lg transition cursor-pointer"
    title="Edit Flight"
  >
                          <Edit2 size={14} />
                        </button>
                        <button
    onClick={() => setDeleteTarget({ id: f.id, flightNumber: f.flightNumber })}
    className="p-1.5 text-muted hover:text-red-600 hover:bg-primary/10 rounded-lg transition cursor-pointer"
    title="Cancel Flight"
    disabled={!f.active || f.status === "CANCELLED"}
  >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        {
    /* Pagination Bar */
  }
        {filtered.length > pageSize && <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} flights
            </span>
            <div className="flex items-center gap-1">
              <Button
    variant="secondary"
    size="sm"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
  >
                Previous
              </Button>
              <span className="px-2 font-bold text-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
    variant="secondary"
    size="sm"
    disabled={currentPage >= totalPages}
    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
  >
                Next
              </Button>
            </div>
          </div>}
      </div>

      {
    /* Edit / Create Flight Modal */
  }
      <Modal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    title={editingFlight ? `Edit Flight ${editingFlight.flightNumber}` : "Schedule New Flight"}
    description="Edit the backend flight record fields. Status changes are handled through delay and cancellation actions."
    maxWidth="2xl"
  >
        <FlightForm
    initialData={editingFlight || void 0}
    onSubmit={handleCreateOrUpdate}
    onCancel={() => setModalOpen(false)}
    isLoading={isSubmitting}
  />
      </Modal>

      {
    /* Confirm Single Flight Cancellation Modal */
  }
      <ConfirmModal
    isOpen={!!deleteTarget}
    onClose={() => setDeleteTarget(null)}
    onConfirm={handleConfirmDelete}
    title={`Cancel Flight ${deleteTarget?.flightNumber}?`}
    description="Are you sure you want to cancel this flight? It will be marked inactive and will no longer appear as a scheduled flight."
    confirmText="Cancel Flight"
    variant="danger"
    isLoading={isDeleting}
  />

      {
    /* Confirm Bulk Flight Cancellation Modal */
  }
      <ConfirmModal
    isOpen={showBulkDeleteModal}
    onClose={() => setShowBulkDeleteModal(false)}
    onConfirm={handleConfirmBulkDelete}
    title={`Cancel ${selectedIds.size} Selected Flights?`}
    description={`This will mark ${selectedIds.size} selected flights as cancelled and inactive. Are you sure you want to proceed?`}
    confirmText={`Cancel ${selectedIds.size} Flights`}
    variant="danger"
    isLoading={isDeleting}
  />
    </div>;
};
var stdin_default = AdminFlightsPage;
export {
  AdminFlightsPage,
  stdin_default as default
};
