import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import flightService from "../services/flightService";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/Toast";
const AdminAirportsPage = () => {
  const toast = useToast();
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const loadAirports = async () => {
    setLoading(true);
    const res = await flightService.getAdminAirports();
    setAirports(res.data);
    setLoading(false);
  };
  useEffect(() => {
    loadAirports();
  }, []);
  const openCreateModal = () => {
    reset({
      code: "KUL",
      name: "Kuala Lumpur International Airport",
      city: "Kuala Lumpur",
      country: "Malaysia",
      timezone: "Asia/Kuala_Lumpur",
      terminals: 2,
      status: "ACTIVE"
    });
    setModalOpen(true);
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await flightService.createAirport({
        code: data.code.toUpperCase(),
        name: data.name,
        city: data.city,
        country: data.country,
        timezone: data.timezone,
        terminals: Number(data.terminals),
        status: data.status
      });
      setModalOpen(false);
      await loadAirports();
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await flightService.deleteAirport(deleteTarget.id);
      toast.info(`Airport ${deleteTarget.code} removed from route network.`);
      setDeleteTarget(null);
      await loadAirports();
    } finally {
      setIsDeleting(false);
    }
  };
  return <div className="admin-data-page p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            Airports & Destination Hubs
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Manage airport IATA codes, international terminals, and timezones.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" className="flex items-center gap-2 font-bold shadow-sm">
          <Plus size={16} /> Add Airport
        </Button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">IATA Code</th>
                <th className="py-3 px-4">Airport Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Timezone</th>
                <th className="py-3 px-4">Terminals</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    Loading airports...
                  </td>
                </tr> : airports.map((apt) => <tr key={apt.id} className="hover:bg-surface-muted/70 transition">
                  <td className="py-3.5 px-4 font-mono font-black text-primary text-sm">
                    {apt.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{apt.name}</td>
                  <td className="py-3.5 px-4 font-medium text-foreground">{apt.city}</td>
                  <td className="py-3.5 px-4 text-muted">{apt.country}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted">{apt.timezone}</td>
                  <td className="py-3.5 px-4 font-mono">{apt.terminals}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={apt.status === "ACTIVE" ? "success" : "neutral"} size="sm">
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
    onClick={() => setDeleteTarget({ id: apt.id, code: apt.code })}
    className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-primary/10 transition cursor-pointer"
    title="Remove Airport"
  >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Confirm Decommission Airport Modal */
  }
      <ConfirmModal
    isOpen={!!deleteTarget}
    onClose={() => setDeleteTarget(null)}
    onConfirm={handleConfirmDelete}
    title={`Remove Airport ${deleteTarget?.code}?`}
    description={`Are you sure you want to remove airport ${deleteTarget?.code} from the route network? Existing flight schedules to this destination may be affected.`}
    confirmText="Remove Airport"
    variant="danger"
    isLoading={isDeleting}
  />

      {
    /* Modal */
  }
      <Modal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    title="Add New Airport / Destination"
    description="Register a new airport for routes and schedules."
    maxWidth="md"
  >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
    label="IATA Code (3 Letters) *"
    placeholder="e.g. KUL"
    maxLength={3}
    {...register("code", { required: "IATA code is required" })}
    error={errors.code?.message}
  />
            <Input
    label="Airport Name *"
    placeholder="e.g. Suvarnabhumi Airport"
    {...register("name", { required: "Name is required" })}
    error={errors.name?.message}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
    label="City *"
    placeholder="e.g. Lagos"
    {...register("city", { required: "City is required" })}
    error={errors.city?.message}
  />
            <Input
    label="Country *"
    placeholder="e.g. Nigeria"
    {...register("country", { required: "Country is required" })}
    error={errors.country?.message}
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
    label="Timezone *"
    placeholder="e.g. Africa/Lagos"
    {...register("timezone", { required: "Timezone is required" })}
  />
            <Input
    label="Terminals Count *"
    type="number"
    {...register("terminals", { required: "Required", valueAsNumber: true })}
  />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
              Save Airport
            </Button>
          </div>
        </form>
      </Modal>
    </div>;
};
var stdin_default = AdminAirportsPage;
export {
  AdminAirportsPage,
  stdin_default as default
};
