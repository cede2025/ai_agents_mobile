import { api } from "../client";
import type { Workflow } from "../types";

export const workflowsService = {
  // List all workflows
  async getWorkflows(): Promise<Workflow[]> {
    const response = await api.get("/api/v1/workflows");
    return response.data;
  },

  // Get single workflow
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await api.get(`/api/v1/workflows/${id}`);
    return response.data;
  },

  // Create new workflow
  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await api.post("/api/v1/workflows", workflow);
    return response.data;
  },

  // Update workflow
  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await api.put(`/api/v1/workflows/${id}`, workflow);
    return response.data;
  },

  // Delete workflow
  async deleteWorkflow(id: string): Promise<void> {
    await api.delete(`/api/v1/workflows/${id}`);
  },

  // Execute workflow
  async executeWorkflow(id: string, input?: any): Promise<any> {
    const response = await api.post(`/api/v1/workflows/${id}/execute`, { input });
    return response.data;
  },

  // Validate workflow
  async validateWorkflow(id: string): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await api.post(`/api/v1/workflows/${id}/validate`);
    return response.data;
  },
};
