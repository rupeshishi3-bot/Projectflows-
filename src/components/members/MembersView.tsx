import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { WorkspaceRole, WorkspaceMember } from '../../types';
import { RoleBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { InviteMemberModal } from './InviteMemberModal';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Crown, 
  Clock, 
  ShieldAlert
} from 'lucide-react';

export const MembersView: React.FC = () => {
  const { currentWorkspace, members, currentRole, updateMemberRole, removeMember } = useWorkspace();
  const { user } = useAuth();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canManageMembers = currentRole === 'owner' || currentRole === 'admin';

  const handleRoleChange = async (member: WorkspaceMember, newRole: WorkspaceRole) => {
    if (!canManageMembers) return;
    try {
      setUpdatingId(member.id);
      await updateMemberRole(member.id, newRole);
    } catch (err) {
      console.error('Failed to update member role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveMember = async (member: WorkspaceMember) => {
    const name = member.profile?.full_name || member.invited_email || 'this member';
    if (window.confirm(`Are you sure you want to remove ${name} from ${currentWorkspace?.name}?`)) {
      try {
        await removeMember(member.id);
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-md border border-zinc-800">
        <div>
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Workspace Members & RBAC</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Manage team access levels, administrative permissions, and invitations
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-zinc-900 rounded-md border border-zinc-800 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">MEMBER</th>
              <th className="py-2.5 px-3">EMAIL</th>
              <th className="py-2.5 px-3">ROLE</th>
              <th className="py-2.5 px-3">JOINED</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {members.map(member => {
              const isOwner = member.role === 'owner';
              const isCurrentUser = member.user_id === user?.id;

              return (
                <tr key={member.id} className="hover:bg-zinc-850 transition-colors">
                  
                  {/* Name & Avatar */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={member.profile?.full_name || member.invited_email || 'Member'}
                        src={member.profile?.avatar_url}
                        size="xs"
                      />
                      <div>
                        <div className="font-sans font-medium text-zinc-100 flex items-center gap-1.5">
                          {member.profile?.full_name || 'Invited User'}
                          {isCurrentUser && (
                            <span className="text-[9px] text-blue-400 bg-blue-950 border border-blue-800 px-1 py-0.2 rounded font-mono uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-2.5 px-3 font-mono text-zinc-400 text-xs">
                    {member.profile?.email || member.invited_email}
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-3">
                    {canManageMembers && !isOwner && !isCurrentUser ? (
                      <select
                        value={member.role}
                        disabled={updatingId === member.id}
                        onChange={e => handleRoleChange(member, e.target.value as WorkspaceRole)}
                        className="px-2 py-0.5 text-xs bg-zinc-950 border border-zinc-800 rounded font-mono text-zinc-200 focus:border-blue-500"
                      >
                        <option value="member">MEMBER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="py-2.5 px-3 text-zinc-500">
                    {new Date(member.joined_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    {canManageMembers && !isOwner && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        title="Remove member"
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};
