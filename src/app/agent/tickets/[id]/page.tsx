"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ITicketResponse, ICommentResponse, IUserResponse, TicketStatus, TicketPriority } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ticketService from "@/services/ticketService";
import commentService from "@/services/commentService";
import agentService from "@/services/agentService";
import Card, { CardHeader, CardBody, CardFooter } from "@/components/ui/card/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/ui/select/Select";
import Alert from "@/components/ui/alert/Alert";
import CommentList from "@/components/comments/CommentList";
import CommentForm from "@/components/comments/CommentForm";

const statusOptions = [
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En Progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

const priorityOptions = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export default function AgentTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<ITicketResponse | null>(null);
  const [comments, setComments] = useState<ICommentResponse[]>([]);
  const [agents, setAgents] = useState<IUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados editables
  const [editStatus, setEditStatus] = useState<TicketStatus>("open");
  const [editPriority, setEditPriority] = useState<TicketPriority>("medium");
  const [editAssignedTo, setEditAssignedTo] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketData, commentsData, agentsData] = await Promise.all([
        ticketService.getTicketById(ticketId),
        commentService.getCommentsByTicket(ticketId),
        agentService.getAgents(),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      setAgents(agentsData);

      // Setear valores editables
      setEditStatus(ticketData.status);
      setEditPriority(ticketData.priority);
      setEditAssignedTo(
        typeof ticketData.assignedTo === "object" && ticketData.assignedTo
          ? ticketData.assignedTo._id
          : ticketData.assignedTo || ""
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el ticket");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateTicket = async () => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const updateData: any = {};
      
      if (editStatus !== ticket?.status) updateData.status = editStatus;
      if (editPriority !== ticket?.priority) updateData.priority = editPriority;
      if (editAssignedTo !== (typeof ticket?.assignedTo === "object" ? ticket.assignedTo?._id : ticket?.assignedTo)) {
        updateData.assignedTo = editAssignedTo || null;
      }

      if (Object.keys(updateData).length === 0) {
        setSuccess("No hay cambios para guardar");
        return;
      }

      const updatedTicket = await ticketService.updateTicket(ticketId, updateData);
      setTicket(updatedTicket);
      setSuccess("Ticket actualizado correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (message: string) => {
    const newComment = await commentService.createComment({
      ticketId,
      message,
    });
    setComments((prev) => [...prev, newComment]);
    // Recargar ticket por si cambió el estado
    const updatedTicket = await ticketService.getTicketById(ticketId);
    setTicket(updatedTicket);
    setEditStatus(updatedTicket.status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando ticket...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="error">{error}</Alert>
        <Button className="mt-4" onClick={() => router.push("/agent")}>
          Volver al dashboard
        </Button>
      </div>
    );
  }

  if (!ticket) return null;

  const agentOptions = [
    { value: "", label: "Sin asignar" },
    ...agents.map((a) => ({ value: a._id, label: a.name })),
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Botón volver */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/agent")}>
          ← Volver al dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del ticket */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{ticket.title}</h1>
                  <p className="text-sm text-gray-500">
                    Ticket #{ticket._id.slice(-6)} • Creado el {formatDate(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={ticket.status} size="md" />
                  <PriorityBadge priority={ticket.priority} size="md" />
                </div>
              </div>
            </CardHeader>

            <CardBody>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Cliente</h3>
                <p className="font-medium">{ticket.createdByName}</p>
                <p className="text-sm text-gray-600">{ticket.createdByEmail}</p>
                <p className="text-sm text-gray-500">CC: {ticket.createdByCC}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </CardBody>
          </Card>

          {/* Comentarios */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Comentarios ({comments.length})
              </h2>
            </CardHeader>

            <CardBody>
              <CommentList comments={comments} currentUserId={user?.id || ""} />

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-md font-semibold mb-4">Responder al Cliente</h3>
                <CommentForm
                  ticketId={ticketId}
                  onSubmit={handleAddComment}
                  disabled={ticket.status === "closed"}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Panel de gestión */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <h2 className="text-lg font-semibold">Gestión del Ticket</h2>
            </CardHeader>

            <CardBody className="space-y-4">
              {error && (
                <Alert variant="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" onClose={() => setSuccess("")}>
                  {success}
                </Alert>
              )}

              <Select
                label="Estado"
                options={statusOptions}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                disabled={updating}
              />

              <Select
                label="Prioridad"
                options={priorityOptions}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TicketPriority)}
                disabled={updating}
              />

              <Select
                label="Agente Asignado"
                options={agentOptions}
                value={editAssignedTo}
                onChange={(e) => setEditAssignedTo(e.target.value)}
                disabled={updating}
              />
            </CardBody>

            <CardFooter>
              <Button
                fullWidth
                onClick={handleUpdateTicket}
                isLoading={updating}
              >
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}