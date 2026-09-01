import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { Filter, Plus, Search, Layers, RefreshCw } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { 
    tasks, 
    projects, 
    members, 
    currentProject, 
    setCurrentProject,
    filter, 
    setFilter, 
    updateTaskStatus,
    refreshAll,
    loading 
  } = useWorkspace();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('todo');

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleDropTask = async (taskId: string, targetStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  const handleQuickAdd = (status: TaskStatus) => {
    setCreateStatus(status);
    setIsCreateOpen(true);
  };

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-950/35 backdrop-blur-xl p-2.5 rounded-xl border border-white/[0.08] shadow-lg">
        
        {/* Left: Project Selector & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={filter.projectId || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, projectId: e.target.value }))}
            className="text-xs font-mono text-zinc-300 bg-zinc-900/40 border border-white/[0.08] rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 backdrop-blur-md"
          >
            <option value="all">ALL PROJECTS ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-zinc-950 text-zinc-200">
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filter.priority || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as any }))}
            className="text-xs font-mono text-zinc-300 bg-zinc-900/40 border border-white/[0.08] rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 backdrop-blur-md"
          >
            <option value="all">ALL PRIORITIES</option>
            <option value="urgent" className="bg-zinc-950 text-zinc-200">URGENT</option>
            <option value="high" className="bg-zinc-950 text-zinc-200">HIGH</option>
            <option value="medium" className="bg-zinc-950 text-zinc-200">MEDIUM</option>
            <option value="low" className="bg-zinc-950 text-zinc-200">LOW</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filter.assigneeId || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, assigneeId: e.target.value }))}
            className="text-xs font-mono text-zinc-300 bg-zinc-900/40 border border-white/[0.08] rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 backdrop-blur-md"
          >
            <option value="all">ALL ASSIGNEES</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id} className="bg-zinc-950 text-zinc-200">
                {m.profile?.full_name || m.invited_email || 'Member'}
              </option>
            ))}
          </select>

          <button
            onClick={() => refreshAll()}
            title="Refresh board"
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Right: New Task CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreateStatus('todo');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-3 min-h-[480px] h-full items-start">
          <KanbanColumn
            status="todo"
            title="TO DO"
            tasks={todoTasks}
            onTaskClick={handleTaskClick}
            onDropTask={handleDropTask}
            onQuickAdd={handleQuickAdd}
            columnAccentColor="#71717A"
          />

          <KanbanColumn
            status="in_progress"
            title="IN PROGRESS"
            tasks={inProgressTasks}
            onTaskClick={handleTaskClick}
            onDropTask={handleDropTask}
            onQuickAdd={handleQuickAdd}
            columnAccentColor="#3B82F6"
          />

          <KanbanColumn
            status="review"
            title="IN REVIEW"
            tasks={reviewTasks}
            onTaskClick={handleTaskClick}
            onDropTask={handleDropTask}
            onQuickAdd={handleQuickAdd}
            columnAccentColor="#F59E0B"
          />

          <KanbanColumn
            status="done"
            title="COMPLETED"
            tasks={doneTasks}
            onTaskClick={handleTaskClick}
            onDropTask={handleDropTask}
            onQuickAdd={handleQuickAdd}
            columnAccentColor="#10B981"
          />
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultStatus={createStatus}
        defaultProjectId={currentProject?.id}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};
