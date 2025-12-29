import { useEffect } from "react";
import { wsClient } from "@/lib/websocket/client";

export function useWebSocket() {
  useEffect(() => {
    // Connect on mount
    wsClient.connect();

    // Disconnect on unmount
    return () => {
      wsClient.disconnect();
    };
  }, []);

  return {
    isConnected: wsClient.isConnected(),
    send: wsClient.send.bind(wsClient),
    on: wsClient.on.bind(wsClient),
    off: wsClient.off.bind(wsClient),
  };
}
