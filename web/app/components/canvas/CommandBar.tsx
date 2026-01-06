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
          <div className="absolute bottom-full mb-2 w-[500px] bg-black/30 backdrop-blur-md border-2 border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 grain">
            <div className="px-3 py-2 border-b-2 border-white/10">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Suggestions</span>
            </div>
            <div className="py-1">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInput(suggestion);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-black/40 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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
          <div className="mb-3 px-4 py-2 bg-red-500/10 border-2 border-red-500/20">
            <span className="text-red-400 text-xs">{sseError}</span>
          </div>
        )}

        <div
          className={`relative bg-black/30 backdrop-blur-md border-2 shadow-2xl transition-all duration-200 w-[500px] z-10 grain ${
            isFocused ? 'border-cyan-400/50 shadow-cyan-500/20' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 p-2.5">
            <Sparkles className={`w-4 h-4 ml-1 transition-colors ${isFocused ? 'text-cyan-400' : 'text-white/40'}`} />

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
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 py-1 text-sm disabled:opacity-50"
            />

            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-black/30 border border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
                <Command className="w-2.5 h-2.5" />K
              </kbd>

              <button
                onClick={autoOrganize}
                title="Auto-organize"
                className="p-2 bg-black/20 hover:bg-black/30 text-white/50 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className={`p-2 flex items-center transition-all border ${
                  input.trim() && !isProcessing
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 border-cyan-400/30'
                    : 'bg-black/20 text-white/30 cursor-not-allowed border-white/5'
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
