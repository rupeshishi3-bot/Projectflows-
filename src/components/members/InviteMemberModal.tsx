import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { WorkspaceRole } from '../../types';
import { Mail, Shield, UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentWorkspace, inviteMember } = useWorkspace();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await inviteMember(email.trim().toLowerCase(), role);
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      subtitle={`Add a collaborator to ${currentWorkspace?.name || 'Workspace'}`}
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
            MEMBER EMAIL ADDRESS *
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-zinc-500" /> WORKSPACE ROLE
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as WorkspaceRole)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
          >
            <option value="member">MEMBER - CAN CREATE, EDIT, AND MOVE TASKS</option>
            <option value="admin">ADMIN - CAN MANAGE MEMBERS AND PROJECTS</option>
          </select>
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
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{loading ? 'Inviting...' : 'Send Invite'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
