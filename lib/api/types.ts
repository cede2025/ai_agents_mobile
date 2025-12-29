// Agent Types
export type AgentStatus = "active" | "idle" | "error";
export type AgentType =
  | "code_generator"
  | "data_analyzer"
  | "web_scraper"
  | "file_processor"
  | "api_integrator"
  | "text_processor"
  | "image_analyzer"
  | "custom";

export type AIProvider = "groq" | "deepseek" | "gemini" | "openrouter" | "kimi";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  provider: AIProvider;
  model: string;
  status: AgentStatus;
  lastUsed: string;
  performance: number;
  color: string;
  capabilities: string[];
  config: AgentConfig;
}

export interface AgentConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  parallelExecution: boolean;
  customPrompts: Record<string, string>;
  parameters: Record<string, any>;
  constraints: string[];
}

// Workflow Types
export type NodeType =
  | "agent"
  | "condition"
  | "action"
  | "input"
  | "output"
  | "delay"
  | "loop"
  | "parallel";

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: any;
  inputs: any[];
  outputs: any[];
}

export interface Connection {
  id: string;
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    status: "active" | "idle" | "processing";
    agentCount: number;
  };
}

// Chat Types
export type ChatMode = "quick" | "optimized" | "longterm";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  mode?: ChatMode;
}

export interface ChatModeConfig {
  id: ChatMode;
  name: string;
  icon: string;
  description: string;
  features: string[];
  maxTokens: number;
  timeout: number;
  providers: AIProvider[];
}

// System Metrics
export interface SystemMetrics {
  totalAgents: number;
  activeTasks: number;
  systemHealth: "healthy" | "degraded" | "critical";
  apiUsage: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

// WebSocket Events
export interface WebSocketEvent {
  type: string;
  data: any;
}

export interface AgentStatusEvent {
  agentId: string;
  status: AgentStatus;
  timestamp: string;
}

export interface WorkflowEvent {
  workflowId: string;
  status: "started" | "completed" | "failed";
  result?: any;
  error?: string;
  timestamp: string;
}

export interface ChatTypingEvent {
  userId: string;
  isTyping: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}
