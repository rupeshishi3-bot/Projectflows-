import React from 'react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Calendar, MessageSquare, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  onMoveStatus: (status: TaskStatus) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onClick,
  onMoveStatus,
}) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const isCompleted = task.status === 'done';

  const statusWorkflow: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
  const currentIndex = statusWorkflow.indexOf(task.status);

  const prevStatus = currentIndex > 0 ? statusWorkflow[currentIndex - 1] : null;
  const nextStatus = currentIndex < statusWorkflow.length - 1 ? statusWorkflow[currentIndex + 1] : null;

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
      }}
      className={`group relative bg-zinc-950/40 backdrop-blur-md p-2.5 rounded-lg border transition-all duration-150 cursor-pointer shadow-md hover:border-white/[0.2] hover:bg-zinc-900/50 select-none ${
        isCompleted ? 'border-white/[0.04] bg-zinc-950/30 opacity-70' : 'border-white/[0.08]'
      }`}
    >
      {/* Top row: Project Tag & Priority */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span 
          className="text-[10px] font-mono text-zinc-300 truncate max-w-[130px] px-1.5 py-0.2 rounded bg-zinc-900/50 border border-white/[0.08]"
          style={{ borderLeft: `2px solid ${task.project?.color || '#3B82F6'}` }}
        >
          {task.project?.name || 'General'}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Title */}
      <h4 className={`text-xs font-medium mb-1 leading-snug line-clamp-2 ${
        isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'
      }`}>
        {task.title}
      </h4>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2 leading-relaxed font-sans">
          {task.description}
        </p>
      )}

      {/* Footer Details: Date, Comments, Assignee, Quick Move Controls */}
      <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
        
        <div className="flex items-center gap-2.5">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${
              isOverdue ? 'text-rose-400 font-semibold' : 'text-zinc-400'
            }`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}

          {task.comments_count !== undefined && task.comments_count > 0 && (
            <span className="flex items-center gap-1 text-zinc-400">
              <MessageSquare className="w-3 h-3" />
              {task.comments_count}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1">
          {task.assignee ? (
            <Avatar
              name={task.assignee.full_name || task.assignee.email}
              src={task.assignee.avatar_url}
              size="xs"
            />
          ) : (
            <span className="text-[9px] text-zinc-500 font-mono">UNASSIGNED</span>
          )}
        </div>
      </div>

      {/* Quick Move Status Buttons on hover */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-0.5 bg-zinc-950/90 backdrop-blur-md p-0.5 rounded border border-white/[0.1] shadow-md"
      >
        {prevStatus && (
          <button
            type="button"
            onClick={() => onMoveStatus(prevStatus)}
            title={`Move back to ${prevStatus.replace('_', ' ')}`}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        )}
        {nextStatus && (
          <button
            type="button"
            onClick={() => onMoveStatus(nextStatus)}
            title={`Move to ${nextStatus.replace('_', ' ')}`}
            className="p-1 hover:bg-blue-600/20 rounded text-blue-400"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
