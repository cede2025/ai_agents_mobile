# Backend Integration Guide

## Overview

This mobile app is now fully integrated with the FastAPI backend. All screens fetch real data from API endpoints and receive real-time updates via WebSocket.

## Configuration

### API Base URL

Update the API base URL in `app.config.ts`:

```typescript
const env = {
  apiUrl: "https://your-backend-url.com", // Change this
  wsUrl: "wss://your-backend-url.com",    // Change this
  // ...
};
```

Or set environment variables:
- `EXPO_PUBLIC_API_URL` - HTTP API endpoint
- `EXPO_PUBLIC_WS_URL` - WebSocket endpoint

## Features Integrated

### 1. Dashboard Screen
- **GET /api/v1/agents** - Fetches all agents
- **GET /api/v1/metrics** - Fetches system metrics
- **WebSocket** - Real-time agent status updates
- **Pull-to-refresh** - Refreshes data on demand

### 2. Workflow Editor
- **GET /api/v1/workflows** - Lists all workflows
- **POST /api/v1/workflows** - Creates new workflow
- **PUT /api/v1/workflows/{id}** - Updates workflow
- **POST /api/v1/workflows/{id}/execute** - Executes workflow
- **WebSocket** - Real-time workflow execution events

### 3. Chat Interface
- **POST /api/v1/chat/messages** - Sends messages
- **GET /api/v1/chat/history** - Loads chat history
- **POST /api/v1/chat/modes/{mode}** - Sets chat mode
- **WebSocket /ws/chat** - Real-time messaging
- **Three modes:**
  - ⚡ **Quick Mode** - Groq/Gemini, 5s timeout, 500 tokens
  - 🎯 **Optimized Mode** - DeepSeek/OpenRouter, 15s timeout, 2000 tokens
  - 🔄 **Long-term Mode** - 7-day context, 5min timeout, 8000 tokens

### 4. Authentication
- **POST /api/v1/auth/login** - User login
- **POST /api/v1/auth/refresh** - Token refresh
- **POST /api/v1/auth/logout** - User logout
- JWT tokens stored in SecureStore
- Automatic token refresh on 401

## WebSocket Events

The app listens to these WebSocket events:

### Agent Events
- `agent:status` - Agent status changes
- `agent:output` - Agent execution output
- `agent:error` - Agent errors

### Workflow Events
- `workflow:started` - Workflow execution started
- `workflow:completed` - Workflow completed
- `workflow:node:executed` - Node execution update

### Chat Events
- `chat:message` - New AI message
- `chat:typing` - Typing indicator
- `chat:mode:changed` - Mode changed

### System Events
- `system:health` - System health updates
- `system:metrics` - Metrics updates

## API Client Structure

```
lib/api/
├── client.ts              # Axios client with auth
├── types.ts               # TypeScript types
├── services/
│   ├── agents.ts          # Agent operations
│   ├── workflows.ts       # Workflow operations
│   ├── chat.ts            # Chat operations
│   ├── metrics.ts         # System metrics
│   └── auth.ts            # Authentication
└── index.ts               # Exports

lib/websocket/
└── client.ts              # WebSocket client

hooks/
└── use-websocket.ts       # React hook for WS
```

## Usage Examples

### Fetching Agents

```typescript
import { agentsService } from "@/lib/api";

const agents = await agentsService.getAgents();
```

### Sending Chat Message

```typescript
import { chatService } from "@/lib/api";

const response = await chatService.sendMessage("Hello AI", "quick");
```

### Listening to WebSocket Events

```typescript
import { wsEvents } from "@/lib/websocket/client";

wsEvents.onAgentStatus((event) => {
  console.log(`Agent ${event.agentId} is now ${event.status}`);
});
```

## Testing Without Backend

If you don't have the backend running yet, the app will show loading states and empty data. To test:

1. Start your FastAPI backend
2. Update `apiUrl` and `wsUrl` in config
3. Restart the Expo app
4. Login with valid credentials

## Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000
```

## Troubleshooting

### "Network Error" or "Failed to fetch"
- Check if backend is running
- Verify API URL is correct
- Check CORS settings on backend

### WebSocket not connecting
- Verify WS URL is correct
- Check if token is valid
- Look for errors in console

### 401 Unauthorized
- Login again to refresh tokens
- Check if backend auth is configured

## Next Steps

1. **Authentication** - Add login screen (currently using mock auth)
2. **Error Handling** - Add user-friendly error messages
3. **Offline Mode** - Cache data for offline access
4. **Push Notifications** - Integrate Expo notifications
5. **Testing** - Add unit and integration tests
