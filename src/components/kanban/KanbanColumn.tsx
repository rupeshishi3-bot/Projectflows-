import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onQuickAdd: (status: TaskStatus) => void;
  columnAccentColor: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  onDropTask,
  onQuickAdd,
  columnAccentColor,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[260px] max-w-sm rounded-xl bg-zinc-950/30 backdrop-blur-xl p-2.5 border transition-all duration-150 shadow-lg ${
        isDragOver ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/40' : 'border-white/[0.08]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-1.5">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: columnAccentColor }} 
          />
          <h3 className="text-xs font-mono font-bold text-zinc-200 tracking-wider">
            {title}
          </h3>
          <span className="text-[10px] font-mono font-semibold text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-900/40 border border-white/[0.08]">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAdd(status)}
          title={`Add task in ${title}`}
          className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[150px] pr-0.5">
        {tasks.map(task => (
          <KanbanCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onMoveStatus={(newStatus) => onDropTask(task.id, newStatus)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded text-xs text-zinc-500 p-3 text-center font-mono">
            <span>Empty Column</span>
            <button
              onClick={() => onQuickAdd(status)}
              className="mt-1.5 text-blue-400 font-mono text-[11px] hover:underline"
            >
              + Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
