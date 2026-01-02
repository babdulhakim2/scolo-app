'use client';

import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Panel } from '@xyflow/react';
import { Send, Sparkles, LayoutGrid, Command } from 'lucide-react';
import { useCanvasStore } from '@/app/store/canvas-store';
import { useProject } from '@/app/hooks/useProject';
import { StatusBar } from './StatusBar';

const SUGGESTIONS = [
  'Investigate Global Ventures LLC',
  'Check Vladimir Putin',
  'Screen Acme Corp for sanctions',
  'Analyze TechStart Inc',
];

export function CommandBar() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isProcessing, sseError, statusInfo, autoOrganize } = useCanvasStore();
  const { startProject } = useProject();

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      const entityName = extractEntityName(input.trim());
      startProject(entityName, { useSandbox: true });
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Panel position="bottom-center" className="mb-6">
      <div className="flex flex-col items-center">
        {isFocused && !isProcessing && (
          <div className="absolute bottom-full mb-2 w-[500px] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Suggestions</span>
            </div>
            <div className="py-1">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInput(suggestion);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mb-3">
            <StatusBar status={statusInfo} isProcessing={isProcessing} />
          </div>
        )}

        {sseError && (
          <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-red-600 text-xs">{sseError}</span>
          </div>
        )}

        <div
          className={`relative bg-white/95 backdrop-blur-sm border rounded-xl shadow-lg transition-all duration-200 w-[500px] z-10 ${
            isFocused ? 'border-cyan-400 shadow-cyan-500/10' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 p-2.5">
            <Sparkles className={`w-4 h-4 ml-1 transition-colors ${isFocused ? 'text-cyan-500' : 'text-slate-400'}`} />

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter entity name to investigate..."
              disabled={isProcessing}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 py-1 text-sm disabled:opacity-50"
            />

            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-500">
                <Command className="w-2.5 h-2.5" />K
              </kbd>

              <button
                onClick={autoOrganize}
                title="Auto-organize"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className={`p-2 rounded-lg flex items-center transition-all ${
                  input.trim() && !isProcessing
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function extractEntityName(msg: string): string {
  const cleaned = msg
    .replace(/^(investigate|check|screen|analyze|run.*on)\s+/i, '')
    .replace(/\s+(for sanctions|for compliance|for risk)$/i, '')
    .trim();
  return cleaned || msg;
}
