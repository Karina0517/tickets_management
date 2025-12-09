"use client";

import { ITicketResponse } from "@/types";
import Card, { CardBody, CardFooter } from "@/components/ui/card/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

interface TicketCardProps {
  ticket: ITicketResponse;
  basePath: string; 
}

export default function TicketCard({ ticket, basePath }: TicketCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card hover>
      <CardBody>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
            {ticket.title}
          </h3>
          <StatusBadge status={ticket.status} />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <PriorityBadge priority={ticket.priority} />
          {ticket.assignedTo && typeof ticket.assignedTo === "object" && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Asignado: {ticket.assignedTo.name}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>Creado por: {ticket.createdByName}</p>
          <p>Fecha: {formatDate(ticket.createdAt)}</p>
        </div>
      </CardBody>

      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-gray-400">
          ID: #{ticket._id.slice(-6)}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push(`${basePath}/tickets/${ticket._id}`)}
        >
          Ver Detalle
        </Button>
      </CardFooter>
    </Card>
  );
}