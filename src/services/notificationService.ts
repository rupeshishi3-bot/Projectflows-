import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Notification } from '../types';
import { localDb } from './localStore';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data as Notification[];
    } else {
      return localDb.getNotifications(userId);
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } else {
      localDb.markNotificationAsRead(notificationId);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
    } else {
      localDb.markAllNotificationsAsRead(userId);
    }
  },

  async createNotification(data: {
    user_id: string;
    workspace_id?: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<Notification | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data: n, error } = await client
        .from('notifications')
        .insert({
          user_id: data.user_id,
          workspace_id: data.workspace_id || null,
          title: data.title,
          message: data.message,
          link: data.link || null,
          read: false,
        })
        .select()
        .single();

      if (error) {
        console.warn('Failed to insert notification in Supabase:', error);
        return null;
      }
      return n as Notification;
    } else {
      return localDb.createNotification(data);
    }
  },
};
