import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  MarkerType,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import type {
  NodeStatus,
  SSEMessage,
  Project,
  EntityType,
  ProjectStatus,
} from '@/app/types/canvas';
import {
  syncNodePosition,
  syncNodeData,
  createNodeInDb,
  deleteNodeFromDb,
  createEdgeInDb,
  deleteEdgeFromDb,
  loadProjectFromDb,
  updateProjectStatus,
  fetchProjectsFromDb,
  type DbNode,
  type DbEdge,
} from '@/lib/services/canvas-sync';
import {
  findNonCollidingPosition,
  organizeHierarchical,
} from '@/lib/services/layout-engine';

export type { NodeStatus, SSEMessage, Project, EntityType };

export type StatusType = 'thinking' | 'tool_call' | 'tool_result' | 'complete' | 'idle';

export interface StatusInfo {
  type: StatusType;
  message: string;
  tool?: string;
  description?: string;
}

export interface SelectedNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

const LAYOUT = {
  CENTER_X: 500,
  ENTITY_Y: 80,
  AGENT_Y: 280,
  AGENT_SPACING: 320,
  FINDING_Y: 500,
  FINDING_SPACING: 200,
  SUMMARY_Y: 720,
} as const;

const EDGE_STYLE = {
  stroke: '#06b6d4',
  strokeWidth: 2,
} as const;

const TOOL_TO_FINDING_TYPE: Record<string, string> = {
  sanctions: 'sanction',
  pep_check: 'pep',
  adverse_media: 'adverse_media',
  geo_risk: 'generic',
  business_registry: 'company',
  ubo_lookup: 'company',
  court_records: 'legal',
  property_records: 'property',
  corporate_filings: 'company',
  employment_verify: 'employment',
  education_verify: 'education',
  phone_lookup: 'phone',
  email_lookup: 'email',
  social_media: 'social',
  domain_whois: 'domain',
  ip_geolocation: 'location',
  crypto_trace: 'crypto',
};

const TOOL_PATTERNS: Record<string, RegExp> = {
  sanctions: /src\.tools\.sanctions|sanctions\.py/,
  pep_check: /src\.tools\.pep_check|pep_check\.py/,
  adverse_media: /src\.tools\.adverse_media|adverse_media\.py/,
  geo_risk: /src\.tools\.geo_risk|geo_risk\.py/,
  business_registry: /src\.tools\.business_registry|business_registry\.py/,
  ubo_lookup: /src\.tools\.ubo_lookup|ubo_lookup\.py/,
  court_records: /src\.tools\.court_records|court_records\.py/,
  property_records: /src\.tools\.property_records|property_records\.py/,
  corporate_filings: /src\.tools\.corporate_filings|corporate_filings\.py/,
  employment_verify: /src\.tools\.employment_verify|employment_verify\.py/,
  education_verify: /src\.tools\.education_verify|education_verify\.py/,
  phone_lookup: /src\.tools\.phone_lookup|phone_lookup\.py/,
  email_lookup: /src\.tools\.email_lookup|email_lookup\.py/,
  social_media: /src\.tools\.social_media|social_media\.py/,
  domain_whois: /src\.tools\.domain_whois|domain_whois\.py/,
  ip_geolocation: /src\.tools\.ip_geolocation|ip_geolocation\.py/,
  crypto_trace: /src\.tools\.crypto_trace|crypto_trace\.py/,
};

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: SelectedNode[];
  isProcessing: boolean;
  currentProject: string;
  projects: Project[];
  sidebarCollapsed: boolean;
  detailPanelOpen: boolean;
  nodeIdCounter: number;
  activeProjectId: string | null;
  entityNodeId: string | null;
  sseConnected: boolean;
  sseError: string | null;
  statusInfo: StatusInfo | null;
  shouldFitView: boolean;
}

interface CanvasActions {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  createNode: (type: string, position: { x: number; y: number }, data: Record<string, unknown>) => string;
  createNodeWithId: (id: string, type: string, position: { x: number; y: number }, data: Record<string, unknown>) => void;
  createEdge: (source: string, target: string, animated?: boolean, label?: string) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (node: SelectedNode, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setCurrentProject: (project: string) => void;
  toggleSidebar: () => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  setProcessing: (processing: boolean) => void;
  autoOrganize: () => void;
  handleSSEMessage: (message: SSEMessage) => void;
  setSSEConnected: (connected: boolean) => void;
  setSSEError: (error: string | null) => void;
  setStatusInfo: (info: StatusInfo | null) => void;
  setShouldFitView: (should: boolean) => void;
  loadProject: (projectId: string) => Promise<void>;
  setActiveProjectId: (projectId: string | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  fetchProjects: () => Promise<void>;
}

export type CanvasStore = CanvasState & CanvasActions;

function createDefaultEdge(source: string, target: string, animated = true, label?: string): Edge {
  return {
    id: `e${source}-${target}-${Date.now()}`,
    source,
    target,
    animated,
    style: EDGE_STYLE,
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
    ...(label && { label, labelStyle: { fill: '#64748b', fontSize: 11 } }),
  };
}

function extractToolLabel(task: string | undefined): string {
  return task?.replace('Running ', '').replace('...', '') || 'Agent';
}

function calculateAgentPosition(agentCount: number): { x: number; y: number } {
  return {
    x: LAYOUT.CENTER_X - LAYOUT.AGENT_SPACING + agentCount * LAYOUT.AGENT_SPACING,
    y: LAYOUT.AGENT_Y,
  };
}

function detectToolFromCommand(command: string): string | null {
  for (const [toolKey, pattern] of Object.entries(TOOL_PATTERNS)) {
    if (pattern.test(command)) {
      return toolKey;
    }
  }
  return null;
}

function riskLevelToScore(riskLevel: string): number {
  if (riskLevel === 'high') return 85;
  if (riskLevel === 'medium') return 50;
  return 20;
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodes: [],
    isProcessing: false,
    currentProject: '',
    projects: [],
    sidebarCollapsed: false,
    detailPanelOpen: false,
    nodeIdCounter: 1,
    activeProjectId: null,
    entityNodeId: null,
    sseConnected: false,
    sseError: null,
    statusInfo: null,
    shouldFitView: false,

    onNodesChange: (changes) => {
      const projectId = get().activeProjectId;
      const oldNodes = get().nodes;
      const newNodes = applyNodeChanges(changes, oldNodes);
      set({ nodes: newNodes });

      if (!projectId) return;

      for (const change of changes as NodeChange[]) {
        if (change.type === 'position' && change.position && !change.dragging) {
          syncNodePosition(projectId, change.id, change.position.x, change.position.y);
        }
        if (change.type === 'remove') {
          deleteNodeFromDb(projectId, change.id);
          const edgesToDelete = get().edges.filter(
            (e) => e.source === change.id || e.target === change.id
          );
          edgesToDelete.forEach((e) => deleteEdgeFromDb(projectId, e.id));
        }
      }
    },

    onEdgesChange: (changes) => {
      const projectId = get().activeProjectId;
      set({ edges: applyEdgeChanges(changes, get().edges) });

      if (!projectId) return;

      for (const change of changes as EdgeChange[]) {
        if (change.type === 'remove') {
          deleteEdgeFromDb(projectId, change.id);
        }
      }
    },

    onConnect: (connection: Connection) => {
      set({
        edges: addEdge(
          { ...connection, animated: true, style: EDGE_STYLE, markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke } },
          get().edges
        ),
      });
    },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    createNode: (type, position, data) => {
      const counter = get().nodeIdCounter;
      const id = `${type}-${counter}`;
      const newNode: Node = {
        id,
        type,
        position,
        data: { ...data, onDelete: () => get().deleteNode(id) },
      };
      set({ nodes: [...get().nodes, newNode], nodeIdCounter: counter + 1 });
      return id;
    },

    createNodeWithId: (id, type, position, data) => {
      const projectId = get().activeProjectId;
      const safePosition = findNonCollidingPosition(get().nodes, position, id);
      const newNode: Node = {
        id,
        type,
        position: safePosition,
        data: { ...data, onDelete: () => get().deleteNode(id) },
      };
      set({ nodes: [...get().nodes, newNode] });

      if (projectId) {
        createNodeInDb(projectId, {
          id,
          type,
          label: (data.label as string) || type,
          position: safePosition,
          data,
        });
      }
    },

    createEdge: (source, target, animated = true, label) => {
      const projectId = get().activeProjectId;
      const edge = createDefaultEdge(source, target, animated, label);
      set({ edges: [...get().edges, edge] });

      if (projectId) {
        createEdgeInDb(projectId, {
          id: edge.id,
          source,
          target,
          animated,
        });
      }
    },

    updateNodeData: (nodeId, newData) => {
      const projectId = get().activeProjectId;
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        ),
      });

      if (projectId) {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) {
          syncNodeData(projectId, nodeId, { ...node.data, ...newData });
        }
      }
    },

    deleteNode: (nodeId) => {
      const projectId = get().activeProjectId;
      const edgesToDelete = get().edges.filter(
        (e) => e.source === nodeId || e.target === nodeId
      );

      set({
        nodes: get().nodes.filter((n) => n.id !== nodeId),
        edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNodes: get().selectedNodes.filter((n) => n.id !== nodeId),
      });

      if (projectId) {
        deleteNodeFromDb(projectId, nodeId);
        edgesToDelete.forEach((e) => deleteEdgeFromDb(projectId, e.id));
      }
    },

    selectNode: (node, multiSelect = false) => {
      if (multiSelect) {
        const exists = get().selectedNodes.find((n) => n.id === node.id);
        set({
          selectedNodes: exists
            ? get().selectedNodes.filter((n) => n.id !== node.id)
            : [...get().selectedNodes, node],
          detailPanelOpen: true,
        });
      } else {
        set({ selectedNodes: [node], detailPanelOpen: true });
      }
    },

    clearSelection: () => set({ selectedNodes: [], detailPanelOpen: false }),
    setCurrentProject: (project) => set({ currentProject: project }),
    toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    openDetailPanel: () => set({ detailPanelOpen: true }),
    closeDetailPanel: () => set({ detailPanelOpen: false, selectedNodes: [] }),
    setProcessing: (processing) => set({ isProcessing: processing }),

    autoOrganize: () => {
      const { nodes, setNodes, activeProjectId } = get();
      if (nodes.length === 0) return;

      const organized = organizeHierarchical(nodes);
      setNodes(organized);

      if (activeProjectId) {
        organized.forEach((node) => {
          syncNodePosition(activeProjectId, node.id, node.position.x, node.position.y);
        });
      }
    },

    handleSSEMessage: (message) => {
      console.log('[SSE] Received message:', message.type, message);
      const { createNodeWithId, createEdge, updateNodeData, nodes } = get();

      switch (message.type) {
        case 'project_start':
          console.log('[SSE] Handling project_start');
          handleProjectStart(message, set, createNodeWithId);
          break;

        case 'agent_start':
          console.log('[SSE] Handling agent_start:', message.agent_id);
          handleAgentStart(message, set);
          break;

        case 'agent_complete':
          console.log('[SSE] Handling agent_complete:', message.agent_id, message.payload);
          handleAgentComplete(message, get, set, createNodeWithId, createEdge, nodes);
          break;

        case 'project_complete':
          console.log('[SSE] Handling project_complete');
          handleProjectComplete(message, get, set, updateNodeData, nodes);
          break;

        case 'trace':
          console.log('[SSE] Handling trace');
          handleTrace(message, get, set, createNodeWithId, createEdge, updateNodeData);
          break;
      }
    },

    setSSEConnected: (connected) => set({ sseConnected: connected, sseError: connected ? null : get().sseError }),
    setSSEError: (error) => set({ sseError: error }),
    setStatusInfo: (info) => set({ statusInfo: info }),
    setShouldFitView: (should) => set({ shouldFitView: should }),

    loadProject: async (projectId) => {
      const data = await loadProjectFromDb(projectId);
      if (!data) return;

      const nodes: Node[] = data.nodes.map((n: DbNode) => ({
        id: n.id,
        type: n.type,
        position: { x: n.positionX, y: n.positionY },
        data: { ...n.data, label: n.label, onDelete: () => get().deleteNode(n.id) },
      }));

      const edges: Edge[] = data.edges.map((e: DbEdge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
        style: EDGE_STYLE,
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
      }));

      set({ nodes, edges, activeProjectId: projectId, shouldFitView: true });
    },

    setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),

    setProjects: (projects) => set({ projects }),

    addProject: (project) => set({ projects: [project, ...get().projects] }),

    fetchProjects: async () => {
      const dbProjects = await fetchProjectsFromDb();
      const projects: Project[] = dbProjects.map((p) => ({
        id: p.id,
        name: p.name,
        entityCount: 0,
        status: (p.status as ProjectStatus) || 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      set({ projects });
    },
  }))
);

function handleProjectStart(
  message: Extract<SSEMessage, { type: 'project_start' }>,
  set: (state: Partial<CanvasState>) => void,
  createNodeWithId: CanvasActions['createNodeWithId']
) {
  const { entity_name, entity_type } = message.payload;
  const entityId = `entity-${message.project_id}`;

  createNodeWithId(entityId, 'entity', { x: LAYOUT.CENTER_X, y: LAYOUT.ENTITY_Y }, {
    label: entity_name,
    entityType: entity_type,
    status: 'running',
    riskScore: 0,
  });

  set({ activeProjectId: message.project_id, entityNodeId: entityId });
}

function handleAgentStart(
  message: Extract<SSEMessage, { type: 'agent_start' }>,
  set: (state: Partial<CanvasState>) => void
) {
  const toolKey = (message.payload as any).tool_key || message.agent_id.split('-')[0];
  const toolLabel = (message.payload as any).tool_name || extractToolLabel(message.payload.task);
  set({
    statusInfo: {
      type: 'tool_call',
      message: `Running ${toolLabel}`,
      tool: toolKey,
      description: message.payload.task,
    },
  });
}

function handleAgentComplete(
  message: Extract<SSEMessage, { type: 'agent_complete' }>,
  get: () => CanvasState & CanvasActions,
  set: (state: Partial<CanvasState>) => void,
  createNodeWithId: CanvasActions['createNodeWithId'],
  createEdge: CanvasActions['createEdge'],
  nodes: Node[]
) {
  console.log('[handleAgentComplete] Processing:', message);
  // Use tool_key from payload if available, otherwise try to extract from agent_id
  const toolKey = (message.payload as any).tool_key || message.agent_id.split('-')[0];
  const toolName = (message.payload as any).tool_name || toolKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const isWarning = message.payload.resultType === 'warning';
  const findings = message.payload.findings || [];
  const entityId = get().entityNodeId;
  console.log('[handleAgentComplete] Full agent_id:', message.agent_id);
  console.log('[handleAgentComplete] Tool key from payload:', toolKey);
  console.log('[handleAgentComplete] Tool:', toolKey, 'Warning:', isWarning, 'Findings:', findings.length);
  console.log('[handleAgentComplete] Should create circular node?', ['phone_lookup', 'email_lookup', 'social_media'].includes(toolKey));

  // Only return early if there are no findings
  if (findings.length === 0) {
    const statusMessage = isWarning ? 'No issues found' : 'Clear';
    set({
      statusInfo: {
        type: 'tool_result',
        message: `${toolName}: ${statusMessage}`,
        tool: toolKey,
        description: `✓ ${toolName} - ${statusMessage}`,
      },
    });
    return;
  }

  const existingAgentNode = nodes.find((n) => n.id === message.agent_id);

  // Log if entityId is missing
  if (!entityId) {
    console.error('[handleAgentComplete] No entityId found! Cannot create agent node.');
    return;
  }

  if (!existingAgentNode && entityId) {
    const agentCount = nodes.filter((n) => n.type === 'agent').length;
    const position = calculateAgentPosition(agentCount);

    // Determine node status based on the result
    const nodeStatus = isWarning ? 'warning' : 'completed';
    const resultType = message.payload.resultType || (isWarning ? 'warning' : 'success');

    createNodeWithId(message.agent_id, 'agent', position, {
      label: toolName,
      status: nodeStatus,
      task: message.payload.task,
      resultType: resultType,
      findings,
      confidence: message.payload.confidence,
    });
    createEdge(entityId, message.agent_id, true, 'investigated by');
    console.log(`[handleAgentComplete] Created agent node: ${message.agent_id} with ${findings.length} findings`);
  }

  const findingType = TOOL_TO_FINDING_TYPE[toolKey] || 'generic';
  const baseX = calculateAgentPosition(nodes.filter((n) => n.type === 'agent').length - 1).x;

  console.log('[handleAgentComplete] About to check for special handling...');
  console.log('[handleAgentComplete] toolKey is:', toolKey);
  console.log('[handleAgentComplete] Checking condition:', toolKey === 'phone_lookup' || toolKey === 'email_lookup' || toolKey === 'social_media');

  // Special handling for different tool types
  if (toolKey === 'phone_lookup' || toolKey === 'email_lookup' || toolKey === 'social_media') {
    console.log('[handleAgentComplete] Creating CIRCULAR nodes for:', toolKey);
    // Create circular nodes for phone/email/social findings
    findings.slice(0, 5).forEach((finding: unknown, idx: number) => {
      const f = finding as Record<string, unknown>;
      const findingId = `circular-${message.agent_id}-${idx}`;
      const offsetX = (idx - Math.min(findings.length - 1, 4) / 2) * LAYOUT.FINDING_SPACING;

      let subType: 'phone' | 'email' | 'social' = 'phone';
      let value = '';
      let label = '';
      let metadata: Record<string, unknown> = {};

      if (toolKey === 'phone_lookup') {
        subType = 'phone';
        value = (f.phone || f.number || '') as string;
        label = (f.registered_name || 'Phone Number') as string;
        metadata = {
          carrier: f.carrier as string,
          country: f.country as string,
          risk: (f.valid ? 'low' : 'high') as 'low' | 'high',
        };
      } else if (toolKey === 'email_lookup') {
        subType = 'email';
        value = (f.email || '') as string;
        label = 'Email Address';
        const breachCount = (f.breach_count || 0) as number;
        metadata = {
          breaches: breachCount,
          risk: breachCount > 2 ? 'high' : breachCount > 0 ? 'medium' : 'low',
        };
      } else if (toolKey === 'social_media') {
        subType = 'social';
        value = (f.handle || f.username || '') as string;
        label = (f.platform || 'Social Media') as string;
        metadata = {
          platform: f.platform as string,
          followers: f.followers as number,
          verified: f.verified as boolean,
        };
      }

      createNodeWithId(findingId, 'circular', { x: baseX + offsetX, y: LAYOUT.FINDING_Y + idx * 20 }, {
        label,
        subType,
        value,
        ...metadata,
        onDelete: () => get().deleteNode(findingId),
      });
      createEdge(message.agent_id, findingId, false, subType === 'phone' ? 'uses phone' : subType === 'email' ? 'uses email' : 'profile on');
    });
  } else if (toolKey === 'adverse_media') {
    // For adverse media, show articles on the main node but extract entities
    // The main node already has the articles in its findings
    // Extract unique entities mentioned in articles
    const extractedEntities = new Set<string>();
    findings.forEach((finding: unknown) => {
      const f = finding as Record<string, unknown>;
      const title = (f.title || '') as string;
      // Simple entity extraction from titles (can be improved)
      const entityMatches = title.match(/([A-Z][a-z]+ [A-Z][a-z]+)/g);
      if (entityMatches) {
        entityMatches.forEach(e => extractedEntities.add(e));
      }
    });

    // Create circular nodes for extracted entities
    Array.from(extractedEntities).slice(0, 3).forEach((entity, idx) => {
      const findingId = `entity-${message.agent_id}-${idx}`;
      const offsetX = (idx - 1) * LAYOUT.FINDING_SPACING;

      createNodeWithId(findingId, 'circular', { x: baseX + offsetX, y: LAYOUT.FINDING_Y + 50 }, {
        label: 'Mentioned Entity',
        subType: 'generic',
        value: entity,
        metadata: 'Found in articles',
        onDelete: () => get().deleteNode(findingId),
      });
      createEdge(message.agent_id, findingId, false, 'mentions');
    });
  } else {
    // Default handling for other findings
    findings.slice(0, 5).forEach((finding: unknown, idx: number) => {
      const f = finding as Record<string, unknown>;
      const findingId = `finding-${message.agent_id}-${idx}`;
      const offsetX = (idx - Math.min(findings.length - 1, 4) / 2) * LAYOUT.FINDING_SPACING;

      const label = (f.name || f.title || f.entity || f.country || 'Finding') as string;
      const description = (f.reason || f.description || f.source || '') as string;
      const severity = determineSeverity(f);

      createNodeWithId(findingId, 'finding', { x: baseX + offsetX, y: LAYOUT.FINDING_Y + idx * 20 }, {
        label,
        findingType: detectFindingType(f) || findingType,
        source: toolName,
        description,
        severity,
        confidence: message.payload.confidence,
        metadata: f,
      });
      createEdge(message.agent_id, findingId, false, 'found');
    });
  }

  const statusIcon = isWarning ? '⚠️' : '✓';
  const statusText = isWarning ? 'matches found' : 'results found';

  set({
    shouldFitView: true,
    statusInfo: {
      type: 'tool_result',
      message: `${toolName}: ${findings.length} ${statusText}`,
      tool: toolKey,
      description: `${statusIcon} ${toolName} - ${findings.length} finding${findings.length > 1 ? 's' : ''}`,
    },
  });
}

function determineSeverity(finding: Record<string, unknown>): 'low' | 'medium' | 'high' | 'critical' {
  const status = String(finding.status || '').toLowerCase();
  const score = Number(finding.score || finding.confidence || 50);

  if (status === 'critical' || score >= 90) return 'critical';
  if (status === 'high' || status === 'match' || score >= 70) return 'high';
  if (status === 'medium' || score >= 40) return 'medium';
  return 'low';
}

function detectFindingType(finding: Record<string, unknown>): string | null {
  const text = JSON.stringify(finding).toLowerCase();

  if (finding.ip_address || /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(text)) return 'ip_address';
  if (finding.crypto_address || finding.wallet || /\b(0x[a-f0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/i.test(text)) return 'crypto';
  if (finding.company || finding.organization) return 'company';
  if (finding.person || finding.individual) return 'person';

  return null;
}

function handleProjectComplete(
  message: Extract<SSEMessage, { type: 'project_complete' }>,
  get: () => CanvasState,
  set: (state: Partial<CanvasState>) => void,
  updateNodeData: CanvasActions['updateNodeData'],
  nodes: Node[]
) {
  const { risk_level, total_findings, tools_completed } = message.payload;
  const entityId = get().entityNodeId;
  const projectId = get().activeProjectId;

  if (entityId) {
    updateNodeData(entityId, {
      status: 'completed',
      riskScore: riskLevelToScore(risk_level),
      totalFindings: total_findings,
      riskLevel: risk_level,
    });
  }

  const summaryId = `summary-${projectId}`;
  if (nodes.find((n) => n.id === summaryId)) {
    updateNodeData(summaryId, {
      riskLevel: risk_level,
      totalFindings: total_findings,
      toolsCompleted: tools_completed,
    });
  }

  if (projectId) {
    updateProjectStatus(projectId, 'completed', {
      riskLevel: risk_level,
      totalFindings: total_findings,
      toolsCompleted: tools_completed,
    });
  }

  set({
    activeProjectId: null,
    entityNodeId: null,
    statusInfo: { type: 'complete', message: 'Analysis complete' },
    shouldFitView: true,
  });
}

function handleTrace(
  message: Extract<SSEMessage, { type: 'trace' }>,
  get: () => CanvasState & CanvasActions,
  set: (state: Partial<CanvasState>) => void,
  createNodeWithId: CanvasActions['createNodeWithId'],
  createEdge: CanvasActions['createEdge'],
  updateNodeData: CanvasActions['updateNodeData']
) {
  const { message: traceMsg } = message.payload;
  const content = traceMsg.content;

  if (traceMsg.subtype === 'success' && traceMsg.result) {
    createSummaryNode(get, set, createNodeWithId, createEdge, traceMsg.result);
  }

  if (!Array.isArray(content)) return;

  for (const item of content) {
    if (item.text) {
      handleTraceText(item.text as string, set);
    }

    if (item.name === 'Bash' && item.id && item.input?.command) {
      handleTraceBashCommand(
        { id: item.id, input: { command: item.input.command } },
        set
      );
    }
  }
}

function createSummaryNode(
  get: () => CanvasState & CanvasActions,
  set: (state: Partial<CanvasState>) => void,
  createNodeWithId: CanvasActions['createNodeWithId'],
  createEdge: CanvasActions['createEdge'],
  result: string
) {
  const projectId = get().activeProjectId;
  const summaryId = `summary-${projectId}`;
  const agentNodes = get().nodes.filter((n) => n.type === 'agent');

  createNodeWithId(summaryId, 'summary', { x: LAYOUT.CENTER_X, y: LAYOUT.SUMMARY_Y }, {
    label: 'Analysis Summary',
    summary: result,
    riskLevel: 'medium',
    totalFindings: 0,
    toolsCompleted: agentNodes.length,
  });

  agentNodes.forEach((agent) => createEdge(agent.id, summaryId, false, 'summarized by'));
  set({ shouldFitView: true });
}

function handleTraceText(text: string, set: (state: Partial<CanvasState>) => void) {
  const isSummary = text.includes('## ') || text.includes('Risk Summary') || text.includes('CRITICAL') || text.length > 200;
  set({
    statusInfo: {
      type: 'thinking',
      message: isSummary ? 'Generating analysis summary...' : text.slice(0, 100),
    },
  });
}

function handleTraceBashCommand(
  item: { id: string; input: { command: unknown } },
  set: (state: Partial<CanvasState>) => void
) {
  const cmd = String(item.input.command);
  const toolKey = detectToolFromCommand(cmd);

  if (!toolKey) return;

  set({
    statusInfo: {
      type: 'tool_call',
      message: `Running ${toolKey.replace('_', ' ')}...`,
      tool: toolKey,
    },
  });
}
