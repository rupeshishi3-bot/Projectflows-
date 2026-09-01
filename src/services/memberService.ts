import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { WorkspaceMember, WorkspaceRole } from '../types';
import { localDb } from './localStore';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const memberService = {
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('workspace_members')
        .select(`
          *,
          profile:profiles!workspace_members_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('workspace_id', workspaceId);

      if (error) {
        console.error('Error fetching workspace members:', error);
        return [];
      }
      return data as WorkspaceMember[];
    } else {
      return localDb.getWorkspaceMembers(workspaceId);
    }
  },

  async inviteMember(params: {
    workspaceId: string;
    workspaceName: string;
    email: string;
    role: WorkspaceRole;
    inviterId: string;
  }): Promise<WorkspaceMember> {
    const { workspaceId, workspaceName, email, role, inviterId } = params;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;

      // Look for existing profile with this email
      const { data: profile } = await client
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      const userId = profile ? profile.id : null;

      const { data, error } = await client
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
          invited_email: email.trim().toLowerCase(),
        })
        .select(`
          *,
          profile:profiles!workspace_members_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw new Error(error.message);

      await activityService.logActivity({
        workspace_id: workspaceId,
        user_id: inviterId,
        action: 'added_member',
        details: { email, role },
      });

      if (userId) {
        await notificationService.createNotification({
          user_id: userId,
          workspace_id: workspaceId,
          title: `Invited to ${workspaceName}`,
          message: `You were added as ${role} in ${workspaceName}`,
          link: '/',
        });
      }

      return data as WorkspaceMember;
    } else {
      const mem = localDb.addWorkspaceMember(workspaceId, email.trim(), role === 'owner' ? 'admin' : role);
      localDb.logActivity({
        workspace_id: workspaceId,
        user_id: inviterId,
        action: 'added_member',
        details: { email, role },
      });
      return mem;
    }
  },

  async updateRole(
    workspaceId: string, 
    memberId: string, 
    role: WorkspaceRole, 
    updaterId: string
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { error } = await client
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId)
        .eq('workspace_id', workspaceId);

      if (error) throw new Error(error.message);

      await activityService.logActivity({
        workspace_id: workspaceId,
        user_id: updaterId,
        action: 'updated_member_role',
        details: { member_id: memberId, new_role: role },
      });
    } else {
      localDb.updateMemberRole(workspaceId, memberId, role);
      localDb.logActivity({
        workspace_id: workspaceId,
        user_id: updaterId,
        action: 'updated_member_role',
        details: { member_id: memberId, new_role: role },
      });
    }
  },

  async removeMember(
    workspaceId: string, 
    memberId: string, 
    removerId: string
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { error } = await client
        .from('workspace_members')
        .delete()
        .eq('id', memberId)
        .eq('workspace_id', workspaceId);

      if (error) throw new Error(error.message);

      await activityService.logActivity({
        workspace_id: workspaceId,
        user_id: removerId,
        action: 'removed_member',
        details: { member_id: memberId },
      });
    } else {
      localDb.removeWorkspaceMember(workspaceId, memberId);
      localDb.logActivity({
        workspace_id: workspaceId,
        user_id: removerId,
        action: 'removed_member',
        details: { member_id: memberId },
      });
    }
  },
};
