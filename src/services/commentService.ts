import axios from "axios";
import { ICommentResponse, CreateCommentForm } from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const commentService = {
  // GET
  async getCommentsByTicket(ticketId: string): Promise<ICommentResponse[]> {
    const response = await api.get(`/comments?ticketId=${ticketId}`);
    return response.data.comments;
  },

  // POST
  async createComment(data: CreateCommentForm): Promise<ICommentResponse> {
    const response = await api.post("/comments", data);
    return response.data.comment;
  },
};

export default commentService;