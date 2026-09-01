import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput, TaskFilter } from '../types';
import { localDb } from './localStore';
import { activityService } from './activityService';
import { notificationService } from './notificationService';

export const taskService = {
  async getTasks(workspaceId: string, filter?: TaskFilter): Promise<Task[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      let query = client
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, email, full_name, avatar_url),
          project:projects!tasks_project_id_fkey(id, name, color, status)
        `)
        .eq('workspace_id', workspaceId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (filter?.projectId && filter.projectId !== 'all') {
        query = query.eq('project_id', filter.projectId);
      }
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      if (filter?.priority && filter.priority !== 'all') {
        query = query.eq('priority', filter.priority);
      }
      if (filter?.assigneeId && filter.assigneeId !== 'all') {
        query = query.eq('assignee_id', filter.assigneeId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error querying tasks:', error);
        return [];
      }

      let tasks = (data || []) as Task[];

      // Client-side text search & dueRange filter if requested
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(q) || 
          (t.description && t.description.toLowerCase().includes(q))
        );
      }

      if (filter?.dueRange && filter.dueRange !== 'all') {
        const now = new Date();
        tasks = tasks.filter(t => {
          if (!t.due_date) return false;
          const due = new Date(t.due_date);
          if (filter.dueRange === 'overdue') {
            return due < now && t.status !== 'done';
          } else if (filter.dueRange === 'today') {
            return due.toDateString() === now.toDateString();
          } else if (filter.dueRange === 'this_week') {
            const nextWeek = new Date(now.getTime() + 7 * 86400000);
            return due >= now && due <= nextWeek;
          }
          return true;
        });
      }

      return tasks;
    } else {
      let tasks = localDb.getTasks(workspaceId, filter?.projectId);

      if (filter?.status && filter.status !== 'all') {
        tasks = tasks.filter(t => t.status === filter.status);
      }
      if (filter?.priority && filter.priority !== 'all') {
        tasks = tasks.filter(t => t.priority === filter.priority);
      }
      if (filter?.assigneeId && filter.assigneeId !== 'all') {
        tasks = tasks.filter(t => t.assignee_id === filter.assigneeId);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(q) || 
          (t.description && t.description.toLowerCase().includes(q))
        );
      }
      if (filter?.dueRange && filter.dueRange !== 'all') {
        const now = new Date();
        tasks = tasks.filter(t => {
          if (!t.due_date) return false;
          const due = new Date(t.due_date);
          if (filter.dueRange === 'overdue') {
            return due < now && t.status !== 'done';
          } else if (filter.dueRange === 'today') {
            return due.toDateString() === now.toDateString();
          } else if (filter.dueRange === 'this_week') {
            const nextWeek = new Date(now.getTime() + 7 * 86400000);
            return due >= now && due <= nextWeek;
          }
          return true;
        });
      }

      return tasks;
    }
  },

  async getTask(taskId: string): Promise<Task | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, email, full_name, avatar_url),
          project:projects!tasks_project_id_fkey(id, name, color, status)
        `)
        .eq('id', taskId)
        .single();

      if (error) return null;
      return data as Task;
    } else {
      return localDb.getTaskById(taskId);
    }
  },

  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('tasks')
        .insert({
          workspace_id: input.workspace_id,
          project_id: input.project_id,
          title: input.title,
          description: input.description || '',
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          due_date: input.due_date || null,
          assignee_id: input.assignee_id || null,
          created_by: userId,
        })
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, email, full_name, avatar_url),
          project:projects!tasks_project_id_fkey(id, name, color, status)
        `)
        .single();

      if (error) throw new Error(error.message);

      const task = data as Task;

      // Log activity
      await activityService.logActivity({
        workspace_id: input.workspace_id,
        project_id: input.project_id,
        task_id: task.id,
        user_id: userId,
        action: 'created_task',
        details: { task_title: input.title, status: task.status, priority: task.priority },
      });

      // Dispatch notification if assigned
      if (input.assignee_id && input.assignee_id !== userId) {
        await notificationService.createNotification({
          user_id: input.assignee_id,
          workspace_id: input.workspace_id,
          title: 'New task assigned to you',
          message: `You were assigned to "${input.title}"`,
          link: `/tasks/${task.id}`,
        });
      }

      return task;
    } else {
      const task = localDb.createTask({
        ...input,
        created_by: userId,
      });

      localDb.logActivity({
        workspace_id: input.workspace_id,
        project_id: input.project_id,
        task_id: task.id,
        user_id: userId,
        action: 'created_task',
        details: { task_title: input.title, status: task.status, priority: task.priority },
      });

      if (input.assignee_id && input.assignee_id !== userId) {
        localDb.createNotification({
          user_id: input.assignee_id,
          workspace_id: input.workspace_id,
          title: 'New task assigned to you',
          message: `You were assigned to "${input.title}"`,
          link: `/tasks/${task.id}`,
        });
      }

      return task;
    }
  },

  async updateTask(
    taskId: string, 
    workspaceId: string, 
    updates: UpdateTaskInput, 
    userId: string
  ): Promise<Task> {
    const prevTask = await this.getTask(taskId);

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, email, full_name, avatar_url),
          project:projects!tasks_project_id_fkey(id, name, color, status)
        `)
        .single();

      if (error) throw new Error(error.message);

      const task = data as Task;

      // Check for status movement
      if (updates.status && prevTask && prevTask.status !== updates.status) {
        const actionName = updates.status === 'done' ? 'completed_task' : 'moved_task';
        await activityService.logActivity({
          workspace_id: workspaceId,
          project_id: task.project_id,
          task_id: task.id,
          user_id: userId,
          action: actionName,
          details: { 
            task_title: task.title, 
            from_status: prevTask.status, 
            to_status: updates.status 
          },
        });
      } else {
        await activityService.logActivity({
          workspace_id: workspaceId,
          project_id: task.project_id,
          task_id: task.id,
          user_id: userId,
          action: 'updated_task',
          details: { task_title: task.title, updates },
        });
      }

      // Check if reassigned
      if (updates.assignee_id && prevTask && prevTask.assignee_id !== updates.assignee_id && updates.assignee_id !== userId) {
        await notificationService.createNotification({
          user_id: updates.assignee_id,
          workspace_id: workspaceId,
          title: 'Task assigned to you',
          message: `You were assigned to "${task.title}"`,
          link: `/tasks/${task.id}`,
        });
      }

      return task;
    } else {
      const task = localDb.updateTask(taskId, updates);

      if (updates.status && prevTask && prevTask.status !== updates.status) {
        const actionName = updates.status === 'done' ? 'completed_task' : 'moved_task';
        localDb.logActivity({
          workspace_id: workspaceId,
          project_id: task.project_id,
          task_id: task.id,
          user_id: userId,
          action: actionName,
          details: { 
            task_title: task.title, 
            from_status: prevTask.status, 
            to_status: updates.status 
          },
        });
      }

      if (updates.assignee_id && prevTask && prevTask.assignee_id !== updates.assignee_id && updates.assignee_id !== userId) {
        localDb.createNotification({
          user_id: updates.assignee_id,
          workspace_id: workspaceId,
          title: 'Task assigned to you',
          message: `You were assigned to "${task.title}"`,
          link: `/tasks/${task.id}`,
        });
      }

      return task;
    }
  },

  async updateTaskStatus(
    taskId: string, 
    workspaceId: string, 
    status: TaskStatus, 
    userId: string
  ): Promise<Task> {
    return this.updateTask(taskId, workspaceId, { status }, userId);
  },

  async deleteTask(taskId: string, workspaceId: string, userId: string): Promise<void> {
    const task = await this.getTask(taskId);

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { error } = await client
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw new Error(error.message);

      if (task) {
        await activityService.logActivity({
          workspace_id: workspaceId,
          project_id: task.project_id,
          user_id: userId,
          action: 'deleted_task',
          details: { task_title: task.title },
        });
      }
    } else {
      localDb.deleteTask(taskId);
      if (task) {
        localDb.logActivity({
          workspace_id: workspaceId,
          project_id: task.project_id,
          user_id: userId,
          action: 'deleted_task',
          details: { task_title: task.title },
        });
      }
    }
  },
};
