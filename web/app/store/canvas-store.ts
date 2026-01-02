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
  AGENT_Y: 260,
  AGENT_SPACING: 280,
  SUMMARY_Y: 480,
  ORGANIZE_SPACING: 300,
  ORGANIZE_LEVEL_SPACING: 200,
  ORGANIZE_START_X: 200,
  ORGANIZE_START_Y: 100,
} as const;

const EDGE_STYLE = {
  stroke: '#06b6d4',
  strokeWidth: 2,
} as const;

const TOOL_PATTERNS: Record<string, RegExp> = {
  sanctions: /src\.tools\.sanctions|sanctions\.py/,
  pep_check: /src\.tools\.pep_check|pep_check\.py/,
  adverse_media: /src\.tools\.adverse_media|adverse_media\.py/,
  geo_risk: /src\.tools\.geo_risk|geo_risk\.py/,
  business_registry: /src\.tools\.business_registry|business_registry\.py/,
};

const WARNING_STATUSES = new Set(['match', 'alert', 'high', 'critical']);

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
  toolUseIdToAgentId: Record<string, string>;
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
  createEdge: (source: string, target: string, animated?: boolean) => void;
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

function createDefaultEdge(source: string, target: string, animated = true): Edge {
  return {
    id: `e${source}-${target}-${Date.now()}`,
    source,
    target,
    animated,
    style: EDGE_STYLE,
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
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
    toolUseIdToAgentId: {},
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

    createEdge: (source, target, animated = true) => {
      const projectId = get().activeProjectId;
      const edge = createDefaultEdge(source, target, animated);
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
      const { createNodeWithId, createEdge, updateNodeData, nodes } = get();

      switch (message.type) {
        case 'project_start':
          handleProjectStart(message, set, createNodeWithId);
          break;

        case 'agent_start':
          handleAgentStart(message, get, set, createNodeWithId, createEdge, updateNodeData, nodes);
          break;

        case 'agent_progress':
          updateNodeData(message.agent_id, {
            status: 'streaming',
            progress: message.payload.progress,
            task: message.payload.task,
          });
          break;

        case 'agent_complete':
          handleAgentComplete(message, set, updateNodeData);
          break;

        case 'agent_error':
          updateNodeData(message.agent_id, {
            status: 'failed',
            error: message.payload.error,
          });
          break;

        case 'project_complete':
          handleProjectComplete(message, get, set, updateNodeData, nodes);
          break;

        case 'trace':
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
  get: () => CanvasState,
  set: (state: Partial<CanvasState>) => void,
  createNodeWithId: CanvasActions['createNodeWithId'],
  createEdge: CanvasActions['createEdge'],
  updateNodeData: CanvasActions['updateNodeData'],
  nodes: Node[]
) {
  const entityId = get().entityNodeId;
  const existingNode = nodes.find((n) => n.id === message.agent_id);

  if (!existingNode && entityId) {
    const agentCount = nodes.filter((n) => n.type === 'agent').length;
    const position = calculateAgentPosition(agentCount);
    const toolLabel = extractToolLabel(message.payload.task);

    createNodeWithId(message.agent_id, 'agent', position, {
      label: toolLabel,
      status: 'running',
      task: message.payload.task,
    });
    createEdge(entityId, message.agent_id);

    set({
      shouldFitView: true,
      statusInfo: {
        type: 'tool_call',
        message: `Starting ${toolLabel}`,
        tool: message.agent_id.split('-')[0],
        description: message.payload.task,
      },
    });
  } else if (existingNode) {
    updateNodeData(message.agent_id, { status: 'running', task: message.payload.task });
    set({
      statusInfo: {
        type: 'tool_call',
        message: message.payload.task || 'Running...',
        tool: message.agent_id.split('-')[0],
        description: message.payload.task,
      },
    });
  }
}

function handleAgentComplete(
  message: Extract<SSEMessage, { type: 'agent_complete' }>,
  set: (state: Partial<CanvasState>) => void,
  updateNodeData: CanvasActions['updateNodeData']
) {
  const toolName = message.agent_id.split('-')[0].replace('_', ' ');
  const resultStatus = message.payload.status || 'done';
  const isWarning = message.payload.resultType === 'warning';

  updateNodeData(message.agent_id, {
    status: isWarning ? 'warning' : 'completed',
    resultType: message.payload.resultType,
    findings: message.payload.findings,
    confidence: message.payload.confidence,
  });

  set({
    statusInfo: {
      type: 'tool_result',
      message: `${toolName}: ${resultStatus}`,
      tool: message.agent_id.split('-')[0],
      description: isWarning ? `⚠️ ${toolName} - Match found` : `✓ ${toolName} - Clear`,
    },
  });
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
    toolUseIdToAgentId: {},
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
        { id: item.id, input: { command: item.input.command, description: item.input.description } },
        get,
        set
      );
    }

    if (item.tool_use_id && item.content) {
      const agentId = get().toolUseIdToAgentId[item.tool_use_id];
      if (agentId) {
        updateNodeData(agentId, { streamingText: item.content.slice(0, 200) });
      }
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

  agentNodes.forEach((agent) => createEdge(agent.id, summaryId));
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
  item: { id: string; input: { command: unknown; description?: unknown } },
  get: () => CanvasState & CanvasActions,
  set: (state: Partial<CanvasState>) => void
) {
  const cmd = String(item.input.command);
  const description = item.input.description as string | undefined;
  const toolKey = detectToolFromCommand(cmd);

  if (!toolKey) return;

  const agentNodes = get().nodes.filter((n) => n.type === 'agent' && n.id.startsWith(toolKey));
  if (agentNodes.length > 0) {
    set({ toolUseIdToAgentId: { ...get().toolUseIdToAgentId, [item.id]: agentNodes[0].id } });
  }

  set({
    statusInfo: {
      type: 'tool_call',
      message: cmd,
      tool: toolKey,
      description: description || `Running ${toolKey.replace('_', ' ')}...`,
    },
  });
}
