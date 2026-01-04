'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  FolderOpen,
  Plus,
  Settings,
  Bell,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  LogOut,
} from 'lucide-react';
import { useCanvasStore, type Project } from '@/app/store/canvas-store';
import { createClient } from '@/lib/supabase/client';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';

interface LeftPanelProps {
  initialUser?: { id: string; email: string } | null;
  initialProjects?: Project[];
}

export function LeftPanel({ initialUser, initialProjects }: LeftPanelProps) {
  const router = useRouter();
  const {
    projects: storeProjects,
    activeProjectId,
    sidebarCollapsed,
    isProcessing,
    toggleSidebar,
    fetchProjects,
    setActiveProjectId,
    addProject,
    setNodes,
    setEdges,
  } = useCanvasStore();

  const projects = storeProjects.length > 0 ? storeProjects : (initialProjects ?? []);

  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState<{ email?: string; id: string } | null>(initialUser || null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUser({ email: user.email, id: user.id });
        }
      });
    }
  }, [initialUser, supabase.auth]);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectClick = useCallback((projectId: string) => {
    if (projectId === activeProjectId || isProcessing) return;
    router.push(`/projects/${projectId}`);
  }, [activeProjectId, isProcessing, router]);

  const handleCreateProject = async () => {
    const name = newProjectName.trim() || 'Untitled Project';
    setIsCreating(false);
    setNewProjectName('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          entityName: name,
          entityType: 'company',
          status: 'pending',
        }),
      });

      if (res.ok) {
        const project = await res.json();
        addProject({
          id: project.id,
          name: project.name,
          entityCount: 0,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        router.push(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleRename = async (projectId: string) => {
    const name = editName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      await fetchProjects();
    } catch (error) {
      console.error('Failed to rename project:', error);
    }

    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (projectId: string) => {
    setIsDeleting(true);
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      await fetchProjects();
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        setNodes([]);
        setEdges([]);
        router.push('/projects/new');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalId(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuId(projectId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const getUserInitials = () => {
    if (!user?.email) return '??';
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div
        className={`bg-black/30 backdrop-blur-md border-r border-white/10 flex flex-col transition-all duration-300 relative shadow-2xl group/sidebar ${
          sidebarCollapsed ? 'w-18' : 'w-72'
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-4 relative">
            {sidebarCollapsed ? (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 transition-opacity group-hover/sidebar:opacity-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={toggleSidebar}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/40 transition-all opacity-0 group-hover/sidebar:opacity-100"
                  title="Expand sidebar"
                >
                  <PanelLeftClose className="w-4 h-4 text-white/60" />
                </button>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h1 className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">Scolo</h1>
                  <p className="text-xs text-white/60">Discovery Platform</p>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/40 transition-all opacity-0 group-hover/sidebar:opacity-100 flex-shrink-0"
                  title="Collapse sidebar"
                >
                  <PanelLeft className="w-4 h-4 text-white/60" />
                </button>
              </>
            )}
          </div>

          {!sidebarCollapsed && (
            <button
              onClick={() => setIsCreating(true)}
              className="group w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
          {sidebarCollapsed && (
            <button
              onClick={() => {
                toggleSidebar();
                setTimeout(() => setIsCreating(true), 300);
              }}
              className="group w-full p-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-2">
            {!sidebarCollapsed && (
              <div className="text-xs text-white/40 uppercase tracking-wider mb-4 px-2 font-medium">Projects</div>
            )}
            <div className="space-y-1">
              {isCreating && !sidebarCollapsed && (
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateProject();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewProjectName('');
                      }
                    }}
                    onBlur={handleCreateProject}
                    placeholder="Project name..."
                    className="w-full px-2 py-1.5 text-sm bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-white/30"
                  />
                </div>
              )}

              {projects.length === 0 && !isCreating ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  {sidebarCollapsed ? '' : 'No projects yet'}
                </div>
              ) : (
                projects.map((project) => {
                  const isActive = project.id === activeProjectId;
                  const isRunning = project.status === 'running';
                  const isEditing = editingId === project.id;

                  return (
                    <div
                      key={project.id}
                      onContextMenu={(e) => handleContextMenu(e, project.id)}
                      className={`w-full rounded-xl transition-all group relative ${
                        isActive
                          ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                          : 'hover:bg-black/20 border border-transparent'
                      }`}
                    >
                      <div className="w-full p-3 flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(project.id);
                                if (e.key === 'Escape') {
                                  setEditingId(null);
                                  setEditName('');
                                }
                              }}
                              className="flex-1 px-2 py-1 text-sm bg-black/20 border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                            />
                            <button
                              onClick={() => handleRename(project.id)}
                              className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditName('');
                              }}
                              className="p-1 text-white/40 hover:bg-black/30 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleProjectClick(project.id)}
                              disabled={isProcessing}
                              className="flex-1 min-w-0 flex items-center gap-2 text-left disabled:opacity-50"
                              title={sidebarCollapsed ? project.name : undefined}
                            >
                              {sidebarCollapsed ? (
                                <div className="flex items-center justify-center w-full">
                                  <FolderOpen
                                    className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-white/40'} ${isRunning ? 'animate-pulse' : ''}`}
                                  />
                                </div>
                              ) : (
                                <>
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isActive ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-black/40'
                                    }`}
                                  >
                                    <FolderOpen
                                      className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'} ${isRunning ? 'animate-pulse' : ''}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <div
                                      className={`text-sm font-medium leading-snug truncate ${
                                        isActive ? 'text-white' : 'text-white/80'
                                      }`}
                                    >
                                      {project.name}
                                    </div>
                                    <div className="text-xs text-white/40 truncate">
                                      {isRunning ? 'Running...' : project.status}
                                    </div>
                                  </div>
                                </>
                              )}
                            </button>
                            {!sidebarCollapsed && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenuPos({ x: e.clientX, y: e.clientY });
                                  setContextMenuId(project.id);
                                }}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/50 transition-all"
                              >
                                <MoreVertical className="w-4 h-4 text-white/40" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="space-y-1">
            <button
              className="w-full p-2.5 hover:bg-black/30 rounded-xl flex items-center gap-2.5 transition-all group"
              title={sidebarCollapsed ? 'Notifications' : undefined}
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-sm text-white/60 group-hover:text-white">Notifications</span>
              )}
            </button>
            <button
              className="w-full p-2.5 hover:bg-black/30 rounded-xl flex items-center gap-2.5 transition-all group"
              title={sidebarCollapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
              {!sidebarCollapsed && <span className="text-sm text-white/60 group-hover:text-white">Settings</span>}
            </button>

            <div className="pt-2 mt-2 border-t border-white/10">
              <div className={`flex items-center gap-3 p-3 bg-black/30 rounded-xl ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  {getUserInitials()}
                </div>
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-white truncate">{user?.email || ''}</div>
                      <div className="text-xs text-white/60">Analyst</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 hover:bg-black/40 rounded-lg transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4 text-white/50" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {contextMenuId && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-50 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg py-1 min-w-[140px]"
        >
          <button
            onClick={() => {
              const project = projects.find((p) => p.id === contextMenuId);
              if (project) {
                setEditName(project.name);
                setEditingId(contextMenuId);
              }
              setContextMenuId(null);
            }}
            className="w-full px-3 py-2 text-sm text-left text-white hover:bg-black/40 flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={() => {
              setDeleteModalId(contextMenuId);
              setContextMenuId(null);
            }}
            className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={() => deleteModalId && handleDelete(deleteModalId)}
        title="Delete Project"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="font-medium text-white">
              {projects.find(p => p.id === deleteModalId)?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
