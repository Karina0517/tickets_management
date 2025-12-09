"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ITicketResponse, TicketFilters as ITicketFilters } from "@/types";
import ticketService from "@/services/ticketService";
import TicketList from "@/components/tickets/TicketList";
import TicketFilters from "@/components/tickets/TicketFilters";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";

export default function ClientDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ITicketFilters>({
    status: "all",
    priority: "all",
    search: "",
  });

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTickets(filters);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleClearFilters = () => {
    setFilters({ status: "all", priority: "all", search: "" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Tickets</h1>
          <p className="text-gray-600">Gestiona tus tickets de soporte</p>
        </div>
        <Button onClick={() => router.push("/client/tickets/new")}>
          + Nuevo Ticket
        </Button>
      </div>

      {/* Filtros */}
      <TicketFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Error */}
      {error && (
        <Alert variant="error" onClose={() => setError("")} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Lista de tickets */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tickets...</p>
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          basePath="/client"
          emptyMessage="No tienes tickets aún. ¡Crea tu primer ticket!"
        />
      )}
    </div>
  );
}