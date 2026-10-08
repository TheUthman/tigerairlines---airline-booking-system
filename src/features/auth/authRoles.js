const ADMIN_ROLES = new Set(["ADMIN", "ADMINISTRATOR"]);
const CUSTOMER_ROLES = new Set(["CUSTOMER", "PASSENGER", "USER"]);

export const normalizeAuthRole = (role) => {
  if (typeof role !== "string" || !role.trim()) return "CUSTOMER";

  const normalizedRole = role.trim().toUpperCase();
  if (ADMIN_ROLES.has(normalizedRole)) return "ADMINISTRATOR";
  if (CUSTOMER_ROLES.has(normalizedRole)) return "CUSTOMER";

  return normalizedRole;
};
