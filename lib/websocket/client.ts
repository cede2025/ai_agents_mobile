import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type {
  WebSocketEvent,
  AgentStatusEvent,
  WorkflowEvent,
  ChatTypingEvent,
  Message,
} from "../api/types";

const WS_BASE_URL = Constants.expoConfig?.extra?.wsUrl || "ws://localhost:8000";

type EventHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private isConnecting = false;

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) {
        console.warn("No access token found, skipping WebSocket connection");
        this.isConnecting = false;
        return;
      }

      // Connect to WebSocket with auth token
      const wsUrl = `${WS_BASE_URL}/ws?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnecting = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.isConnecting = false;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(message: WebSocketEvent) {
    const { type, data } = message;
    const handlers = this.eventHandlers.get(type);

    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  }

  on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  send(event: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data }));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();

// Typed event helpers
export const wsEvents = {
  // Agent events
  onAgentStatus(handler: (event: AgentStatusEvent) => void) {
    wsClient.on("agent:status", handler);
  },
  offAgentStatus(handler: (event: AgentStatusEvent) => void) {
    wsClient.off("agent:status", handler);
  },

  // Workflow events
  onWorkflowStarted(handler: (event: WorkflowEvent) => void) {
    wsClient.on("workflow:started", handler);
  },
  offWorkflowStarted(handler: (event: WorkflowEvent) => void) {
    wsClient.off("workflow:started", handler);
  },
  onWorkflowCompleted(handler: (event: WorkflowEvent) => void) {
    wsClient.on("workflow:completed", handler);
  },
  offWorkflowCompleted(handler: (event: WorkflowEvent) => void) {
    wsClient.off("workflow:completed", handler);
  },

  // Chat events
  onChatMessage(handler: (message: Message) => void) {
    wsClient.on("chat:message", handler);
  },
  offChatMessage(handler: (message: Message) => void) {
    wsClient.off("chat:message", handler);
  },
  onChatTyping(handler: (event: ChatTypingEvent) => void) {
    wsClient.on("chat:typing", handler);
  },
  offChatTyping(handler: (event: ChatTypingEvent) => void) {
    wsClient.off("chat:typing", handler);
  },

  // System events
  onSystemHealth(handler: (data: any) => void) {
    wsClient.on("system:health", handler);
  },
  offSystemHealth(handler: (data: any) => void) {
    wsClient.off("system:health", handler);
  },
  onSystemMetrics(handler: (data: any) => void) {
    wsClient.on("system:metrics", handler);
  },
  offSystemMetrics(handler: (data: any) => void) {
    wsClient.off("system:metrics", handler);
  },
};
