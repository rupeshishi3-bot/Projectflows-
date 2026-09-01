import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Project, ProjectStatus } from '../../types';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Trash2, Archive, CheckCircle } from 'lucide-react';

interface ProjectSettingsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { updateProject, deleteProject } = useWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [color, setColor] = useState('#4F46E5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setColor(project.color || '#4F46E5');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await updateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
        status,
        color,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete project "${project.name}" and all its tasks?`)) {
      await deleteProject(project.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Settings"
      subtitle={`Manage ${project.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3 font-mono">
        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            PROJECT NAME
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
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
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200 font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              PROJECT STATUS
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
            >
              <option value="active">ACTIVE</option>
              <option value="completed">COMPLETED</option>
              <option value="on_hold">ON HOLD</option>
              <option value="archived">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              THEME COLOR
            </label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full h-8 p-1 bg-zinc-950 border border-zinc-800 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Project
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-750 hover:text-zinc-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
