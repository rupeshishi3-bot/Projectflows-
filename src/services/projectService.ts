import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Project, ProjectStatus } from '../types';
import { localDb } from './localStore';
import { activityService } from './activityService';

export const projectService = {
  async getProjects(workspaceId: string): Promise<Project[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data: projects, error } = await client
        .from('projects')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      // Fetch task stats for each project
      const { data: tasks } = await client
        .from('tasks')
        .select('id, project_id, status')
        .eq('workspace_id', workspaceId);

      const projectsWithStats: Project[] = (projects || []).map(p => {
        const projectTasks = (tasks || []).filter(t => t.project_id === p.id);
        const completed = projectTasks.filter(t => t.status === 'done').length;
        return {
          ...p,
          task_count: projectTasks.length,
          completed_task_count: completed,
        };
      });

      return projectsWithStats;
    } else {
      return localDb.getProjects(workspaceId);
    }
  },

  async getProject(projectId: string): Promise<Project | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) return null;
      return data as Project;
    } else {
      const projects = localDb.getProjects('');
      return projects.find(p => p.id === projectId) || null;
    }
  },

  async createProject(params: {
    workspace_id: string;
    name: string;
    description?: string;
    color?: string;
    status?: ProjectStatus;
    created_by?: string;
  }): Promise<Project> {
    const { workspace_id, name, description = '', color = '#4F46E5', status = 'active', created_by } = params;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('projects')
        .insert({
          workspace_id,
          name,
          description,
          color,
          status,
          created_by,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      await activityService.logActivity({
        workspace_id,
        project_id: data.id,
        user_id: created_by,
        action: 'created_project',
        details: { project_name: name },
      });

      return {
        ...data,
        task_count: 0,
        completed_task_count: 0,
      };
    } else {
      const p = localDb.createProject(workspace_id, name, description, color, created_by);
      localDb.logActivity({
        workspace_id,
        project_id: p.id,
        user_id: created_by,
        action: 'created_project',
        details: { project_name: name },
      });
      return p;
    }
  },

  async updateProject(
    projectId: string, 
    workspaceId: string, 
    updates: Partial<Project>, 
    userId?: string
  ): Promise<Project> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (userId) {
        await activityService.logActivity({
          workspace_id: workspaceId,
          project_id: projectId,
          user_id: userId,
          action: 'updated_project',
          details: { updates },
        });
      }

      return data as Project;
    } else {
      const p = localDb.updateProject(projectId, updates);
      if (userId) {
        localDb.logActivity({
          workspace_id: workspaceId,
          project_id: projectId,
          user_id: userId,
          action: 'updated_project',
          details: { updates },
        });
      }
      return p;
    }
  },

  async deleteProject(projectId: string, workspaceId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { error } = await client
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw new Error(error.message);

      if (userId) {
        await activityService.logActivity({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'deleted_project',
          details: { project_id: projectId },
        });
      }
    } else {
      localDb.deleteProject(projectId);
      if (userId) {
        localDb.logActivity({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'deleted_project',
          details: { project_id: projectId },
        });
      }
    }
  },
};
