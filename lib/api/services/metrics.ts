import { api } from "../client";
import type { SystemMetrics } from "../types";

export const metricsService = {
  // Get system metrics
  async getMetrics(): Promise<SystemMetrics> {
    const response = await api.get("/api/v1/metrics");
    return response.data;
  },

  // Get system logs
  async getLogs(limit: number = 100, level?: string): Promise<any[]> {
    const response = await api.get("/api/v1/logs", {
      params: { limit, level },
    });
    return response.data;
  },

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get("/api/v1/health");
    return response.data;
  },
};
