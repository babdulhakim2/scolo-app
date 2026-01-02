'use client';

import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/app/store/canvas-store';
import { EntityNode } from '@/app/components/nodes/EntityNode';
import { AgentNode } from '@/app/components/nodes/AgentNode';
import { SummaryNode } from '@/app/components/nodes/SummaryNode';
import { CanvasControls } from './CanvasControls';
import { CommandBar } from './CommandBar';
import { LeftPanel } from '@/app/components/panels/LeftPanel';
import { DetailPanel } from '@/app/components/panels/DetailPanel';

const nodeTypes = {
  entity: EntityNode,
  agent: AgentNode,
  summary: SummaryNode,
};

interface CanvasProps {
  projectId?: string;
}

function Canvas({ projectId }: CanvasProps) {
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
    loadProject,
    setActiveProjectId,
    fetchProjects,
  } = useCanvasStore();

  const { fitView } = useReactFlow();
  const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFitViewRef = useRef<number>(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projectId && projectId !== activeProjectId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setActiveProjectId(projectId);
      loadProject(projectId);
    }
  }, [projectId, activeProjectId, setActiveProjectId, loadProject]);

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
      <LeftPanel />

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
          <CanvasControls />
          <CommandBar />
        </ReactFlow>
      </div>

      {detailPanelOpen && selectedNodes.length > 0 && <DetailPanel />}
    </div>
  );
}

interface ScoloCanvasProps {
  projectId?: string;
}

export default function ScoloCanvas({ projectId }: ScoloCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas projectId={projectId} />
    </ReactFlowProvider>
  );
}
