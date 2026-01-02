'use client';

import { useEffect } from 'react';
import { Shield, FolderOpen, Plus, Settings, Bell, PanelLeftClose, PanelLeft, Pencil, Loader2 } from 'lucide-react';
import { useCanvasStore } from '@/app/store/canvas-store';

export function LeftPanel() {
  const {
    projects,
    activeProjectId,
    sidebarCollapsed,
    isProcessing,
    toggleSidebar,
    fetchProjects,
    loadProject,
    setActiveProjectId,
  } = useCanvasStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectClick = async (projectId: string) => {
    if (projectId === activeProjectId) return;
    setActiveProjectId(projectId);
    await loadProject(projectId);
  };

  return (
    <div
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative shadow-sm group/sidebar ${
        sidebarCollapsed ? 'w-18' : 'w-72'
      }`}
    >
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-4 relative">
          {sidebarCollapsed ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 transition-opacity group-hover/sidebar:opacity-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={toggleSidebar}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all opacity-0 group-hover/sidebar:opacity-100"
                title="Expand sidebar"
              >
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h1 className="text-sm font-semibold text-slate-900">Scolo</h1>
                <p className="text-xs text-slate-500">Discovery Platform</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all opacity-0 group-hover/sidebar:opacity-100 flex-shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeft className="w-4 h-4 text-slate-500" />
              </button>
            </>
          )}
        </div>

        {!sidebarCollapsed && (
          <button className="group w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] font-medium">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
        {sidebarCollapsed && (
          <button className="group w-full p-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2">
          {!sidebarCollapsed && (
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4 px-2 font-medium">Projects</div>
          )}
          <div className="space-y-1">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {sidebarCollapsed ? '' : 'No projects yet'}
              </div>
            ) : (
              projects.map((project) => {
                const isActive = project.id === activeProjectId;
                const isRunning = project.status === 'running';
                return (
                  <div
                    key={project.id}
                    className={`w-full rounded-xl transition-all group relative ${
                      isActive
                        ? 'bg-cyan-50 border border-cyan-200 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-full p-3 flex items-center gap-3">
                      <button
                        onClick={() => handleProjectClick(project.id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center gap-2 text-left disabled:opacity-50"
                        title={sidebarCollapsed ? project.name : undefined}
                      >
                        {sidebarCollapsed ? (
                          <div className="flex items-center justify-center w-full">
                            {isRunning ? (
                              <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                            ) : (
                              <FolderOpen
                                className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`}
                              />
                            )}
                          </div>
                        ) : (
                          <>
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isActive ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-slate-100'
                              }`}
                            >
                              {isRunning ? (
                                <Loader2 className={`w-3.5 h-3.5 animate-spin ${isActive ? 'text-white' : 'text-cyan-500'}`} />
                              ) : (
                                <FolderOpen
                                  className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`}
                                />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div
                                className={`text-sm font-medium leading-snug truncate ${
                                  isActive ? 'text-slate-900' : 'text-slate-600'
                                }`}
                              >
                                {project.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {isRunning ? 'Running...' : project.status}
                              </div>
                            </div>
                          </>
                        )}
                      </button>
                      {!sidebarCollapsed && isActive && (
                        <button
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cyan-100 transition-all"
                          onClick={(e) => e.stopPropagation()}
                          title="Edit project"
                        >
                          <Pencil className="w-3 h-3 text-cyan-600" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="space-y-1">
          <button
            className="w-full p-2.5 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-all group"
            title={sidebarCollapsed ? 'Notifications' : undefined}
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Notifications</span>
            )}
          </button>
          <button
            className="w-full p-2.5 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-all group"
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
            {!sidebarCollapsed && <span className="text-sm text-slate-600 group-hover:text-slate-900">Settings</span>}
          </button>

          <div className="pt-2 mt-2 border-t border-slate-100">
            <div className={`flex items-center gap-3 p-3 bg-slate-50 rounded-xl ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-lg shadow-cyan-500/20">
                JA
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium text-slate-900 truncate">John Anderson</div>
                  <div className="text-xs text-slate-500">Analyst</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
