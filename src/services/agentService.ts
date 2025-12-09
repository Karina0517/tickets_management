import axios from "axios";
import { IUserResponse } from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const agentService = {
  // Obtener lista de agentes
  async getAgents(): Promise<IUserResponse[]> {
    const response = await api.get("/agents");
    return response.data.agents;
  },
};

export default agentService;