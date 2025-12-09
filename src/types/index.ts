import { Types } from "mongoose";

// Estados y prioridades
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type UserRole = "client" | "agent";

// Usuario
export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  cc: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Ticket
export interface ITicketResponse {
  _id: string;
  title: string;
  description: string;
  createdBy: string | IUserResponse;
  createdByCC: string;
  createdByName: string;
  createdByEmail: string;
  assignedTo: string | IUserResponse | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

// Comentario
export interface ICommentResponse {
  _id: string;
  ticketId: string;
  author: string | IUserResponse;
  authorName?: string;
  authorRole?: UserRole;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// Formularios
export interface CreateTicketForm {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketForm {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string | null;
}

export interface CreateCommentForm {
  ticketId: string;
  message: string;
}

// Respuestas API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string[]>;
}

// Filtros
export interface TicketFilters {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  search?: string;
}