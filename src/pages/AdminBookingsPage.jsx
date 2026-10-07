import { useEffect, useState } from "react";
import { Search, Eye, XCircle, Download } from "lucide-react";
import bookingService from "../services/bookingService";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import BoardingPass from "../features/ticket/BoardingPass";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/Toast";
import { exportToCsv } from "../utils/exportCsv";
import EmptyState from "../components/ui/EmptyState";
import { formatNaira } from "../utils/formatNaira";
const AdminBookingsPage = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewingBooking, setViewingBooking] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
  const loadData = async () => {
    setLoading(true);
    const res = await bookingService.getBookings();
    setBookings(res.data);
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleConfirmCancelSingle = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(cancelTarget.id);
      toast.warning(`Booking ${cancelTarget.pnr} was cancelled.`);
      setCancelTarget(null);
      await loadData();
    } finally {
      setIsCancelling(false);
    }
  };
  const handleConfirmBulkCancel = async () => {
    setIsCancelling(true);
    try {
      for (const id of selectedIds) {
        await bookingService.cancelBooking(id);
      }
      toast.warning(`Cancellation requests submitted for ${selectedIds.size} reservations.`);
      setSelectedIds(/* @__PURE__ */ new Set());
      setShowBulkCancelModal(false);
      await loadData();
    } finally {
      setIsCancelling(false);
    }
  };
  const handleExportCsv = () => {
    const exportData = filtered.map((b) => ({
      pnr: b.pnr,
      flightNumber: b.flightNumber,
      passengerName: b.passengerName,
      origin: b.origin,
      destination: b.destination,
      departureDate: b.departureDate,
      seatNumber: b.seatNumber || "N/A",
      totalAmount: b.totalAmount,
      paymentStatus: b.paymentStatus,
      status: b.status
    }));
    exportToCsv("TigerAirlines_Bookings", exportData, [
      { key: "pnr", label: "Booking PNR" },
      { key: "flightNumber", label: "Flight Number" },
      { key: "passengerName", label: "Passenger" },
      { key: "origin", label: "Origin" },
      { key: "destination", label: "Destination" },
      { key: "departureDate", label: "Date" },
      { key: "seatNumber", label: "Seat" },
      { key: "totalAmount", label: "Amount (NGN)" },
      { key: "paymentStatus", label: "Payment" },
      { key: "status", label: "Status" }
    ]);
    toast.success("Bookings manifest exported to CSV");
  };
  const filtered = bookings.filter((b) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = [b.pnr, b.passengerName, b.flightNumber]
      .some((value) => String(value || "").toLowerCase().includes(searchTerm));
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)));
    }
  };
  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedIds(updated);
  };
  return <div className="admin-data-page p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            Reservations & Ticketing
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Review reservation records and their current payment status.
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
    type="text"
    aria-label="Search bookings by PNR, passenger, or flight"
    placeholder="Search by PNR, passenger, or flight..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
  />
            <Search size={14} className="absolute left-3 top-2.5 text-muted" />
          </div>
        </div>
      </div>

      {
    /* Filter and Bulk Action Bar */
  }
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted">Filter Status:</span>
          <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    aria-label="Filter bookings by status"
    className="bg-background border border-border rounded-lg px-2.5 py-1 font-medium text-foreground focus:outline-none"
  >
            <option value="ALL">All Reservations</option>
            <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PENDING_PAYMENT">PAYMENT PENDING</option>
                    <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {selectedIds.size > 0 && <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{selectedIds.size} selected:</span>
            <span className="hidden rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted sm:inline">
              Status follows payment events
            </span>
            <Button
    variant="danger"
    size="sm"
    onClick={() => setShowBulkCancelModal(true)}
    className="font-bold text-xs"
  >
              Cancel Selected
            </Button>
          </div>}
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto" role="region" aria-label="Bookings table" tabIndex={0}>
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
    type="checkbox"
    checked={selectedIds.size > 0 && selectedIds.size === filtered.length}
    onChange={toggleSelectAll}
    aria-label="Select all visible bookings"
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                </th>
                <th className="py-3 px-4">PNR</th>
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Seat</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? <tr>
                  <td colSpan={10} className="py-12 text-center text-muted">
                    Loading reservations...
                  </td>
                </tr> : filtered.length === 0 ? <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <EmptyState
    title="No Bookings Found"
    description="No reservations matched your PNR query or status filter."
    actionLabel="Reset Search"
    onAction={() => {
      setSearch("");
      setStatusFilter("ALL");
    }}
  />
                  </td>
                </tr> : filtered.map((b) => <tr key={b.id} className="hover:bg-surface-muted/70 transition">
                    <td className="py-3.5 px-4">
                      <input
    type="checkbox"
    checked={selectedIds.has(b.id)}
    onChange={(e) => toggleSelectRow(b.id, e)}
    aria-label={`Select booking ${b.pnr}`}
    className="w-4 h-4 rounded text-primary focus:ring-primary"
  />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-primary text-sm">
                      {b.pnr}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {b.flightNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">{b.passengerName}</td>
                    <td className="py-3.5 px-4 text-muted">
                      {b.origin} → {b.destination}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {b.seatNumber || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-foreground">
                      {formatNaira(b.totalAmount ?? b.amount ?? 0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
    className={`text-[11px] font-bold ${b.paymentStatus === "PAID" ? "text-emerald-600" : b.paymentStatus === "REFUNDED" ? "text-amber-600" : "text-red-600"}`}
  >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
    variant={b.status === "CONFIRMED" ? "success" : b.status === "CANCELLED" ? "primary" : "warning"}
  >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
    type="button"
    onClick={() => setViewingBooking(b)}
    className="p-1.5 text-muted hover:text-foreground hover:bg-surface-muted rounded-lg transition cursor-pointer"
    aria-label={`View booking ${b.pnr}`}
    title="View booking details"
  >
                          <Eye size={14} />
                        </button>
                        {b.status !== "CANCELLED" && <button
    type="button"
    onClick={() => setCancelTarget(b)}
    className="p-1.5 text-muted hover:text-red-600 hover:bg-primary/10 rounded-lg transition cursor-pointer"
    aria-label={`Cancel booking ${b.pnr}`}
    title="Cancel booking"
  >
                            <XCircle size={14} />
                          </button>}
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Boarding Pass Preview Modal */
  }
      <Modal
    isOpen={!!viewingBooking}
    onClose={() => setViewingBooking(null)}
    title={`E-Ticket Document (${viewingBooking?.pnr})`}
    description="Review the reservation details and current ticket status."
    maxWidth="xl"
  >
        {viewingBooking && <BoardingPass booking={viewingBooking} />}
      </Modal>

      {
    /* Confirm Single Cancellation Modal */
  }
      <ConfirmModal
    isOpen={!!cancelTarget}
    onClose={() => setCancelTarget(null)}
    onConfirm={handleConfirmCancelSingle}
    title={`Cancel Reservation ${cancelTarget?.pnr}?`}
    description={`Submit a cancellation request for ${cancelTarget?.passengerName || "this passenger"}. The booking service will return the current reservation status.`}
    confirmText="Confirm Cancellation"
    variant="danger"
    isLoading={isCancelling}
  />

      {
    /* Confirm Bulk Cancellation Modal */
  }
      <ConfirmModal
    isOpen={showBulkCancelModal}
    onClose={() => setShowBulkCancelModal(false)}
    onConfirm={handleConfirmBulkCancel}
    title={`Cancel ${selectedIds.size} Selected Reservations?`}
    description={`Submit cancellation requests for ${selectedIds.size} selected reservations. Confirm that these are the intended records before proceeding.`}
    confirmText={`Cancel & Refund ${selectedIds.size} Bookings`}
    variant="danger"
    isLoading={isCancelling}
  />
    </div>;
};
var stdin_default = AdminBookingsPage;
export {
  AdminBookingsPage,
  stdin_default as default
};
