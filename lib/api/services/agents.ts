import { api } from "../client";
import type { Agent } from "../types";

export const agentsService = {
  // List all agents
  async getAgents(): Promise<Agent[]> {
    const response = await api.get("/api/v1/agents");
    return response.data;
  },

  // Get single agent details
  async getAgent(id: string): Promise<Agent> {
    const response = await api.get(`/api/v1/agents/${id}`);
    return response.data;
  },

  // Create new agent
  async createAgent(agent: Partial<Agent>): Promise<Agent> {
    const response = await api.post("/api/v1/agents", agent);
    return response.data;
  },

  // Update agent
  async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
    const response = await api.put(`/api/v1/agents/${id}`, agent);
    return response.data;
  },

  // Delete agent
  async deleteAgent(id: string): Promise<void> {
    await api.delete(`/api/v1/agents/${id}`);
  },

  // Execute agent
  async executeAgent(id: string, input: any): Promise<any> {
    const response = await api.post(`/api/v1/agents/${id}/execute`, { input });
    return response.data;
  },
};
