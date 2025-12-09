import axios from "axios";
import { 
  ITicketResponse, 
  CreateTicketForm, 
  UpdateTicketForm, 
  TicketFilters,
  ApiResponse 
} from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || "Error de conexión";
    return Promise.reject(new Error(message));
  }
);

export const ticketService = {
  // Obtener todos los tickets (con filtros opcionales)
  async getTickets(filters?: TicketFilters): Promise<ITicketResponse[]> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.priority && filters.priority !== "all") {
      params.append("priority", filters.priority);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await api.get(`/tickets?${params.toString()}`);
    return response.data.tickets;
  },

  // Obtener ticket por ID
  async getTicketById(id: string): Promise<ITicketResponse> {
    const response = await api.get(`/tickets/${id}`);
    return response.data.ticket;
  },

  // Crear ticket
  async createTicket(data: CreateTicketForm): Promise<ITicketResponse> {
    const response = await api.post("/tickets", data);
    return response.data.ticket;
  },

  // Actualizar ticket
  async updateTicket(id: string, data: UpdateTicketForm): Promise<ITicketResponse> {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data.ticket;
  },

  // Eliminar ticket
  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },
};

export default ticketService;