'use client';

import { useRef, useEffect, useCallback } from 'react';
import { X, AlertTriangle, Shield, Bot, CheckCircle, ClipboardList } from 'lucide-react';
import { FindingsList, Finding, StatusBadge } from '@/app/components/shared';
import { useCanvasStore, SelectedNode } from '@/app/store/canvas-store';
import ReactMarkdown from 'react-markdown';

export function DetailPanel() {
  const { selectedNodes, closeDetailPanel } = useCanvasStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.transform = 'translateX(100%)';
      panelRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        if (panelRef.current) {
          panelRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
          panelRef.current.style.transform = 'translateX(0)';
          panelRef.current.style.opacity = '1';
        }
      });
    }
  }, []);

  const handleClose = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.style.transform = 'translateX(100%)';
      panelRef.current.style.opacity = '0';
      setTimeout(closeDetailPanel, 300);
    }
  }, [closeDetailPanel]);

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 h-full w-[400px] bg-black/20 backdrop-blur-md border-l border-white/10 shadow-2xl z-40 flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/20">
        <div>
          <div className="font-semibold text-white">
            {selectedNodes.length === 1 ? 'Node Details' : `${selectedNodes.length} Nodes`}
          </div>
          {selectedNodes.length === 1 && (
            <div className="text-sm text-white/60 mt-0.5">{selectedNodes[0].data.label as string}</div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-black/40 rounded-xl transition-all group"
        >
          <X className="w-5 h-5 text-white/40 group-hover:text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selectedNodes.length === 1 ? (
          <NodeDetails node={selectedNodes[0]} />
        ) : (
          <div className="p-6 bg-black/20 rounded-2xl text-center">
            <div className="text-sm text-white/50">
              Select a single node to view details.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeDetails({ node }: { node: SelectedNode }) {
  const { type, data } = node;

  if (type === 'entity') {
    return <EntityDetails data={data} />;
  }

  if (type === 'agent') {
    return <AgentDetails data={data} />;
  }

  if (type === 'summary') {
    return <SummaryDetails data={data} />;
  }

  return <GenericDetails data={data} />;
}

function EntityDetails({ data }: { data: Record<string, unknown> }) {
  const riskScore = (data.riskScore as number) || 0;
  const riskLevel = data.riskLevel as string | undefined;
  const status = data.status as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-black/30 to-black/40 rounded-2xl border border-white/20">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-white">{data.label as string}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-white/60 capitalize">{data.entityType as string}</span>
            {status && <StatusBadge status={status} size="sm" />}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Risk Assessment</h3>
        <div className="p-4 bg-black/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Overall Score</span>
            <span
              className={`text-2xl font-bold ${
                riskScore >= 70 ? 'text-red-500' : riskScore >= 40 ? 'text-amber-500' : 'text-emerald-500'
              }`}
            >
              {riskScore}/100
            </span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                riskScore >= 70
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : riskScore >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
          {riskLevel && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Risk Level</span>
              <StatusBadge status={riskLevel} size="sm" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Details</h3>
        <div className="divide-y divide-white/10 bg-black/30 rounded-xl overflow-hidden">
          <DetailRow label="Status" value={status} />
          <DetailRow label="Country" value={data.country as string} />
          <DetailRow label="Reg. Number" value={data.registrationNumber as string | undefined} />
          <DetailRow label="Reg. Date" value={data.registrationDate as string | undefined} />
        </div>
      </div>
    </div>
  );
}

function AgentDetails({ data }: { data: Record<string, unknown> }) {
  const findings = data.findings as Finding[] | undefined;
  const confidence = data.confidence as number | undefined;
  const status = data.status as string;
  const resultType = data.resultType as string | undefined;
  const error = data.error as string | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-black/30 to-black/40 rounded-2xl border border-white/20">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-white">{data.label as string}</div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={status} size="sm" />
            {confidence && (
              <span className="text-xs text-white/60">{confidence}% confidence</span>
            )}
          </div>
        </div>
      </div>

      {typeof data.task === 'string' && data.task && (
        <div className="p-4 bg-black/30 rounded-xl">
          <div className="text-sm text-white/70">{data.task}</div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium text-sm">Error</span>
          </div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {findings && findings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Findings</h3>
            <span className="text-xs text-white/60">{findings.length} result{findings.length !== 1 ? 's' : ''}</span>
          </div>
          <FindingsList findings={findings} maxItems={10} />
        </div>
      )}

      {(!findings || findings.length === 0) && status === 'completed' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">No findings detected</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryDetails({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as string;
  const riskLevel = data.riskLevel as string;
  const totalFindings = data.totalFindings as number;
  const toolsCompleted = data.toolsCompleted as number;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-black/30 to-black/40 rounded-2xl border border-white/20">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <ClipboardList className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-white">{data.label as string || 'Analysis Summary'}</div>
          <div className="flex items-center gap-2 mt-1">
            {riskLevel && <StatusBadge status={riskLevel} size="sm" />}
            <span className="text-xs text-white/60">{totalFindings} findings</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-black/30 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/60">Tools Completed</span>
          <span className="text-sm font-medium text-white/80">{toolsCompleted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Total Findings</span>
          <span className="text-sm font-medium text-white/80">{totalFindings}</span>
        </div>
      </div>

      {summary && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Full Report</h3>
          <div className="prose prose-sm prose-slate max-w-none bg-black/40 border border-white/20 rounded-xl p-4 max-h-[400px] overflow-y-auto">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-base font-bold text-white mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-white/90 mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-white/70 my-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="text-sm text-white/70 my-2 ml-4 space-y-1 list-disc">{children}</ul>,
                li: ({ children }) => <li className="text-sm text-white/70">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-white/90">{children}</strong>,
                em: ({ children }) => <em className="text-white/60">{children}</em>,
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function GenericDetails({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white">Properties</h3>
      <div className="divide-y divide-white/10 bg-black/30 rounded-xl overflow-hidden">
        {Object.entries(data)
          .filter(([key]) => key !== 'onDelete')
          .map(([key, value]) => (
            <DetailRow key={key} label={key} value={String(value)} />
          ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white/60 capitalize">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
