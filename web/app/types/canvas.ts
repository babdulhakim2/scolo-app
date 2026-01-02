export type EntityType = 'company' | 'individual';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type NodeStatus =
  | 'idle'
  | 'pending'
  | 'running'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'flagged';

export type ToolKey = 'sanctions' | 'pep_check' | 'adverse_media' | 'business_registry' | 'geo_risk';


export interface ToolInfo {
  id: string;
  key: string;
  name: string;
}

export interface ToolResult {
  tool: string;
  status: string;
  findings: number;
}

export interface ProjectStartPayload {
  entity_name: string;
  entity_type: string;
}

export interface ProjectCompletePayload {
  total_findings: number;
  tools_completed: number;
  risk_level: RiskLevel;
  results: ToolResult[];
}

export interface AgentPayload {
  task?: string;
  progress?: number;
  status?: string;
  resultType?: 'success' | 'warning' | 'error' | 'info';
  findings?: unknown[];
  confidence?: number;
  error?: string;
}

export interface TracePayload {
  message: {
    content?: Array<{ text?: string; id?: string; name?: string; input?: Record<string, unknown>; tool_use_id?: string; content?: string; is_error?: boolean }>;
    subtype?: string;
    result?: string;
    [key: string]: unknown;
  };
}

export type SSEMessage =
  | { type: 'project_start'; project_id: string; payload: ProjectStartPayload }
  | { type: 'project_complete'; project_id: string; payload: ProjectCompletePayload }
  | { type: 'agent_start'; project_id: string; agent_id: string; payload: AgentPayload }
  | { type: 'agent_progress'; project_id: string; agent_id: string; payload: AgentPayload }
  | { type: 'agent_complete'; project_id: string; agent_id: string; payload: AgentPayload }
  | { type: 'agent_error'; project_id: string; agent_id: string; payload: AgentPayload }
  | { type: 'trace'; project_id: string; payload: TracePayload };

export interface Project {
  id: string;
  name: string;
  description?: string;
  entityCount: number;
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface StartProjectResponse {
  project_id: string;
  entity_name: string;
  entity_type: string;
  tools: ToolInfo[];
}
