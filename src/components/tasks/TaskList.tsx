import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Task, TaskStatus } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { EmptyState } from '../common/EmptyState';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Filter, 
  Plus, 
  Search, 
  CheckSquare, 
  MessageSquare,
  Clock,
  ArrowUpDown
} from 'lucide-react';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    projects, 
    members, 
    filter, 
    setFilter, 
    updateTaskStatus,
    globalSearchQuery,
    setGlobalSearchQuery,
    loading 
  } = useWorkspace();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const handleToggleTaskDone = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTaskStatus(task.id, newStatus);
  };

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      const diff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      return sortAsc ? diff : -diff;
    }
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortAsc ? diff : -diff;
    }
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortAsc ? diff : -diff;
  });

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={e => setGlobalSearchQuery(e.target.value)}
              placeholder="Filter tasks by name or description..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200 placeholder:text-zinc-500 font-mono"
            />
          </div>

          {/* New Task Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800 text-xs font-mono">
          <span className="text-zinc-400 font-semibold flex items-center gap-1 text-[10px]">
            <Filter className="w-3 h-3 text-zinc-400" /> FILTERS:
          </span>

          {/* Project */}
          <select
            value={filter.projectId || 'all'}
            onChange={e => setFilter(prev => ({ ...prev, projectId: e.target.value }))}
            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 text-xs"
          >
            <option value="all">ALL PROJECTS</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filter.status || 'all'}
            onChange={e => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 text-xs"
          >
            <option value="all">ALL STATUSES</option>
            <option value="todo">TO DO</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="review">REVIEW</option>
            <option value="done">DONE</option>
          </select>

          {/* Priority */}
          <select
            value={filter.priority || 'all'}
            onChange={e => setFilter(prev => ({ ...prev, priority: e.target.value as any }))}
            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 text-xs"
          >
            <option value="all">ALL PRIORITIES</option>
            <option value="urgent">URGENT</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>

          {/* Due date filter */}
          <select
            value={filter.dueRange || 'all'}
            onChange={e => setFilter(prev => ({ ...prev, dueRange: e.target.value as any }))}
            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 text-xs"
          >
            <option value="all">ANY DUE DATE</option>
            <option value="today">DUE TODAY</option>
            <option value="this_week">DUE THIS WEEK</option>
            <option value="overdue">OVERDUE</option>
          </select>

          {/* Reset */}
          {(filter.status !== 'all' || filter.priority !== 'all' || filter.projectId !== 'all' || filter.dueRange !== 'all') && (
            <button
              onClick={() => setFilter({ status: 'all', priority: 'all', projectId: 'all', assigneeId: 'all', dueRange: 'all' })}
              className="text-blue-400 hover:text-blue-300 text-[10px] pl-1 font-mono uppercase"
            >
              [RESET]
            </button>
          )}
        </div>
      </div>

      {/* Task Table Container */}
      <div className="bg-zinc-900 rounded-md border border-zinc-800 shadow-2xs overflow-hidden">
        {sortedTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found matching criteria"
            description="Create a task or clear your search filters."
            actionText="Create Task"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-8">DONE</th>
                  <th className="py-2.5 px-3">TASK TITLE</th>
                  <th className="py-2.5 px-3">PROJECT</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">ASSIGNEE</th>
                  <th className="py-2.5 px-3">DUE DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {sortedTasks.map(task => {
                  const isDone = task.status === 'done';
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className="hover:bg-zinc-850 cursor-pointer transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-3" onClick={e => handleToggleTaskDone(e, task)}>
                        <button className="text-zinc-500 hover:text-blue-400 transition-colors">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-2 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {task.title}
                          </span>
                          {task.comments_count !== undefined && task.comments_count > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-zinc-400 bg-zinc-950 px-1 py-0.2 rounded font-mono border border-zinc-800">
                              <MessageSquare className="w-2.5 h-2.5" /> {task.comments_count}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-2 px-3">
                        <span 
                          className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                          style={{ borderLeft: `2px solid ${task.project?.color || '#3B82F6'}` }}
                        >
                          {task.project?.name || 'General'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        <StatusBadge status={task.status} />
                      </td>

                      {/* Priority */}
                      <td className="py-2 px-3">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      {/* Assignee */}
                      <td className="py-2 px-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={task.assignee.full_name || task.assignee.email} size="xs" />
                            <span className="text-zinc-300 font-sans text-xs">
                              {task.assignee.full_name || task.assignee.email.split('@')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[10px]">UNASSIGNED</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-2 px-3">
                        {task.due_date ? (
                          <span className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-rose-400 font-semibold' : 'text-zinc-400'}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
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
