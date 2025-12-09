import { ReactNode } from "react";
import { TicketStatus, TicketPriority } from "@/types";
import s from "./badge.module.css";

interface BadgeProps {
  children?: ReactNode;
  status?: TicketStatus;
  priority?: TicketPriority;
  size?: "sm" | "md";
  className?: string;
}

const labels: Record<string, string> = {
  open: "Abierto", in_progress: "En Progreso", resolved: "Resuelto", closed: "Cerrado",
  low: "Baja", medium: "Media", high: "Alta"
};

export default function Badge({
  children,
  status,
  priority,
  size = "sm",
  className = "",
}: BadgeProps) {
  // Determinamos el estilo base (status o priority)
  const styleKey = status || priority;
  
  // Determinamos el texto si no hay children
  const content = children || (styleKey ? labels[styleKey] : "");

  if (!content) return null;

  const classes = [
    s.badge,
    s[size],
    styleKey ? s[styleKey] : s.closed, // Fallback style
    className
  ].filter(Boolean).join(" ");

  return <span className={classes}>{content}</span>;
}

// Helpers
export const StatusBadge = ({ status, size }: { status: TicketStatus; size?: "sm" | "md" }) => (
  <Badge status={status} size={size} />
);

export const PriorityBadge = ({ priority, size }: { priority: TicketPriority; size?: "sm" | "md" }) => (
  <Badge priority={priority} size={size} />
);