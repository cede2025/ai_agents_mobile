# AI Agents Mobile App - TODO

## Phase 1: Theme & Navigation
- [x] Update theme.config.js with purple/blue color palette
- [x] Add workflow, chat, and settings tabs to navigation
- [x] Create custom tab bar icons

## Phase 2: Dashboard Screen
- [x] Create status cards grid component (Total Agents, Active Tasks, System Health, API Usage)
- [x] Create agent card component with icon, name, type, status badge
- [x] Implement agent list with pull-to-refresh
- [x] Add floating action button for creating new agent
- [ ] Create agent details modal
- [ ] Add quick actions menu (long-press)

## Phase 3: Workflow Editor Screen
- [x] Create workflow list view
- [x] Implement visual canvas with pan/zoom gestures
- [x] Create draggable agent node components
- [x] Implement node connection system
- [ ] Add node properties slide-up sheet
- [x] Create workflow save/load functionality
- [x] Add node palette at bottom

## Phase 4: Chat Screen
- [x] Create messenger-like message list
- [x] Implement message bubbles (user vs AI styling)
- [x] Add chat input with send button
- [ ] Create typing indicator
- [x] Implement chat mode selector (Quick/Optimized/Long-term)
- [ ] Add message actions (swipe to delete, long-press to copy)
- [x] Create mode configuration modal

## Phase 5: Settings Screen
- [x] Create settings list layout
- [x] Add account section
- [x] Add notification preferences
- [x] Add theme toggle (dark/light)
- [x] Add API configuration section
- [x] Add about section

## Phase 6: Branding
- [x] Generate custom app logo
- [x] Update app.config.ts with app name and logo URL
- [x] Copy logo to all required locations

## Phase 7: Polish & Testing
- [x] Add haptic feedback to interactions
- [x] Test all user flows
- [x] Verify responsiveness on different screen sizes
- [x] Create checkpoint

## Backend Integration

### API Client Setup
- [x] Create axios API client with base URL configuration
- [x] Add authentication interceptors (JWT tokens)
- [x] Create API service layer for agents, workflows, chat, metrics

### WebSocket Integration
- [x] Setup WebSocket client for real-time updates
- [x] Handle agent status events
- [x] Handle workflow execution events
- [x] Handle chat typing indicators and messages
- [x] Handle system health and metrics updates

### Dashboard Integration
- [x] Fetch real agents from GET /api/v1/agents
- [x] Display real-time agent status via WebSocket
- [x] Fetch system metrics from GET /api/v1/metrics
- [x] Implement pull-to-refresh with live data
- [ ] Add agent details modal with real data

### Workflow Integration
- [x] Fetch workflows from GET /api/v1/workflows
- [x] Save/update workflows via POST/PUT /api/v1/workflows
- [x] Execute workflows via POST /api/v1/workflows/{id}/execute
- [x] Display real-time workflow execution progress
- [ ] Validate workflows before execution

### Chat Integration
- [x] Connect to WebSocket /ws/chat for real-time messaging
- [x] Send messages via POST /api/v1/chat/messages
- [x] Implement Quick Mode (⚡) with Groq/Gemini providers
- [x] Implement Optimized Mode (🎯) with DeepSeek/OpenRouter
- [x] Implement Long-term Mode (🔄) with 7-day persistence
- [x] Display typing indicators from WebSocket
- [x] Load chat history from GET /api/v1/chat/history

### Authentication
- [ ] Add login screen (UI not implemented, but auth service ready)
- [x] Implement JWT token storage (SecureStore)
- [x] Add token refresh logic
- [x] Handle logout and session expiry

## Major Redesign - User Feedback

### Theme Overhaul
- [x] Change to deep OLED black theme (#000000 background)
- [x] Update all colors for OLED display
- [x] Make UI more modern and less "generated"

### Dashboard Redesign
- [x] Move chat to main dashboard screen
- [x] Add agent/provider selector for chat
- [x] Change task modes from Quick/Optimized/Long-term to Regular/Continuous
- [x] Integrate chat with agent selection

### Workflow Canvas Fix
- [x] Force landscape orientation for workflow screen
- [x] Make canvas fully functional with proper gestures
- [x] Improve visual design of workflow editor

### New Features
- [x] Create System Logs screen with live log streaming
- [x] Create SSH Terminal screen for CLI access
- [x] Add CLI compatibility layer
- [x] Ensure mobile app works with CLI version of system
