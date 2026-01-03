'use client';

import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore, type Project } from '@/app/store/canvas-store';
import { EntityNode } from '@/app/components/nodes/EntityNode';
import { AgentNode } from '@/app/components/nodes/AgentNode';
import { SummaryNode } from '@/app/components/nodes/SummaryNode';
import { FindingNode } from '@/app/components/nodes/FindingNode';
import { CanvasControls } from './CanvasControls';
import { CommandBar } from './CommandBar';
import { LeftPanel } from '@/app/components/panels/LeftPanel';
import { DetailPanel } from '@/app/components/panels/DetailPanel';
import type { LoadedNode, LoadedEdge } from '@/lib/data/loaders';

const nodeTypes = {
  entity: EntityNode,
  agent: AgentNode,
  summary: SummaryNode,
  finding: FindingNode,
};

const EDGE_STYLE = {
  stroke: '#06b6d4',
  strokeWidth: 2,
} as const;

interface CanvasProps {
  projectId?: string;
  initialProjects?: Project[];
  initialUser?: { id: string; email: string } | null;
  initialNodes?: LoadedNode[];
  initialEdges?: LoadedEdge[];
}

function Canvas({ projectId, initialProjects, initialUser, initialNodes, initialEdges }: CanvasProps) {
  const {
    nodes,
    edges,
    selectedNodes,
    detailPanelOpen,
    shouldFitView,
    activeProjectId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    clearSelection,
    setShouldFitView,
    setActiveProjectId,
    setNodes,
    setEdges,
    setProjects,
    deleteNode,
  } = useCanvasStore();

  const { fitView } = useReactFlow();
  const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFitViewRef = useRef<number>(0);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (initialProjects) {
      setProjects(initialProjects);
    }

    if (projectId) {
      setActiveProjectId(projectId);

      if (initialNodes && initialEdges) {
        const reactFlowNodes: Node[] = initialNodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: { x: n.positionX, y: n.positionY },
          data: { ...n.data, label: n.label, onDelete: () => deleteNode(n.id) },
        }));

        const reactFlowEdges: Edge[] = initialEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: e.animated,
          style: EDGE_STYLE,
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
        }));

        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
        setShouldFitView(true);
      }
    }
  }, [projectId, initialProjects, initialNodes, initialEdges, setProjects, setActiveProjectId, setNodes, setEdges, setShouldFitView, deleteNode]);

  useEffect(() => {
    if (shouldFitView && nodes.length > 0) {
      const now = Date.now();
      const timeSinceLastFit = now - lastFitViewRef.current;

      if (fitViewTimeoutRef.current) {
        clearTimeout(fitViewTimeoutRef.current);
      }

      const delay = timeSinceLastFit < 1000 ? 300 : 150;

      fitViewTimeoutRef.current = setTimeout(() => {
        fitView({
          padding: 0.35,
          duration: 800,
          maxZoom: 0.7,
          minZoom: 0.3,
        });
        lastFitViewRef.current = Date.now();
        setShouldFitView(false);
      }, delay);

      return () => {
        if (fitViewTimeoutRef.current) {
          clearTimeout(fitViewTimeoutRef.current);
        }
      };
    }
  }, [shouldFitView, nodes.length, fitView, setShouldFitView]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const isMultiSelect = event.metaKey || event.ctrlKey;
      selectNode(
        { id: node.id, type: node.type || '', data: node.data as Record<string, unknown> },
        isMultiSelect
      );
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    if (selectedNodes.length > 0) {
      clearSelection();
    }
  }, [selectedNodes.length, clearSelection]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="w-full h-screen bg-slate-50 flex overflow-hidden">
      <LeftPanel initialUser={initialUser} initialProjects={initialProjects} />

      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          proOptions={proOptions}
          fitView
          className="bg-slate-100"
        >
          <Background variant={BackgroundVariant.Dots} color="#94a3b8" gap={16} size={1.5} />
          <Controls
            className="!bg-white/90 !backdrop-blur-sm !border-slate-200 !shadow-lg !rounded-xl"
            showInteractive={false}
          />
          <CanvasControls hasProjects={initialProjects && initialProjects.length > 0} />
          <CommandBar />
        </ReactFlow>
      </div>

      {detailPanelOpen && selectedNodes.length > 0 && <DetailPanel />}
    </div>
  );
}

interface ScoloCanvasProps {
  projectId?: string;
  initialProjects?: Project[];
  initialUser?: { id: string; email: string } | null;
  initialNodes?: LoadedNode[];
  initialEdges?: LoadedEdge[];
}

export default function ScoloCanvas({
  projectId,
  initialProjects,
  initialUser,
  initialNodes,
  initialEdges,
}: ScoloCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas
        projectId={projectId}
        initialProjects={initialProjects}
        initialUser={initialUser}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    </ReactFlowProvider>
  );
}
