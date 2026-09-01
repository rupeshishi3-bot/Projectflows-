import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Avatar } from '../common/Avatar';
import { 
  Bell, 
  Search, 
  Plus, 
  Database, 
  Check, 
  LogOut, 
  User, 
  Settings, 
  Layers, 
  ExternalLink,
  Sparkles,
  Menu,
  ChevronDown
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenProfile: () => void;
  onOpenWorkspaceSettings: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateTask,
  onOpenSupabaseConfig,
  onOpenProfile,
  onOpenWorkspaceSettings,
  onToggleMobileSidebar,
}) => {
  const { user, profile, signOut } = useAuth();
  const { 
    currentWorkspace, 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    globalSearchQuery,
    setGlobalSearchQuery 
  } = useWorkspace();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isConnected = isSupabaseConfigured();

  return (
    <header className="h-12 bg-zinc-950/40 backdrop-blur-2xl border-b border-white/[0.08] px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
      
      {/* Left: Mobile Sidebar Trigger & Global Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={e => setGlobalSearchQuery(e.target.value)}
            placeholder="Search tasks, tags, assignees..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-zinc-900/30 border border-white/[0.08] rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-zinc-200 transition-all placeholder:text-zinc-500 font-mono backdrop-blur-md"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        
        {/* Supabase Connection Status Pill */}
        <button
          onClick={onOpenSupabaseConfig}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded border transition-all ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
          }`}
          title="Supabase PostgreSQL Connection Settings"
        >
          <Database className="w-3 h-3" />
          <span>{isConnected ? 'SUPABASE: LIVE' : 'SQL: LOCAL ENGINE'}</span>
        </button>

        {/* Quick Add Task CTA */}
        <button
          onClick={onOpenCreateTask}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-zinc-950">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-88 bg-zinc-900 rounded-md shadow-2xl border border-zinc-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-950/60">
                <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[10px] text-blue-400 hover:underline font-mono"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-zinc-500 font-mono">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 text-xs hover:bg-zinc-800/60 transition-colors cursor-pointer flex items-start gap-2 ${
                        !n.is_read ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 font-medium text-xs truncate">{n.title}</p>
                        <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-zinc-500 font-mono mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <Avatar
              name={profile?.full_name || user?.email || 'User'}
              src={profile?.avatar_url}
              size="xs"
            />
            <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-zinc-900 rounded-md shadow-2xl border border-zinc-800 py-1 z-50">
              <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-950/40">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {profile?.full_name || 'User Account'}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-1 text-xs text-zinc-300">
                <button
                  onClick={() => { setShowUserMenu(false); onOpenProfile(); }}
                  className="w-full px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-left"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenWorkspaceSettings(); }}
                  className="w-full px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Workspace Settings</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenSupabaseConfig(); }}
                  className="w-full px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-left text-blue-400 font-medium"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>PostgreSQL / Supabase</span>
                </button>
              </div>

              <div className="pt-1 border-t border-zinc-800">
                <button
                  onClick={() => { setShowUserMenu(false); signOut(); }}
                  className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
