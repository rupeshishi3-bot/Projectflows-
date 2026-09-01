import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { statsService } from '../../services/statsService';
import { DashboardStats, Task } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import luxuryObsidianBannerImg from '../../assets/images/luxury_obsidian_banner_1788281119371.jpg';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  TrendingUp, 
  Activity as ActivityIcon,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToBoard: () => void;
  onNavigateToProjects: () => void;
  onOpenCreateTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToBoard,
  onNavigateToProjects,
  onOpenCreateTask,
}) => {
  const { currentWorkspace, tasks, projects, activities, loading: wsLoading } = useWorkspace();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentWorkspace && user) {
      setLoading(true);
      statsService.getDashboardStats(currentWorkspace.id, user.id)
        .then(data => setStats(data))
        .catch(err => console.error('Failed to load stats:', err))
        .finally(() => setLoading(false));
    }
  }, [currentWorkspace, user, tasks, projects]);

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Please select or create a workspace to view the dashboard.
      </div>
    );
  }

  const urgentTasks = tasks
    .filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done')
    .slice(0, 5);

  const assignedToMe = tasks
    .filter(t => t.assignee_id === user?.id && t.status !== 'done')
    .slice(0, 5);

  return (
    <div className="space-y-4">
      
      {/* Top Luxury Banner */}
      <div className="relative border border-white/[0.12] rounded-xl p-5 text-zinc-100 overflow-hidden shadow-2xl bg-zinc-950/30 backdrop-blur-2xl luxury-card-highlight">
        <img
          src={luxuryObsidianBannerImg}
          alt="Luxury Abstract Architecture"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-15 mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-zinc-950/25 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[10px] font-mono border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-blue-400" /> WORKSPACE OVERVIEW
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
              {currentWorkspace.name}
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              {currentWorkspace.description || 'Sprint cycles, high-velocity backlog management, and team delivery telemetry.'}
            </p>
          </div>

          {/* Quick action buttons in banner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono text-xs">
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 border border-blue-400/30"
            >
              <Plus className="w-3.5 h-3.5" /> Quick Add Task
            </button>
            <button
              onClick={onNavigateToBoard}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 rounded-lg font-medium border border-white/[0.08] transition-all backdrop-blur-md"
            >
              Kanban Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Projects */}
        <div 
          onClick={onNavigateToProjects}
          className="bg-zinc-950/35 backdrop-blur-xl p-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-zinc-900/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">PROJECTS</span>
            <div className="p-1.5 rounded bg-zinc-900/50 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-white/[0.06]">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {stats?.totalProjects ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {stats?.activeProjects ?? 0} active pipelines
          </p>
        </div>

        {/* Total Tasks */}
        <div 
          onClick={onNavigateToBoard}
          className="bg-zinc-950/35 backdrop-blur-xl p-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-zinc-900/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">TASKS</span>
            <div className="p-1.5 rounded bg-zinc-900/50 text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors border border-white/[0.06]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {stats?.totalTasks ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {stats?.completedTasks ?? 0} done ({stats?.completionRate ?? 0}%)
          </p>
        </div>

        {/* Tasks Assigned To You */}
        <div 
          onClick={onNavigateToBoard}
          className="bg-zinc-950/35 backdrop-blur-xl p-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-zinc-900/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">ASSIGNED TO ME</span>
            <div className="p-1.5 rounded bg-zinc-900/50 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-white/[0.06]">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {stats?.assignedToUserCount ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Personal backlog
          </p>
        </div>

        {/* Due Soon / Urgent */}
        <div 
          onClick={onNavigateToBoard}
          className="bg-zinc-950/35 backdrop-blur-xl p-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-zinc-900/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">DUE SOON</span>
            <div className="p-1.5 rounded bg-zinc-900/50 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors border border-white/[0.06]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {stats?.dueSoonTasks ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Next 72 hours
          </p>
        </div>

      </div>

      {/* Progress & Priority Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Status Distribution (Left 2 cols) */}
        <div className="md:col-span-2 bg-zinc-950/35 backdrop-blur-xl p-4 rounded-xl border border-white/[0.08] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              STATUS PIPELINE DISTRIBUTION
            </h3>
            <span className="text-[11px] font-mono text-blue-400">
              {stats?.completionRate ?? 0}% COMPLETED
            </span>
          </div>

          {/* Combined Progress Bar */}
          <div className="w-full h-2 bg-zinc-900/80 rounded-full overflow-hidden flex">
            <div 
              title={`Done: ${stats?.completedTasks ?? 0}`} 
              style={{ width: `${stats?.totalTasks ? ((stats.completedTasks / stats.totalTasks) * 100) : 0}%` }}
              className="bg-emerald-500 h-full transition-all"
            />
            <div 
              title={`Review: ${stats?.reviewTasks ?? 0}`} 
              style={{ width: `${stats?.totalTasks ? ((stats.reviewTasks / stats.totalTasks) * 100) : 0}%` }}
              className="bg-amber-500 h-full transition-all"
            />
            <div 
              title={`In Progress: ${stats?.inProgressTasks ?? 0}`} 
              style={{ width: `${stats?.totalTasks ? ((stats.inProgressTasks / stats.totalTasks) * 100) : 0}%` }}
              className="bg-blue-500 h-full transition-all"
            />
            <div 
              title={`To Do: ${stats?.todoTasks ?? 0}`} 
              style={{ width: `${stats?.totalTasks ? ((stats.todoTasks / stats.totalTasks) * 100) : 0}%` }}
              className="bg-zinc-600 h-full transition-all"
            />
          </div>

          {/* Status Metric Breakdown Cards */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-zinc-950/40 border border-white/[0.06] text-center backdrop-blur-md">
              <span className="text-[10px] font-mono text-zinc-400 block">TO DO</span>
              <span className="text-sm font-bold font-mono text-zinc-300">{stats?.todoTasks ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950/40 border border-white/[0.06] text-center backdrop-blur-md">
              <span className="text-[10px] font-mono text-blue-400 block">IN PROGRESS</span>
              <span className="text-sm font-bold font-mono text-blue-300">{stats?.inProgressTasks ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950/40 border border-white/[0.06] text-center backdrop-blur-md">
              <span className="text-[10px] font-mono text-amber-400 block">IN REVIEW</span>
              <span className="text-sm font-bold font-mono text-amber-300">{stats?.reviewTasks ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950/40 border border-white/[0.06] text-center backdrop-blur-md">
              <span className="text-[10px] font-mono text-emerald-400 block">DONE</span>
              <span className="text-sm font-bold font-mono text-emerald-300">{stats?.completedTasks ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution (Right 1 col) */}
        <div className="bg-zinc-950/35 backdrop-blur-xl p-4 rounded-xl border border-white/[0.08] space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            PRIORITY MATRIX
          </h3>

          <div className="space-y-2 pt-0.5 text-xs font-mono">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/40 border border-white/[0.06] backdrop-blur-md">
              <span className="text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Urgent
              </span>
              <span className="font-bold text-zinc-200">{stats?.priorityDistribution.urgent ?? 0}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/40 border border-white/[0.06] backdrop-blur-md">
              <span className="text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> High
              </span>
              <span className="font-bold text-zinc-200">{stats?.priorityDistribution.high ?? 0}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/40 border border-white/[0.06] backdrop-blur-md">
              <span className="text-sky-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Medium
              </span>
              <span className="font-bold text-zinc-200">{stats?.priorityDistribution.medium ?? 0}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/40 border border-white/[0.06] backdrop-blur-md">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> Low
              </span>
              <span className="font-bold text-zinc-200">{stats?.priorityDistribution.low ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent & Assigned Tasks vs Recent Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Left: Urgent Tasks & My Tasks */}
        <div className="bg-zinc-950/35 backdrop-blur-xl p-4 rounded-xl border border-white/[0.08] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 font-mono">
              HIGH PRIORITY TASKS
            </h3>
            <button
              onClick={onNavigateToBoard}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
            >
              View Board <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {urgentTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-4 text-center">
                No urgent tasks pending.
              </p>
            ) : (
              urgentTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-2 bg-zinc-950/40 hover:bg-zinc-900/60 rounded-lg border border-white/[0.06] flex items-center justify-between cursor-pointer transition-colors backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PriorityBadge priority={task.priority} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {task.title}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {task.project?.name || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Real-time Activity Feed */}
        <div className="bg-zinc-950/35 backdrop-blur-xl p-4 rounded-xl border border-white/[0.08] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
              <ActivityIcon className="w-3.5 h-3.5 text-blue-400" />
              AUDIT TRAIL / ACTIVITY
            </h3>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-4 text-center">
                No activity recorded yet in this workspace.
              </p>
            ) : (
              activities.slice(0, 8).map(act => (
                <div key={act.id} className="flex items-start gap-2 text-xs p-1.5 rounded-lg hover:bg-white/[0.02]">
                  <Avatar name={act.user?.full_name || act.user?.email || 'System'} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 leading-snug">
                      <span className="font-semibold text-zinc-200">
                        {act.user?.full_name || act.user?.email?.split('@')[0] || 'Member'}
                      </span>{' '}
                      {act.action.replace('_', ' ')}{' '}
                      <span className="font-mono text-blue-400">
                        {act.details?.task_title || act.details?.project_name || act.details?.workspace_name || ''}
                      </span>
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Task detail modal if tapped from dashboard */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};
