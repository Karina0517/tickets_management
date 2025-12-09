"use client";

import { ITicketResponse } from "@/types";
import TicketCard from "./TicketCard";

interface TicketListProps {
  tickets: ITicketResponse[];
  basePath: string;
  emptyMessage?: string;
}

export default function TicketList({
  tickets,
  basePath,
  emptyMessage = "No hay tickets para mostrar",
}: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket._id} ticket={ticket} basePath={basePath} />
      ))}
    </div>
  );
}