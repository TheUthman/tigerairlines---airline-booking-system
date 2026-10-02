import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2 } from "lucide-react";
import adminService from "../services/adminService";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/Toast";
import { TableRowSkeleton } from "../components/ui/Skeleton";
const AdminAircraftPage = () => {
  const toast = useToast();
  const [aircraftList, setAircraftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const loadData = async () => {
    setLoading(true);
    const res = await adminService.getAircraft();
    setAircraftList(res.data);
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);
  const openCreateModal = () => {
    setEditingAircraft(null);
    reset({
      tailNumber: "A5-NEW",
      model: "Airbus A320neo",
      manufacturer: "Airbus",
      totalSeats: 140,
      economySeats: 124,
      businessSeats: 16,
      manufactureYear: 2023,
      status: "OPERATIONAL",
    });
    setModalOpen(true);
  };
  const openEditModal = (ac) => {
    setEditingAircraft(ac);
    reset({
      tailNumber: ac.tailNumber,
      model: ac.model,
      manufacturer: ac.manufacturer,
      totalSeats: ac.totalSeats,
      economySeats: ac.economySeats,
      businessSeats: ac.businessSeats,
      manufactureYear: ac.manufactureYear,
      status: ac.status,
    });
    setModalOpen(true);
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingAircraft) {
        await adminService.updateAircraft(editingAircraft.id, {
          tailNumber: data.tailNumber,
          model: data.model,
          manufacturer: data.manufacturer,
          totalSeats: Number(data.totalSeats),
          economySeats: Number(data.economySeats),
          businessSeats: Number(data.businessSeats),
          manufactureYear: Number(data.manufactureYear),
          status: data.status,
        });
        toast.success(`Aircraft ${data.tailNumber} specifications updated.`);
      } else {
        await adminService.createAircraft({
          tailNumber: data.tailNumber,
          model: data.model,
          manufacturer: data.manufacturer,
          totalSeats: Number(data.totalSeats),
          economySeats: Number(data.economySeats),
          businessSeats: Number(data.businessSeats),
          manufactureYear: Number(data.manufactureYear),
          status: data.status,
        });
        toast.success(
          `Aircraft ${data.tailNumber} registered to active fleet.`,
        );
      }
      setModalOpen(false);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminService.deleteAircraft(deleteTarget.id);
      toast.info(
        `Aircraft ${deleteTarget.tailNumber} decommissioned from fleet.`,
      );
      setDeleteTarget(null);
      await loadData();
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            Fleet & Aircraft Management
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Monitor airworthiness, seat configurations, and fleet availability.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          className="flex items-center gap-2 font-bold shadow-sm"
        >
          <Plus size={16} /> Register Aircraft
        </Button>
      </div>

      {/* Aircraft Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Tail Number</th>
                <th className="py-3 px-4">Model & Type</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Total Seats</th>
                <th className="py-3 px-4">Cabin Split</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }, (_, index) => (
                    <TableRowSkeleton key={index} cols={8} />
                  ))
                : aircraftList.map((ac) => (
                    <tr
                      key={ac.id}
                      className="hover:bg-surface-muted/70 transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        {ac.tailNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {ac.model}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {ac.manufacturer}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {ac.totalSeats} seats
                      </td>
                      <td className="py-3.5 px-4 text-muted text-[11px]">
                        <span className="font-semibold text-foreground">
                          {ac.economySeats}
                        </span>{" "}
                        Economy /{" "}
                        <span className="font-semibold text-secondary">
                          {ac.businessSeats}
                        </span>{" "}
                        Business
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted">
                        {ac.manufactureYear}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            ac.status === "OPERATIONAL"
                              ? "success"
                              : ac.status === "MAINTENANCE"
                                ? "warning"
                                : "primary"
                          }
                          size="sm"
                        >
                          {ac.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ac)}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition cursor-pointer"
                            title="Edit Aircraft"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: ac.id,
                                tailNumber: ac.tailNumber,
                              })
                            }
                            className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-primary/10 transition cursor-pointer"
                            title="Delete Aircraft"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Decommission Aircraft Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Decommission Aircraft ${deleteTarget?.tailNumber}?`}
        description={`Are you sure you want to remove aircraft ${deleteTarget?.tailNumber} from the operational fleet inventory? Active flights assigned to this tail will require rescheduling.`}
        confirmText="Remove Aircraft"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingAircraft
            ? `Edit Aircraft ${editingAircraft.tailNumber}`
            : "Register New Aircraft"
        }
        description="Configure tail registration number and passenger capacity."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <Input
            label="Tail Number *"
            placeholder="e.g. A5-TGR"
            {...register("tailNumber", { required: "Tail number is required" })}
            error={errors.tailNumber?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Aircraft Model *"
              placeholder="e.g. Airbus A320neo"
              {...register("model", { required: "Model is required" })}
              error={errors.model?.message}
            />
            <Input
              label="Manufacturer *"
              placeholder="Airbus / Boeing / ATR"
              {...register("manufacturer", {
                required: "Manufacturer is required",
              })}
              error={errors.manufacturer?.message}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Total Seats *"
              type="number"
              {...register("totalSeats", {
                required: "Required",
                valueAsNumber: true,
              })}
            />
            <Input
              label="Economy Seats *"
              type="number"
              {...register("economySeats", {
                required: "Required",
                valueAsNumber: true,
              })}
            />
            <Input
              label="Business Seats *"
              type="number"
              {...register("businessSeats", {
                required: "Required",
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Year of Manufacture *"
              type="number"
              {...register("manufactureYear", {
                required: "Required",
                valueAsNumber: true,
              })}
            />
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Airworthiness Status
              </label>
              <select
                {...register("status")}
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs font-semibold"
              >
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="GROUNDED">GROUNDED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="font-bold"
            >
              {editingAircraft ? "Save Changes" : "Register to Fleet"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
var stdin_default = AdminAircraftPage;
export { AdminAircraftPage, stdin_default as default };
