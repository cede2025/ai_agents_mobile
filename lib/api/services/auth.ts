import { api, apiClient } from "../client";
import type { LoginRequest, LoginResponse, User } from "../types";

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post("/api/v1/auth/login", credentials);
    const { access_token, refresh_token } = response.data;
    
    // Store tokens
    await apiClient.setTokens(access_token, refresh_token);
    
    return response.data;
  },

  // Register
  async register(data: { email: string; password: string; name: string }): Promise<User> {
    const response = await api.post("/api/v1/auth/register", data);
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      await apiClient.clearTokens();
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
};
