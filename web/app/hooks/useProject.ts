'use client';

import { useCallback, useRef } from 'react';
import { useCanvasStore } from '@/app/store/canvas-store';
import { createProjectInDb } from '@/lib/services/canvas-sync';
import type { SSEMessage, ToolKey, StartProjectResponse } from '@/app/types/canvas';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8005';

const DEFAULT_TOOLS: ToolKey[] = [
  'sanctions', 'pep_check', 'adverse_media', 'geo_risk',
  'business_registry', 'ubo_lookup', 'court_records', 'property_records',
  'corporate_filings', 'employment_verify', 'education_verify',
  'phone_lookup', 'email_lookup', 'social_media', 'domain_whois',
  'ip_geolocation', 'crypto_trace'
];

export function useProject() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const {
    handleSSEMessage,
    setProcessing,
    setSSEConnected,
    setSSEError,
    addProject,
    setActiveProjectId,
  } = useCanvasStore();

  const startProject = useCallback(
    async (
      entityName: string,
      options?: {
        tools?: ToolKey[];
        useSandbox?: boolean;
        country?: string;
      }
    ) => {
      const tools = options?.tools || DEFAULT_TOOLS;
      const useSandbox = options?.useSandbox ?? true;
      const country = options?.country || '';
      const isCompany = /llc|inc|corp|ltd|gmbh|sa\b/i.test(entityName);

      setProcessing(true);
      setSSEError(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/projects/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_name: entityName,
            entity_type: isCompany ? 'company' : 'individual',
            country,
            tools,
            use_sandbox: useSandbox,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to start project: ${res.status}`);
        }

        const data: StartProjectResponse = await res.json();

        const dbCreated = await createProjectInDb({
          id: data.project_id,
          name: `Investigation: ${entityName}`,
          entityName,
          entityType: isCompany ? 'company' : 'individual',
          country,
          status: 'running',
        });

        if (!dbCreated) {
          throw new Error('Failed to create project in database');
        }

        addProject({
          id: data.project_id,
          name: `Investigation: ${entityName}`,
          entityCount: 0,
          status: 'running',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        setActiveProjectId(data.project_id);

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const eventSource = new EventSource(
          `${BACKEND_URL}/api/projects/${data.project_id}/stream`
        );
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setSSEConnected(true);
          setSSEError(null);
        };

        eventSource.onmessage = (event) => {
          console.log('[SSE] Raw data received:', event.data);
          try {
            const message: SSEMessage = JSON.parse(event.data);
            console.log('[SSE] Parsed message:', message);
            handleSSEMessage(message);

            if (message.type === 'project_complete') {
              console.log('[SSE] Project complete, closing connection');
              eventSource.close();
              eventSourceRef.current = null;
              setSSEConnected(false);
              setProcessing(false);
            }
          } catch (err) {
            console.error('Failed to parse SSE message:', event.data, err);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;
          setSSEConnected(false);
          setSSEError('Connection lost');
          setProcessing(false);
        };

        return data.project_id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setSSEError(message);
        setProcessing(false);
        return null;
      }
    },
    [handleSSEMessage, setProcessing, setSSEConnected, setSSEError, addProject, setActiveProjectId]
  );

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSSEConnected(false);
    setProcessing(false);
  }, [setSSEConnected, setProcessing]);

  return { startProject, disconnect };
}
