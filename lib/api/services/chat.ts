import { api } from "../client";
import type { Message, ChatMode } from "../types";

export const chatService = {
  // Send message
  async sendMessage(text: string, mode: ChatMode): Promise<Message> {
    const response = await api.post("/api/v1/chat/messages", {
      text,
      mode,
    });
    return response.data;
  },

  // Get chat history
  async getChatHistory(limit: number = 50, offset: number = 0): Promise<Message[]> {
    const response = await api.get("/api/v1/chat/history", {
      params: { limit, offset },
    });
    return response.data;
  },

  // Set chat mode
  async setChatMode(mode: ChatMode): Promise<void> {
    await api.post(`/api/v1/chat/modes/${mode}`);
  },
};
