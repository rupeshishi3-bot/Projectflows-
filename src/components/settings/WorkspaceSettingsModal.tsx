import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentWorkspace, currentRole, updateWorkspace, deleteWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name);
      setDescription(currentWorkspace.description || '');
    }
  }, [currentWorkspace]);

  if (!isOpen || !currentWorkspace) return null;

  const isOwner = currentRole === 'owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await updateWorkspace(name.trim(), description.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you absolutely sure you want to delete workspace "${currentWorkspace.name}" and all its data? This cannot be undone.`)) {
      try {
        await deleteWorkspace();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to delete workspace');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace Settings"
      subtitle={`Configure ${currentWorkspace.name}`}
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
            WORKSPACE NAME
          </label>
          <input
            type="text"
            required
            disabled={!isOwner}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100 font-sans disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            WORKSPACE DESCRIPTION
          </label>
          <textarea
            rows={3}
            disabled={!isOwner}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200 font-sans disabled:opacity-50"
          />
        </div>

        {/* Danger zone if owner */}
        {isOwner && (
          <div className="pt-3 border-t border-zinc-800 mt-4">
            <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
            </h4>
            <div className="p-2.5 bg-rose-950/30 border border-rose-800/80 rounded flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-200">Delete this workspace</p>
                <p className="text-[10px] text-rose-400/80">Once deleted, all projects and tasks are permanently erased.</p>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-750 hover:text-zinc-200 rounded transition-colors"
          >
            Cancel
          </button>
          {isOwner && (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};
