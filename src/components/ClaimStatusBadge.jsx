import { FiClock, FiCheck, FiCheckCircle, FiX } from "react-icons/fi";

const statusConfig = {
  pending: {
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: FiClock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FiCheck,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: FiCheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FiX,
  },
};

export function ClaimStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}
