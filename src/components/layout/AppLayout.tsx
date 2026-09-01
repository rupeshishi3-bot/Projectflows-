import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Sidebar, NavView } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from '../dashboard/DashboardView';
import { KanbanBoard } from '../kanban/KanbanBoard';
import { TaskList } from '../tasks/TaskList';
import { ProjectListView } from '../projects/ProjectListView';
import { MembersView } from '../members/MembersView';
import { ActivityView } from '../activity/ActivityView';
import { ProjectFlowsGuide } from '../showcase/ProjectFlowsGuide';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { CreateWorkspaceModal } from '../settings/CreateWorkspaceModal';
import { WorkspaceSettingsModal } from '../settings/WorkspaceSettingsModal';
import { ProfileModal } from '../settings/ProfileModal';
import { SupabaseConfigModal } from '../auth/SupabaseConfigModal';
import { AuthModal } from '../auth/AuthModal';
import { Luxury3DCanvas } from '../common/Luxury3DCanvas';
import { Sparkles, Database, Shield, Lock, Layers } from 'lucide-react';
import luxuryBackdropImg from '../../assets/images/luxury_dark_backdrop_1788281085873.jpg';

export const AppLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentWorkspace, loading: wsLoading } = useWorkspace();

  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090b] text-zinc-100 font-mono bg-luxury-grid relative overflow-hidden">
        <img 
          src={luxuryBackdropImg} 
          alt="Luxury Backdrop" 
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 shadow-lg shadow-blue-500/20" />
          <p className="text-xs text-zinc-400">Loading ProjectFlows...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show welcoming luxury showcase with interactive FAQ, How It Works, and Architecture
  if (!user) {
    return (
      <div className="min-h-screen bg-[#06080d] text-zinc-100 flex flex-col justify-between relative overflow-x-hidden font-sans">
        
        {/* Luxury Background Static Image Layer */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <img 
            src={luxuryBackdropImg} 
            alt="Luxury Abstract Dark Backdrop" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-10 scale-105"
          />
          <div className="absolute inset-0 bg-radial from-transparent via-[#06080d]/20 to-[#06080d]/50" />
        </div>

        {/* Real Three.js 3D Moving Luxury Canvas */}
        <Luxury3DCanvas intensity={1.4} interactive={true} />

        {/* Luxury Top Navigation Header */}
        <header className="px-5 sm:px-8 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-zinc-950/40 backdrop-blur-xl sticky top-0 z-40 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center font-mono font-bold text-xs text-white shadow-md border border-blue-400/40">
              PF
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              ProjectFlows <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded">SUITE</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSupabaseConfigOpen(true)}
              className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded border border-white/[0.1] bg-zinc-900/40 hover:bg-zinc-800/60 transition-all font-mono flex items-center gap-1.5 backdrop-blur-md shadow-xs"
            >
              <Database className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">PostgreSQL / Supabase</span>
              <span className="sm:hidden">SQL</span>
            </button>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white px-4 py-1.5 rounded transition-all shadow-lg shadow-blue-500/25 font-mono border border-blue-400/30"
            >
              Sign In / Register
            </button>
          </div>
        </header>

        {/* Showcase Body (How it works, FAQ, features, architecture) */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 relative z-10 w-full">
          <ProjectFlowsGuide
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
            isInsideApp={false}
          />
        </main>

        <footer className="px-5 py-4 border-t border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl text-center text-xs text-zinc-500 font-mono relative z-10">
          ProjectFlows Enterprise SaaS • High-Density Project Management System
        </footer>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />

        <SupabaseConfigModal
          isOpen={isSupabaseConfigOpen}
          onClose={() => setIsSupabaseConfigOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#06080d] overflow-hidden font-sans text-zinc-100 antialiased relative">
      
      {/* Luxury Static Base */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={luxuryBackdropImg} 
          alt="Luxury Abstract Dark Backdrop" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* 3D Moving Luxury Canvas */}
      <Luxury3DCanvas intensity={1.0} interactive={true} />

      {/* Ambient background glow for high-density app shell */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0 relative z-20">
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            <Sidebar
              currentView={currentView}
              onSelectView={setCurrentView}
              onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        
        {/* Header */}
        <Header
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenWorkspaceSettings={() => setIsWorkspaceSettingsOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* View Router / Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 bg-transparent">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && (
              <DashboardView
                onNavigateToBoard={() => setCurrentView('kanban')}
                onNavigateToProjects={() => setCurrentView('projects')}
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
              />
            )}

            {currentView === 'kanban' && <KanbanBoard />}

            {currentView === 'list' && <TaskList />}

            {currentView === 'projects' && (
              <ProjectListView
                onSelectProjectForBoard={(projectId) => {
                  setCurrentView('kanban');
                }}
              />
            )}

            {currentView === 'members' && <MembersView />}

            {currentView === 'activity' && <ActivityView />}

            {currentView === 'guide' && (
              <ProjectFlowsGuide
                isInsideApp={true}
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                onNavigateToBoard={() => setCurrentView('kanban')}
                onNavigateToDashboard={() => setCurrentView('dashboard')}
                onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />

      <WorkspaceSettingsModal
        isOpen={isWorkspaceSettingsOpen}
        onClose={() => setIsWorkspaceSettingsOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
      />
    </div>
  );
};

