"use client";

import { useState, useEffect, useCallback } from "react";
import { ITicketResponse, TicketFilters as ITicketFilters } from "@/types";
import ticketService from "@/services/ticketService";
import TicketList from "@/components/tickets/TicketList";
import TicketFilters from "@/components/tickets/TicketFilters";
import Alert from "@/components/ui/alert/Alert";
import Card, { CardBody } from "@/components/ui/card/Card";

export default function AgentDashboard() {
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

  // Estadísticas rápidas
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    highPriority: tickets.filter((t) => t.priority === "high").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Agente</h1>
        <p className="text-gray-600">Gestiona todos los tickets de soporte</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
            <p className="text-sm text-gray-500">Abiertos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">En Progreso</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-gray-500">Resueltos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
            <p className="text-sm text-gray-500">Cerrados</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
            <p className="text-sm text-gray-500">Alta Prioridad</p>
          </CardBody>
        </Card>
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
          basePath="/agent"
          emptyMessage="No hay tickets que coincidan con los filtros"
        />
      )}
    </div>
  );
}