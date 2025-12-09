import { ReactNode } from "react";
import { TicketStatus, TicketPriority } from "@/types";

type BadgeVariant = "status" | "priority" | "default";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  status?: TicketStatus;
  priority?: TicketPriority;
  size?: BadgeSize;
  className?: string;
}

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<TicketStatus, string> = {
  open: "Abierto",
  in_progress: "En Progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const priorityLabels: Record<TicketPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export default function Badge({
  children,
  variant = "default",
  status,
  priority,
  size = "sm",
  className = "",
}: BadgeProps) {
  let colorStyle = "bg-gray-100 text-gray-700 border-gray-200";
  let label = children;

  if (variant === "status" && status) {
    colorStyle = statusStyles[status];
    label = statusLabels[status];
  } else if (variant === "priority" && priority) {
    colorStyle = priorityStyles[priority];
    label = `Prioridad: ${priorityLabels[priority]}`;
  }

  return (
    <span
      className={`
        ${colorStyle}
        ${sizeStyles[size]}
        border rounded-full font-medium
        inline-flex items-center
        ${className}
      `}
    >
      {label}
    </span>
  );
}

// Exportar también componentes específicos para facilitar uso
export function StatusBadge({ status, size = "sm" }: { status: TicketStatus; size?: BadgeSize }) {
  return <Badge variant="status" status={status} size={size} />;
}

export function PriorityBadge({ priority, size = "sm" }: { priority: TicketPriority; size?: BadgeSize }) {
  return <Badge variant="priority" priority={priority} size={size} />;
}