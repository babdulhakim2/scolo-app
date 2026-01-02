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
} from '@xyflow/react';
import type {
  NodeStatus,
  SSEMessage,
  Project,
  EntityType,
} from '@/app/types/canvas';

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
}

export type CanvasStore = CanvasState & CanvasActions;

const now = Date.now();
const DEFAULT_PROJECTS: Project[] = [
  { id: '1', name: 'Global Ventures Investigation', entityCount: 8, status: 'active', createdAt: now, updatedAt: now },
  { id: '2', name: 'Q4 2024 Compliance Review', entityCount: 24, status: 'active', createdAt: now, updatedAt: now },
];

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodes: [],
    isProcessing: false,
    currentProject: 'Global Ventures Investigation',
    projects: DEFAULT_PROJECTS,
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
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnect: (connection: Connection) => {
      set({
        edges: addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: '#06b6d4', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
          },
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
      const newNode: Node = {
        id,
        type,
        position,
        data: { ...data, onDelete: () => get().deleteNode(id) },
      };
      set({ nodes: [...get().nodes, newNode] });
    },

    createEdge: (source, target, animated = true) => {
      const newEdge: Edge = {
        id: `e${source}-${target}-${Date.now()}`,
        source,
        target,
        animated,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      };
      set({ edges: [...get().edges, newEdge] });
    },

    updateNodeData: (nodeId, newData) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        ),
      });
    },

    deleteNode: (nodeId) => {
      set({
        nodes: get().nodes.filter((n) => n.id !== nodeId),
        edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNodes: get().selectedNodes.filter((n) => n.id !== nodeId),
      });
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
      const { nodes, setNodes } = get();
      if (nodes.length === 0) return;

      const byType = {
        entity: nodes.filter((n) => n.type === 'entity'),
        agent: nodes.filter((n) => n.type === 'agent'),
        data: nodes.filter((n) => n.type === 'data'),
      };

      const spacing = 300;
      const levelSpacing = 200;
      const startX = 200;
      const startY = 100;

      setNodes(
        nodes.map((node) => {
          let x = node.position.x;
          let y = node.position.y;

          if (node.type === 'entity') {
            const idx = byType.entity.findIndex((n) => n.id === node.id);
            x = startX + idx * spacing;
            y = startY;
          } else if (node.type === 'agent') {
            const idx = byType.agent.findIndex((n) => n.id === node.id);
            x = startX + idx * spacing;
            y = startY + levelSpacing;
          } else if (node.type === 'data') {
            const idx = byType.data.findIndex((n) => n.id === node.id);
            const cols = Math.max(3, Math.ceil(Math.sqrt(byType.data.length)));
            x = startX + (idx % cols) * (spacing * 0.8);
            y = startY + levelSpacing * 2 + Math.floor(idx / cols) * 150;
          }

          return { ...node, position: { x, y } };
        })
      );
    },

    handleSSEMessage: (message) => {
      const { createNodeWithId, createEdge, updateNodeData, nodes } = get();

      switch (message.type) {
        case 'project_start': {
          const { entity_name, entity_type } = message.payload;
          const centerX = 500;
          const centerY = 80;

          const entityId = `entity-${message.project_id}`;
          createNodeWithId(entityId, 'entity', { x: centerX, y: centerY }, {
            label: entity_name,
            entityType: entity_type,
            status: 'running',
            riskScore: 0,
          });

          set({ activeProjectId: message.project_id, entityNodeId: entityId });
          break;
        }

        case 'agent_start': {
          const entityId = get().entityNodeId;
          const existingNode = nodes.find((n) => n.id === message.agent_id);

          if (!existingNode && entityId) {
            const agentNodes = nodes.filter((n) => n.type === 'agent');
            const agentSpacing = 280;
            const centerX = 500;
            const xPos = centerX - agentSpacing + agentNodes.length * agentSpacing;

            const toolLabel = message.payload.task?.replace('Running ', '').replace('...', '') || 'Agent';
            createNodeWithId(message.agent_id, 'agent', { x: xPos, y: 260 }, {
              label: toolLabel,
              status: 'running',
              task: message.payload.task,
            });
            createEdge(entityId, message.agent_id);
            set({
              shouldFitView: true,
              statusInfo: { type: 'tool_call', message: `Starting ${toolLabel}`, tool: message.agent_id.split('-')[0], description: message.payload.task }
            });
          } else if (existingNode) {
            updateNodeData(message.agent_id, {
              status: 'running',
              task: message.payload.task,
            });
            set({
              statusInfo: { type: 'tool_call', message: message.payload.task || 'Running...', tool: message.agent_id.split('-')[0], description: message.payload.task }
            });
          }
          break;
        }

        case 'agent_progress':
          updateNodeData(message.agent_id, {
            status: 'streaming',
            progress: message.payload.progress,
            task: message.payload.task,
          });
          break;

        case 'agent_complete': {
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
              description: isWarning ? `⚠️ ${toolName} - Match found` : `✓ ${toolName} - Clear`
            }
          });
          break;
        }

        case 'agent_error':
          updateNodeData(message.agent_id, {
            status: 'failed',
            error: message.payload.error,
          });
          break;

        case 'project_complete': {
          const { risk_level, total_findings, tools_completed } = message.payload;
          const entityId = get().entityNodeId;
          const projectId = get().activeProjectId;

          if (entityId) {
            const riskScore = risk_level === 'high' ? 85 : risk_level === 'medium' ? 50 : 20;
            updateNodeData(entityId, {
              status: 'completed',
              riskScore,
              totalFindings: total_findings,
              riskLevel: risk_level,
            });
          }

          const summaryId = `summary-${projectId}`;
          const summaryNode = nodes.find((n) => n.id === summaryId);
          if (summaryNode) {
            updateNodeData(summaryId, {
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
          break;
        }

        case 'trace': {
          const { message: traceMsg } = message.payload;
          const content = traceMsg.content;

          if (traceMsg.subtype === 'success' && traceMsg.result) {
            const projectId = get().activeProjectId;
            const summaryId = `summary-${projectId}`;
            const agentNodes = get().nodes.filter((n) => n.type === 'agent');

            const centerX = 500;
            const summaryY = 480;

            createNodeWithId(summaryId, 'summary', { x: centerX, y: summaryY }, {
              label: 'Analysis Summary',
              summary: traceMsg.result,
              riskLevel: 'medium',
              totalFindings: 0,
              toolsCompleted: agentNodes.length,
            });

            agentNodes.forEach((agent) => {
              createEdge(agent.id, summaryId);
            });
            set({ shouldFitView: true });
          }

          if (Array.isArray(content)) {
            for (const item of content) {
              if (item.text) {
                const text = item.text as string;
                const isSummary = text.includes('## ') || text.includes('Risk Summary') || text.includes('CRITICAL') || text.length > 200;
                if (isSummary) {
                  set({ statusInfo: { type: 'thinking', message: 'Generating analysis summary...' } });
                } else {
                  set({ statusInfo: { type: 'thinking', message: text.slice(0, 100) } });
                }
              }

              if (item.name === 'Bash' && item.id && item.input?.command) {
                const cmd = String(item.input.command);
                const description = item.input.description as string | undefined;
                const toolPatterns: Record<string, RegExp> = {
                  sanctions: /src\.tools\.sanctions|sanctions\.py/,
                  pep_check: /src\.tools\.pep_check|pep_check\.py/,
                  adverse_media: /src\.tools\.adverse_media|adverse_media\.py/,
                  geo_risk: /src\.tools\.geo_risk|geo_risk\.py/,
                  business_registry: /src\.tools\.business_registry|business_registry\.py/,
                };
                for (const [toolKey, pattern] of Object.entries(toolPatterns)) {
                  if (pattern.test(cmd)) {
                    const agentNodes = get().nodes.filter((n) => n.type === 'agent' && n.id.startsWith(toolKey));
                    if (agentNodes.length > 0) {
                      set({ toolUseIdToAgentId: { ...get().toolUseIdToAgentId, [item.id]: agentNodes[0].id } });
                    }
                    set({
                      statusInfo: {
                        type: 'tool_call',
                        message: cmd,
                        tool: toolKey,
                        description: description || `Running ${toolKey.replace('_', ' ')}...`
                      }
                    });
                    break;
                  }
                }
              }

              if (item.tool_use_id && item.content) {
                const agentId = get().toolUseIdToAgentId[item.tool_use_id];
                if (agentId) {
                  updateNodeData(agentId, { streamingText: item.content.slice(0, 200) });
                }
              }
            }
          }
          break;
        }
      }
    },

    setSSEConnected: (connected) => set({ sseConnected: connected, sseError: connected ? null : get().sseError }),

    setSSEError: (error) => set({ sseError: error }),

    setStatusInfo: (info) => set({ statusInfo: info }),

    setShouldFitView: (should) => set({ shouldFitView: should }),
  }))
);
