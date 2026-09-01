import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Workspace, WorkspaceMember } from '../types';
import { localDb } from './localStore';
import { activityService } from './activityService';

export const workspaceService = {
  async getWorkspaces(userId: string): Promise<Workspace[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      // Query workspaces where user is member or owner
      const { data: memberRows, error: memberErr } = await client
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', userId);

      if (memberErr) {
        console.error('Error fetching member workspaces:', memberErr);
        return [];
      }

      const workspaceIds = (memberRows || []).map(r => r.workspace_id);
      if (workspaceIds.length === 0) return [];

      const { data: workspaces, error: wsErr } = await client
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds)
        .order('created_at', { ascending: false });

      if (wsErr) {
        console.error('Error fetching workspaces:', wsErr);
        return [];
      }

      return (workspaces || []).map(w => {
        const membership = memberRows.find(m => m.workspace_id === w.id);
        return {
          ...w,
          role: membership?.role || (w.owner_id === userId ? 'owner' : 'member'),
        };
      });
    } else {
      return localDb.getUserWorkspaces(userId);
    }
  },

  async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (error) return null;
      return data as Workspace;
    } else {
      return localDb.getWorkspaceById(workspaceId);
    }
  },

  async createWorkspace(name: string, description: string = '', ownerId: string): Promise<Workspace> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace';

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('workspaces')
        .insert({
          name,
          slug,
          description,
          owner_id: ownerId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Add owner as workspace member
      await client.from('workspace_members').insert({
        workspace_id: data.id,
        user_id: ownerId,
        role: 'owner',
      });

      // Log activity
      await activityService.logActivity({
        workspace_id: data.id,
        user_id: ownerId,
        action: 'created_workspace',
        details: { workspace_name: name },
      });

      return {
        ...data,
        role: 'owner',
        member_count: 1,
        project_count: 0,
      };
    } else {
      const ws = localDb.createWorkspace(name, description, ownerId);
      localDb.logActivity({
        workspace_id: ws.id,
        user_id: ownerId,
        action: 'created_workspace',
        details: { workspace_name: name },
      });
      return ws;
    }
  },

  async updateWorkspace(workspaceId: string, name: string, description?: string, userId?: string): Promise<Workspace> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('workspaces')
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workspaceId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (userId) {
        await activityService.logActivity({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'updated_workspace',
          details: { name },
        });
      }

      return data as Workspace;
    } else {
      const ws = localDb.updateWorkspace(workspaceId, name, description);
      if (userId) {
        localDb.logActivity({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'updated_workspace',
          details: { name },
        });
      }
      return ws;
    }
  },

  async deleteWorkspace(workspaceId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { error } = await client
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw new Error(error.message);
    } else {
      localDb.deleteWorkspace(workspaceId);
    }
  },
};
