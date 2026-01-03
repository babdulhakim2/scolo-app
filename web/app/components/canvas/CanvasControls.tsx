'use client';

import { Panel } from '@xyflow/react';
import { Activity } from 'lucide-react';
import { useCanvasStore } from '@/app/store/canvas-store';

interface CanvasControlsProps {
  hasProjects?: boolean;
}

export function CanvasControls({ hasProjects }: CanvasControlsProps) {
  return <EmptyState hasProjects={hasProjects} />;
}

function EmptyState({ hasProjects }: { hasProjects?: boolean }) {
  const { nodes, projects, isProcessing } = useCanvasStore();

  const hasAnyProjects = hasProjects ?? projects.length > 0;

  if (nodes.length > 0 || isProcessing || hasAnyProjects) return null;

  return (
    <Panel position="top-center" className="mt-20">
      <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-2xl max-w-md text-center relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Activity className="w-10 h-10 text-cyan-600" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">Start an Investigation</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use the command bar below to investigate entities, run compliance checks, or analyze risk profiles.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-600">
          <span className="text-slate-400">Try:</span>
          <span className="font-medium text-slate-900">&quot;Investigate Global Ventures LLC&quot;</span>
        </div>
      </div>
    </Panel>
  );
}
