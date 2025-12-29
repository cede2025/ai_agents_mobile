# AI Agents Mobile App - Design Document

## Overview
A modern, minimalist mobile application for managing AI agents with real-time monitoring, visual workflow creation, and messenger-like chat interface. The app follows iOS Human Interface Guidelines for a native feel.

## Design Philosophy
- **Mobile-first**: Optimized for portrait orientation (9:16) and one-handed usage
- **Minimalist**: Clean, uncluttered interface with focus on essential information
- **Dark theme primary**: Professional look with purple/blue accent colors
- **Gesture-friendly**: Swipe, tap, and long-press interactions
- **Real-time updates**: Live status indicators and notifications

## Color Palette

### Primary Colors
- **Primary**: `#8B5CF6` (Purple 500) - Main accent, buttons, active states
- **Secondary**: `#3B82F6` (Blue 500) - Links, secondary actions
- **Success**: `#10B981` (Green 500) - Active agents, success states
- **Warning**: `#F59E0B` (Amber 500) - Warning states
- **Error**: `#EF4444` (Red 500) - Error states, offline agents

### Background & Surface
- **Background**: `#0F172A` (Slate 900) - Main background
- **Surface**: `#1E293B` (Slate 800) - Cards, elevated surfaces
- **Surface Elevated**: `#334155` (Slate 700) - Modals, overlays

### Text
- **Foreground**: `#F1F5F9` (Slate 100) - Primary text
- **Muted**: `#94A3B8` (Slate 400) - Secondary text, labels
- **Border**: `#334155` (Slate 700) - Dividers, borders

## Screen Structure

### 1. Dashboard (Home Tab)
**Purpose**: Overview of all AI agents and system status

**Layout**:
- **Header**: App title "AI Agents" + notification bell icon
- **Status Cards Grid** (2 columns):
  - Total Agents (with count)
  - Active Tasks (with count)
  - System Health (percentage)
  - API Usage (percentage)
- **Agent List**:
  - Scrollable list of agent cards
  - Each card shows: agent name, type icon, status badge, last activity
  - Tap to view details
  - Long-press for quick actions menu
- **Floating Action Button**: "+" to add new agent

**Key Interactions**:
- Pull-to-refresh for latest data
- Tap card → Agent Details modal
- Tap FAB → Create Agent modal

### 2. Workflow Editor Tab
**Purpose**: Visual workflow creation and management

**Layout**:
- **Header**: "Workflows" title + "New" button
- **Workflow List** (if no workflow selected):
  - Card-based list of saved workflows
  - Each card: workflow name, agent count, last modified
  - Tap to open in editor
- **Visual Editor** (when workflow selected):
  - Canvas area with zoom/pan gestures
  - Node palette at bottom (draggable agent nodes)
  - Connection lines between nodes
  - Properties panel (slide-up sheet)

**Key Interactions**:
- Pinch to zoom canvas
- Drag nodes to position
- Tap node to connect/configure
- Two-finger tap to delete connection
- Save button in header

### 3. Chat Tab
**Purpose**: Messenger-like interface for AI conversations

**Layout**:
- **Header**: 
  - "AI Chat" title
  - Mode selector button (Quick/Optimized/Long-term)
  - Settings icon
- **Message List**:
  - Scrollable message bubbles
  - User messages (right, purple)
  - AI messages (left, slate surface)
  - Typing indicator
  - Timestamp on long-press
- **Input Area**:
  - Text input field
  - Send button
  - Attachment button (optional)
  - Voice input button (optional)

**Chat Modes**:
1. **Quick Mode** ⚡: Fast responses, minimal processing
2. **Optimized Mode** 🎯: Balanced speed/quality
3. **Long-term Mode** 🔄: Can run 7 days/24h, background processing

**Key Interactions**:
- Tap mode button → mode selector modal
- Type + send message
- Swipe message left → delete
- Long-press message → copy/share options

### 4. Settings Tab
**Purpose**: App configuration and preferences

**Layout**:
- **Header**: "Settings" title
- **Settings Groups**:
  - **Account**: User profile, logout
  - **Notifications**: Push notification preferences
  - **Appearance**: Theme toggle (dark/light)
  - **API Configuration**: API keys, endpoints
  - **About**: Version, help, privacy policy

**Key Interactions**:
- Tap row → detail screen or toggle
- Standard iOS settings patterns

## Navigation Structure

### Tab Bar (Bottom)
1. **Dashboard** 🏠 (Home icon)
2. **Workflow** 🔄 (Flow diagram icon)
3. **Chat** 💬 (Message bubble icon)
4. **Settings** ⚙️ (Gear icon)

## Component Patterns

### Agent Card
- **Layout**: Horizontal card with icon, text, status badge
- **Icon**: Left side, circular, colored by agent type
- **Text**: Agent name (bold), type (muted), last activity (small)
- **Status Badge**: Right side, colored dot + text (Active/Idle/Offline)

### Status Indicator
- **Active**: Green pulsing dot
- **Idle**: Yellow static dot
- **Offline**: Red static dot
- **Processing**: Blue animated spinner

### Modal Sheets
- **Slide-up**: Bottom sheet for quick actions, forms
- **Full-screen**: Complex forms, detailed views
- **Backdrop**: Semi-transparent dark overlay

## Typography

### Font Stack
- **Primary**: System font (San Francisco on iOS, Roboto on Android)
- **Monospace**: For code snippets, API keys

### Scale
- **Heading 1**: 28px, bold (screen titles)
- **Heading 2**: 22px, semibold (section headers)
- **Heading 3**: 18px, semibold (card titles)
- **Body**: 16px, regular (main text)
- **Caption**: 14px, regular (labels, secondary text)
- **Small**: 12px, regular (timestamps, metadata)

## Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## Animations & Transitions
- **Duration**: 200-300ms for most interactions
- **Easing**: ease-in-out for natural feel
- **Haptic feedback**: Light impact on button taps, medium on toggles
- **Loading states**: Skeleton screens, not spinners

## Key User Flows

### Flow 1: Monitor Agent Status
1. User opens app → Dashboard screen
2. Sees overview cards + agent list
3. Taps agent card → Agent Details modal
4. Views metrics, logs, actions
5. Taps "Stop" → Confirmation → Agent stopped

### Flow 2: Create Workflow
1. User taps Workflow tab
2. Taps "New" button → Blank canvas
3. Drags agent nodes from palette
4. Connects nodes by tapping
5. Taps node → Configure properties
6. Taps "Save" → Name workflow → Saved

### Flow 3: Chat with AI (Quick Mode)
1. User taps Chat tab
2. Sees mode selector (Quick selected)
3. Types message → Taps send
4. AI responds in 1-2 seconds
5. Conversation continues

### Flow 4: Start Long-term Task
1. User taps Chat tab
2. Taps mode button → Selects "Long-term Mode"
3. Types complex task → Sends
4. AI confirms background processing
5. User closes app
6. Receives push notification when complete (hours/days later)

## Accessibility
- **VoiceOver support**: All interactive elements labeled
- **Dynamic Type**: Respect system font size settings
- **Color contrast**: WCAG AA compliant
- **Touch targets**: Minimum 44x44pt

## Performance Targets
- **Launch time**: < 2 seconds
- **Tab switching**: < 100ms
- **Message send**: < 500ms (Quick mode)
- **Workflow render**: < 1 second (100 nodes)

## Technical Notes
- **State management**: React Context + AsyncStorage for local persistence
- **Real-time**: WebSocket for live agent status updates
- **Offline support**: Cache last known state, queue actions
- **API integration**: REST API for CRUD, WebSocket for real-time
