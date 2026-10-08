import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  CheckCircle2,
  ChevronDown,
  Check
} from "lucide-react";
import { adminService, authService } from "../services";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import EmptyState from "../components/ui/EmptyState";
import { useAppSelector } from "../app/store";

const AdminUsersPage = () => {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [roleSelections, setRoleSelections] = useState({});
  const [openRoleMenuFor, setOpenRoleMenuFor] = useState(null);
  const [roleMenuPosition, setRoleMenuPosition] = useState(null);
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

  useEffect(() => {
    if (openRoleMenuFor === null) return undefined;

    const closeMenu = () => {
      setOpenRoleMenuFor(null);
      setRoleMenuPosition(null);
    };
    const closeOnPointerDown = (event) => {
      if (
        !event.target.closest("[data-role-menu]") &&
        !event.target.closest("[data-role-menu-trigger]")
      ) {
        closeMenu();
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [openRoleMenuFor]);

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

  const handleApplyRole = (user, newRole, isAdmin) => {
    if (newRole === "ADMIN" && !isAdmin) {
      handlePromoteToAdmin(user);
      return;
    }

    handleRoleChange(user.id, newRole);
  };

  const handleDeleteUser = async (user) => {
    const isSelf =
      currentUser &&
      (String(currentUser.id) === String(user.id) ||
        currentUser.email?.toLowerCase() === user.email?.toLowerCase());

    if (isSelf) {
      toast.error("You cannot delete your own active administrator account.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete user account ${user.firstName} ${user.lastName} (${user.email})?`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.deleteUser(user.id);
      toast.success(`Deleted user account ${user.email}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete user account";
      toast.error(serverMsg);
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
                  const selectedRole =
                    roleSelections[u.id] ?? (isAdmin ? displayRole : "ADMIN");
                  const roleActionLabel =
                    selectedRole === "ADMIN" && !isAdmin
                      ? "Promote to Admin"
                      : selectedRole === displayRole
                        ? "Role unchanged"
                        : `Set ${selectedRole}`;

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
                          <div className="relative inline-flex h-9 items-stretch overflow-hidden rounded-lg bg-primary text-on-primary shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-surface">
                            <label className="sr-only" htmlFor={`role-${u.id}`}>
                              Select a role for {u.firstName} {u.lastName}
                            </label>
                            <button
                              type="button"
                              onClick={() => handleApplyRole(u, selectedRole, isAdmin)}
                              disabled={isProcessing || selectedRole === displayRole}
                              className="inline-flex min-w-0 items-center justify-center gap-1.5 px-3 text-[11px] font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              title={`Apply role: ${selectedRole}`}
                            >
                              <ShieldAlert size={13} />
                              <span>{roleActionLabel}</span>
                            </button>
                            <div className="relative flex w-8 shrink-0 items-center justify-center">
                              <button
                                type="button"
                                data-role-menu-trigger
                                aria-label={`Choose a role for ${u.firstName} ${u.lastName}`}
                                aria-haspopup="menu"
                                aria-expanded={openRoleMenuFor === u.id}
                                onClick={(event) => {
                                  if (openRoleMenuFor === u.id) {
                                    setOpenRoleMenuFor(null);
                                    setRoleMenuPosition(null);
                                    return;
                                  }

                                  const bounds =
                                    event.currentTarget.getBoundingClientRect();
                                  setRoleMenuPosition({
                                    top: Math.max(
                                      8,
                                      Math.min(
                                        bounds.bottom + 8,
                                        window.innerHeight - 170
                                      )
                                    ),
                                    left: Math.max(
                                      8,
                                      Math.min(
                                        bounds.right - 192,
                                        window.innerWidth - 200
                                      )
                                    ),
                                  });
                                  setOpenRoleMenuFor(u.id);
                                }}
                                disabled={isProcessing}
                                className="flex h-full w-full items-center justify-center border-l border-white/20 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronDown
                                  size={14}
                                  aria-hidden="true"
                                  className={`transition-transform ${openRoleMenuFor === u.id ? "rotate-180" : ""}`}
                                />
                              </button>
                              {openRoleMenuFor === u.id &&
                                roleMenuPosition &&
                                createPortal(
                                  <div
                                    data-role-menu
                                    role="menu"
                                    aria-label="Choose user role"
                                    style={{
                                      position: "fixed",
                                      top: roleMenuPosition.top,
                                      left: roleMenuPosition.left,
                                      width: 192,
                                    }}
                                    className="z-100 max-h-[calc(100vh-1rem)] overflow-y-auto rounded-xl border border-border bg-surface p-1.5 text-left shadow-xl"
                                  >
                                  <p className="px-2.5 pb-1.5 pt-1 text-[9px] font-bold uppercase tracking-widest text-muted">
                                    Assign role
                                  </p>
                                  {[
                                    {
                                      value: "PASSENGER",
                                      description: "Standard customer access",
                                    },
                                    {
                                      value: "STAFF",
                                      description: "Operational staff access",
                                    },
                                    {
                                      value: "ADMIN",
                                      description: "Administrator access",
                                    },
                                  ].map((role) => {
                                    const isSelected = selectedRole === role.value;

                                    return (
                                      <button
                                        key={role.value}
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={isSelected}
                                        onClick={() => {
                                          setRoleSelections((prev) => ({
                                            ...prev,
                                            [u.id]: role.value,
                                          }));
                                          setOpenRoleMenuFor(null);
                                          setRoleMenuPosition(null);
                                        }}
                                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                          isSelected
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-surface-muted"
                                        }`}
                                      >
                                        <span>
                                          <span className="block text-[11px] font-bold">
                                            {role.value}
                                          </span>
                                          <span className="mt-0.5 block text-[9px] text-muted">
                                            {role.description}
                                          </span>
                                        </span>
                                        {isSelected && (
                                          <Check
                                            size={14}
                                            aria-hidden="true"
                                            className="shrink-0"
                                          />
                                        )}
                                      </button>
                                    );
                                  })}
                                  </div>,
                                  document.body
                                )}
                            </div>
                          </div>

                          {(() => {
                            const isSelf =
                              currentUser &&
                              (String(currentUser.id) === String(u.id) ||
                                currentUser.email?.toLowerCase() === u.email?.toLowerCase());

                            return (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                disabled={isProcessing || isSelf}
                                className={`p-1.5 rounded-lg transition ${
                                  isSelf
                                    ? "text-muted/30 cursor-not-allowed"
                                    : "text-muted hover:text-red-600 hover:bg-primary/10 cursor-pointer"
                                }`}
                                title={
                                  isSelf
                                    ? "Cannot delete your own active administrator account"
                                    : "Delete User"
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            );
                          })()}
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
