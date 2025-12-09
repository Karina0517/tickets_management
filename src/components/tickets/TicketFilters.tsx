"use client";

import { TicketFilters as ITicketFilters, TicketStatus, TicketPriority } from "@/types";
import Select from "@/components/ui/select/Select";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";

interface TicketFiltersProps {
  filters: ITicketFilters;
  onChange: (filters: ITicketFilters) => void;
  onClear: () => void;
}

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En Progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

const priorityOptions = [
  { value: "all", label: "Todas las prioridades" },
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export default function TicketFilters({
  filters,
  onChange,
  onClear,
}: TicketFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar por título, descripción..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />

        <Select
          options={statusOptions}
          value={filters.status || "all"}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as TicketStatus | "all" })
          }
        />

        <Select
          options={priorityOptions}
          value={filters.priority || "all"}
          onChange={(e) =>
            onChange({ ...filters, priority: e.target.value as TicketPriority | "all" })
          }
        />

        <Button variant="outline" onClick={onClear}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}