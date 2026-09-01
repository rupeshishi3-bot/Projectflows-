import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { TaskPriority, TaskStatus } from '../../types';
import { Calendar, User, Flag, Folder, CheckSquare } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultStatus = 'todo',
  defaultProjectId,
}) => {
  const { projects, members, currentProject, createTask } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || currentProject?.id || (projects[0]?.id || ''));
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default project if projects list becomes available
  React.useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  React.useEffect(() => {
    if (defaultStatus) setStatus(defaultStatus);
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultStatus, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Please select or create a project first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createTask({
        project_id: projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        assignee_id: assigneeId || null,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle="Add a new item to your project board"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3 font-mono">
        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            TASK TITLE *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Implement OAuth auth flow"
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            DESCRIPTION
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add details, acceptance criteria, or context..."
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200 font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <Folder className="w-3 h-3 text-zinc-500" /> PROJECT *
            </label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
            >
              {projects.length === 0 ? (
                <option value="">NO PROJECTS (CREATE FIRST)</option>
              ) : (
                projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <CheckSquare className="w-3 h-3 text-zinc-500" /> STATUS
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
            >
              <option value="todo">TO DO</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="done">DONE</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <Flag className="w-3 h-3 text-zinc-500" /> PRIORITY
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
            >
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="urgent">URGENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <User className="w-3 h-3 text-zinc-500" /> ASSIGNEE
            </label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
            >
              <option value="">UNASSIGNED</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profile?.full_name || m.invited_email || 'Member'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-zinc-500" /> DUE DATE
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-750 hover:text-zinc-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || projects.length === 0}
            className="px-4 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
