'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Globe,
  Phone,
  Mail,
  AtSign,
  Wifi,
  MapPin,
  Hash,
  X,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { gsap } from 'gsap';

export type CircularNodeSubType =
  | 'phone'
  | 'email'
  | 'social'
  | 'ip'
  | 'location'
  | 'domain'
  | 'generic';

interface CircularNodeData {
  label: string;
  subType: CircularNodeSubType;
  value: string;
  metadata?: string;
  risk?: 'low' | 'medium' | 'high';
  platform?: string; // For social media
  carrier?: string; // For phone
  breaches?: number; // For email
  country?: string; // For IP/location
  onDelete?: (id: string) => void;
}

export const CircularNode = memo(({ id, data }: NodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as unknown as CircularNodeData;

  useEffect(() => {
    if (nodeRef.current) {
      gsap.fromTo(
        nodeRef.current,
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  const getConfig = () => {
    const riskColor = nodeData.risk === 'high' ? '#ef4444' :
                      nodeData.risk === 'medium' ? '#f59e0b' : '#06b6d4';

    switch (nodeData.subType) {
      case 'phone':
        return {
          icon: <Phone className="w-5 h-5 text-white" />,
          gradient: 'from-[#06b6d4] to-[#0891b2]',
          border: riskColor,
          ringColor: 'rgba(6, 182, 212, 0.2)',
        };
      case 'email':
        return {
          icon: <Mail className="w-5 h-5 text-white" />,
          gradient: nodeData.breaches && nodeData.breaches > 0
            ? 'from-[#f59e0b] to-[#ea580c]'
            : 'from-[#0891b2] to-[#0e7490]',
          border: nodeData.breaches && nodeData.breaches > 0 ? '#f59e0b' : riskColor,
          ringColor: 'rgba(8, 145, 178, 0.2)',
        };
      case 'social':
        return {
          icon: <AtSign className="w-5 h-5 text-white" />,
          gradient: 'from-[#8b5cf6] to-[#7c3aed]',
          border: riskColor,
          ringColor: 'rgba(139, 92, 246, 0.2)',
        };
      case 'ip':
        return {
          icon: <Wifi className="w-5 h-5 text-white" />,
          gradient: 'from-[#06b6d4] to-[#0284c7]',
          border: riskColor,
          ringColor: 'rgba(6, 182, 212, 0.2)',
        };
      case 'location':
        return {
          icon: <MapPin className="w-5 h-5 text-white" />,
          gradient: 'from-[#10b981] to-[#059669]',
          border: riskColor,
          ringColor: 'rgba(16, 185, 129, 0.2)',
        };
      case 'domain':
        return {
          icon: <Globe className="w-5 h-5 text-white" />,
          gradient: 'from-[#0284c7] to-[#0369a1]',
          border: riskColor,
          ringColor: 'rgba(2, 132, 199, 0.2)',
        };
      default:
        return {
          icon: <Hash className="w-5 h-5 text-white" />,
          gradient: 'from-[#64748b] to-[#475569]',
          border: riskColor,
          ringColor: 'rgba(100, 116, 139, 0.2)',
        };
    }
  };

  const config = getConfig();

  // Format display value
  const formatValue = () => {
    if (nodeData.subType === 'email' && nodeData.value.length > 20) {
      return nodeData.value.substring(0, 17) + '...';
    }
    if (nodeData.subType === 'phone') {
      // Format phone number if it's numeric
      const cleaned = nodeData.value.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
    }
    if (nodeData.subType === 'social' && nodeData.platform) {
      return `@${nodeData.value}`;
    }
    return nodeData.value;
  };

  // Build metadata display
  const getMetadataDisplay = () => {
    const parts = [];
    if (nodeData.carrier) parts.push(nodeData.carrier);
    if (nodeData.country) parts.push(nodeData.country);
    if (nodeData.platform) parts.push(nodeData.platform);
    if (nodeData.breaches && nodeData.breaches > 0) {
      parts.push(`${nodeData.breaches} breach${nodeData.breaches > 1 ? 'es' : ''}`);
    }
    if (nodeData.metadata) parts.push(nodeData.metadata);
    return parts.join(' • ');
  };

  return (
    <div
      ref={nodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} opacity-30 blur-xl transition-all duration-500 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
      />

      {/* Main circular container */}
      <div
        className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} shadow-2xl transition-all duration-300 overflow-visible flex flex-col items-center justify-center ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
        style={{
          borderWidth: '3px',
          borderColor: config.border,
          borderStyle: 'solid'
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-[#06b6d4] !border-2 !border-white shadow-lg"
        />

        {/* Delete Button */}
        {isHovered && nodeData.onDelete && (
          <button
            onClick={() => nodeData.onDelete?.(id)}
            className="absolute -top-3 -right-3 w-7 h-7 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50 hover:scale-110"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Risk indicator */}
        {nodeData.risk === 'high' && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Glass effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
          <div className="mb-1">
            {config.icon}
          </div>

          <div className="text-white text-xs font-medium text-center px-2">
            {nodeData.label}
          </div>

          <div className="text-white text-[10px] opacity-90 font-mono text-center px-2 max-w-[110px] truncate">
            {formatValue()}
          </div>

          {/* Platform badge for social media */}
          {nodeData.subType === 'social' && nodeData.platform && (
            <div className="text-white text-[9px] opacity-75 uppercase tracking-wider">
              {nodeData.platform}
            </div>
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && getMetadataDisplay() && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-[#0f172a] text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-20 animate-fadeIn">
          {getMetadataDisplay()}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#0f172a] rotate-45" />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[#06b6d4] !border !border-white"
      />
    </div>
  );
});

CircularNode.displayName = 'CircularNode';