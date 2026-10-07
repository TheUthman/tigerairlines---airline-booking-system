import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  RefreshCw,
  Mail,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { adminService, authService } from "../services";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import EmptyState from "../components/ui/EmptyState";

const AdminUsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error("Failed to load user accounts from admin-service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePromoteToAdmin = async (user) => {
    setIsProcessing(true);
    try {
      await adminService.promoteUser(user.id, "ADMIN");
      toast.success(
        `User ${user.firstName} ${user.lastName} successfully promoted to ADMIN`,
        "Role Elevated"
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: "ADMIN" } : u))
      );
    } catch (err) {
      toast.error("Failed to promote user to ADMIN");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setIsProcessing(true);
    try {
      await adminService.updateUserRole(userId, newRole);
      const displayRole = newRole === "ADMINISTRATOR" ? "ADMIN" : newRole;
      toast.success(`Role updated to ${displayRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: displayRole } : u))
      );
    } catch (err) {
      toast.error("Failed to update user role");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user account ${user.firstName} ${user.lastName} (${user.email})?`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      // Calls DELETE /api/admin/users/{id}
      await adminService.deleteUser(user.id);
      toast.info(`Deleted user account ${user.email}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      toast.error("Failed to delete user account");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const isUserAdmin = u.role === "ADMIN" || u.role === "ADMINISTRATOR";
    const isUserStaff = u.role === "STAFF";
    const isUserPassenger =
      u.role === "PASSENGER" || u.role === "USER" || u.role === "CUSTOMER";

    const matchesRole =
      roleFilter === "ALL" ||
      (roleFilter === "ADMIN" && isUserAdmin) ||
      (roleFilter === "STAFF" && isUserStaff) ||
      (roleFilter === "PASSENGER" && isUserPassenger) ||
      u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-data-page mx-auto max-w-7xl p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="text-primary" size={24} />
            <span>User Access & Role Governance</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Manage registered accounts, grant administrator privileges, and control access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            isLoading={loading}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface rounded-2xl p-4 border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <Input
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
            className="text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Roles" },
            { id: "PASSENGER", label: "Passenger" },
            { id: "STAFF", label: "Staff" },
            { id: "ADMIN", label: "Admin" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRoleFilter(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                roleFilter === id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-muted text-muted hover:bg-surface-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted font-semibold">
              Loading users from microservice...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="No user profiles match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredUsers.map((u) => {
                  const isAdmin =
                    u.role === "ADMINISTRATOR" || u.role === "ADMIN";
                  const isStaff = u.role === "STAFF";
                  const displayRole = isAdmin
                    ? "ADMIN"
                    : u.role === "USER" || u.role === "CUSTOMER"
                      ? "PASSENGER"
                      : u.role;

                  return (
                    <tr key={u.id} className="hover:bg-surface-muted/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-muted border border-border text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                            {u.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-snug">
                              {u.firstName} {u.lastName}
                            </p>
                            <span className="text-[10px] text-muted font-mono">
                              ID: #{u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-muted" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isAdmin
                              ? "bg-primary/10 text-primary border-primary/25"
                              : isStaff
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-surface-muted text-foreground border-border"
                          }`}
                        >
                          <Shield size={10} />
                          {displayRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => handlePromoteToAdmin(u)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer"
                              title="Promote to Administrator"
                            >
                              <ShieldAlert size={12} />
                              <span>Promote to Admin</span>
                            </button>
                          )}

                          <select
                            value={displayRole}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isProcessing}
                            className="bg-surface-muted hover:bg-surface-muted border border-border rounded-lg px-2 py-1 text-[11px] font-semibold text-foreground cursor-pointer focus:outline-none"
                          >
                            <option value="PASSENGER">PASSENGER</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isProcessing}
                            className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-primary/10 transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
