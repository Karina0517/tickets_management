"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ITicketResponse, ICommentResponse } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ticketService from "@/services/ticketService";
import commentService from "@/services/commentService";
import Card, { CardHeader, CardBody } from "@/components/ui/card/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import CommentList from "@/components/comments/CommentList";
import CommentForm from "@/components/comments/CommentForm";

export default function ClientTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<ITicketResponse | null>(null);
  const [comments, setComments] = useState<ICommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getTicketById(ticketId),
        commentService.getCommentsByTicket(ticketId),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el ticket");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddComment = async (message: string) => {
    const newComment = await commentService.createComment({
      ticketId,
      message,
    });
    setComments((prev) => [...prev, newComment]);
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

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="error">{error || "Ticket no encontrado"}</Alert>
        <Button className="mt-4" onClick={() => router.push("/client")}>
          Volver a mis tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Botón volver */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/client")}>
          ← Volver a mis tickets
        </Button>
      </div>

      {/* Información del ticket */}
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
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.assignedTo && typeof ticket.assignedTo === "object" && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Agente asignado:</strong> {ticket.assignedTo.name}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sección de comentarios */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Comentarios ({comments.length})
          </h2>
        </CardHeader>

        <CardBody>
          <CommentList comments={comments} currentUserId={user?.id || ""} />

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-md font-semibold mb-4">Agregar Comentario</h3>
            <CommentForm
              ticketId={ticketId}
              onSubmit={handleAddComment}
              disabled={ticket.status === "closed"}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}