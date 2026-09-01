import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Activity } from '../types';
import { localDb } from './localStore';

export const activityService = {
  async getActivities(workspaceId: string, projectId?: string): Promise<Activity[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      let query = client
        .from('activities')
        .select(`
          *,
          user:profiles!activities_user_id_fkey(id, email, full_name, avatar_url),
          project:projects!activities_project_id_fkey(id, name, color),
          task:tasks!activities_task_id_fkey(id, title, status)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
      return data as Activity[];
    } else {
      return localDb.getActivities(workspaceId, projectId);
    }
  },

  async logActivity(data: {
    workspace_id: string;
    project_id?: string | null;
    task_id?: string | null;
    user_id?: string | null;
    action: string;
    details: Record<string, any>;
  }): Promise<Activity | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data: act, error } = await client
        .from('activities')
        .insert({
          workspace_id: data.workspace_id,
          project_id: data.project_id || null,
          task_id: data.task_id || null,
          user_id: data.user_id || null,
          action: data.action,
          details: data.details || {},
        })
        .select()
        .single();

      if (error) {
        console.warn('Failed to log activity to Supabase:', error);
        return null;
      }
      return act as Activity;
    } else {
      return localDb.logActivity(data);
    }
  },
};
