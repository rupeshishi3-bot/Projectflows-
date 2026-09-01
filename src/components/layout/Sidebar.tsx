import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  ListTodo, 
  FolderKanban, 
  Users, 
  Activity, 
  Plus, 
  ChevronDown, 
  Building2, 
  Check, 
  Sparkles,
  Layers,
  Settings,
  Database
} from 'lucide-react';

export type NavView = 'dashboard' | 'kanban' | 'list' | 'projects' | 'members' | 'activity' | 'guide';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenCreateWorkspace: () => void;
  onOpenCreateProject: () => void;
  onOpenSupabaseConfig: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenCreateWorkspace,
  onOpenCreateProject,
  onOpenSupabaseConfig,
  onCloseMobile,
}) => {
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    projects, 
    currentProject, 
    setCurrentProject,
    setFilter 
  } = useWorkspace();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban' as NavView, label: 'Kanban Board', icon: KanbanSquare },
    { id: 'list' as NavView, label: 'List View', icon: ListTodo },
    { id: 'projects' as NavView, label: 'Projects', icon: FolderKanban },
    { id: 'members' as NavView, label: 'Team Members', icon: Users },
    { id: 'activity' as NavView, label: 'Activity Feed', icon: Activity },
    { id: 'guide' as NavView, label: 'Platform & Solutions', icon: Sparkles },
  ];

  const handleSelectNav = (view: NavView) => {
    onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectProjectFilter = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId) || null;
    setCurrentProject(proj);
    setFilter(prev => ({ ...prev, projectId }));
    onSelectView('kanban');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-56 bg-zinc-950/40 backdrop-blur-2xl text-zinc-300 flex flex-col h-full shrink-0 select-none border-r border-white/[0.08]">
      
      {/* Brand / Logo */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-indigo-650 flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs border border-blue-450/40">
            PF
          </div>
          <span className="font-bold text-white text-xs tracking-tight font-sans">
            ProjectFlows <span className="text-blue-400 text-[10px] font-mono">PRO</span>
          </span>
        </div>
        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-900/60 text-zinc-400 border border-white/[0.08]">
          v2.0
        </span>
      </div>

      {/* Workspace Switcher */}
      <div className="p-2.5 border-b border-white/[0.08] relative">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full p-1.5 rounded bg-zinc-900/30 hover:bg-zinc-850/50 text-left flex items-center justify-between border border-white/[0.08] transition-colors backdrop-blur-md"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
              {currentWorkspace?.name.charAt(0).toUpperCase() || 'W'}
            </div>
            <span className="text-xs font-medium text-zinc-200 truncate">
              {currentWorkspace?.name || 'Workspace'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        </button>

        {/* Workspace Dropdown */}
        {showWorkspaceMenu && (
          <div className="absolute top-full left-2.5 right-2.5 mt-1 bg-zinc-950/90 backdrop-blur-xl rounded-md shadow-2xl border border-white/[0.1] py-1 z-50">
            <div className="px-2.5 py-1 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Workspaces
            </div>

            <div className="max-h-48 overflow-y-auto py-0.5">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setShowWorkspaceMenu(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-zinc-800 flex items-center justify-between transition-colors"
                >
                  <span className={`truncate ${currentWorkspace?.id === ws.id ? 'text-blue-400 font-semibold' : 'text-zinc-300'}`}>
                    {ws.name}
                  </span>
                  {currentWorkspace?.id === ws.id && <Check className="w-3 h-3 text-blue-400" />}
                </button>
              ))}
            </div>

            <div className="pt-1 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  onOpenCreateWorkspace();
                }}
                className="w-full px-2.5 py-1.5 text-xs text-blue-400 hover:bg-zinc-800 flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>New Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Views Navigation */}
      <div className="px-2 py-3 space-y-0.5">
        <span className="px-2 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
          NAVIGATION
        </span>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectNav(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Projects List Shortcuts */}
      <div className="px-2 py-2 border-t border-zinc-800/80 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            PROJECTS ({projects.length})
          </span>
          <button
            onClick={onOpenCreateProject}
            className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Create Project"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          <button
            onClick={() => handleSelectProjectFilter('all')}
            className={`w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors ${
              !currentProject ? 'text-blue-400 font-semibold bg-zinc-900 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="truncate">All Projects</span>
          </button>

          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => handleSelectProjectFilter(proj.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors ${
                currentProject?.id === proj.id ? 'text-blue-400 font-semibold bg-zinc-900 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: proj.color || '#3B82F6' }}
              />
              <span className="truncate">{proj.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Database connection footer */}
      <div className="p-2 border-t border-zinc-800 bg-zinc-950">
        <button
          onClick={onOpenSupabaseConfig}
          className="w-full flex items-center justify-between p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-blue-400" />
            <span className="font-mono">Supabase / SQL</span>
          </div>
          <span className="text-[9px] text-blue-400 font-mono font-semibold">LINKED</span>
        </button>
      </div>

    </aside>
  );
};
