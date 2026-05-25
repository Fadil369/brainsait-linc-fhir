export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function statusColor(status) {
  const map = {
    ready: "#22c55e",
    "in-progress": "#0ea5e9",
    planned: "#64748b",
    active: "#22c55e",
    inactive: "#ef4444",
    degraded: "#f59e0b",
    operational: "#22c55e",
  };
  return map[status] || "#64748b";
}

export function statusLabel(status) {
  const map = {
    ready: "Ready",
    "in-progress": "In Progress",
    planned: "Planned",
    active: "Active",
    inactive: "Inactive",
    degraded: "Degraded",
    operational: "Operational",
  };
  return map[status] || status;
}

export function badgeProps(status) {
  const color = statusColor(status);
  return {
    background: `${color}22`,
    border: `1px solid ${color}44`,
    color,
  };
}
