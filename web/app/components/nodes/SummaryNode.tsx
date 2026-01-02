'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText, X, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummaryNodeData {
  label: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  totalFindings: number;
  toolsCompleted: number;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

export const SummaryNode = memo(({ id, data }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as SummaryNodeData;

  const getRiskConfig = () => {
    switch (nodeData.riskLevel) {
      case 'critical':
        return { color: 'bg-red-600', border: 'border-red-300', icon: <X className="w-5 h-5 text-white" />, text: 'Critical Risk' };
      case 'high':
        return { color: 'bg-red-500', border: 'border-red-200', icon: <AlertTriangle className="w-5 h-5 text-white" />, text: 'High Risk' };
      case 'medium':
        return { color: 'bg-amber-500', border: 'border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-white" />, text: 'Medium Risk' };
      default:
        return { color: 'bg-emerald-500', border: 'border-emerald-200', icon: <CheckCircle className="w-5 h-5 text-white" />, text: 'Low Risk' };
    }
  };

  const riskConfig = getRiskConfig();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white border ${riskConfig.border} rounded-2xl shadow-lg transition-all duration-300 min-w-[320px] max-w-[400px] overflow-visible group hover:shadow-xl`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${riskConfig.color}`} />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !shadow-lg" />

      {isHovered && nodeData.onDelete && (
        <button
          onClick={() => nodeData.onDelete?.(id)}
          className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50 hover:scale-110"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${riskConfig.color}`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <div className="text-slate-900 font-semibold text-sm">{nodeData.label || 'Analysis Summary'}</div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 ${riskConfig.color} text-white text-xs rounded-full font-medium shadow-sm`}>
                {riskConfig.text}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                {nodeData.totalFindings} findings
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {riskConfig.icon}
          </div>
        </div>

        <div className="prose prose-sm prose-slate max-w-none max-h-[300px] overflow-y-auto px-1">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 mt-3 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold text-slate-900 mt-3 mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-800 mt-2 mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-xs text-slate-600 my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="text-xs text-slate-600 my-1 ml-3 space-y-0.5">{children}</ul>,
              li: ({ children }) => <li className="text-xs text-slate-600">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
              em: ({ children }) => <em className="text-slate-500">{children}</em>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline">
                  {children}
                </a>
              ),
            }}
          >
            {nodeData.summary}
          </ReactMarkdown>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>{nodeData.toolsCompleted} tools completed</span>
          </div>
        </div>
      </div>
    </div>
  );
});

SummaryNode.displayName = 'SummaryNode';
