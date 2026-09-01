import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Comment } from '../types';
import { localDb } from './localStore';
import { activityService } from './activityService';

export const commentService = {
  async getComments(taskId: string): Promise<Comment[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('comments')
        .select(`
          *,
          user:profiles!comments_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      return data as Comment[];
    } else {
      return localDb.getComments(taskId);
    }
  },

  async addComment(params: {
    taskId: string;
    workspaceId: string;
    userId: string;
    content: string;
    taskTitle?: string;
  }): Promise<Comment> {
    const { taskId, workspaceId, userId, content, taskTitle } = params;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          content,
        })
        .select(`
          *,
          user:profiles!comments_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw new Error(error.message);

      await activityService.logActivity({
        workspace_id: workspaceId,
        task_id: taskId,
        user_id: userId,
        action: 'added_comment',
        details: { task_title: taskTitle || 'Task', snippet: content.slice(0, 50) },
      });

      return data as Comment;
    } else {
      const comment = localDb.addComment(taskId, userId, content);
      localDb.logActivity({
        workspace_id: workspaceId,
        task_id: taskId,
        user_id: userId,
        action: 'added_comment',
        details: { task_title: taskTitle || 'Task', snippet: content.slice(0, 50) },
      });
      return comment;
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { error } = await client
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw new Error(error.message);
    } else {
      localDb.deleteComment(commentId);
    }
  },
};
