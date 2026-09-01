import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from './localStore';
import { activityService } from './activityService';

export const seedService = {
  async seedWorkspaceData(workspaceId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;

      // 1. Create 2 sample projects
      const { data: proj1 } = await client.from('projects').insert({
        workspace_id: workspaceId,
        name: 'Sprint 1: Core Foundation',
        description: 'Establish authentication, base UI components, and API routing.',
        color: '#4F46E5',
        status: 'active',
        created_by: userId,
      }).select().single();

      const { data: proj2 } = await client.from('projects').insert({
        workspace_id: workspaceId,
        name: 'Sprint 2: Kanban & Automation',
        description: 'Build responsive drag-drop boards and real-time state sync.',
        color: '#0D9488',
        status: 'active',
        created_by: userId,
      }).select().single();

      if (proj1) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 86400000).toISOString();
        const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString();

        // Sample tasks
        await client.from('tasks').insert([
          {
            workspace_id: workspaceId,
            project_id: proj1.id,
            title: 'Audit database performance & index usage',
            description: 'Verify all foreign keys have indexes for rapid workspace filtering.',
            status: 'done',
            priority: 'high',
            due_date: now.toISOString(),
            assignee_id: userId,
            created_by: userId,
          },
          {
            workspace_id: workspaceId,
            project_id: proj1.id,
            title: 'Design accessible color tokens for dark/light themes',
            description: 'Ensure 4.5:1 contrast ratio across priority chips and badges.',
            status: 'in_progress',
            priority: 'urgent',
            due_date: tomorrow,
            assignee_id: userId,
            created_by: userId,
          },
          {
            workspace_id: workspaceId,
            project_id: proj1.id,
            title: 'Integrate team member invite validation workflow',
            description: 'Validate emails and assign default roles on sign-up.',
            status: 'review',
            priority: 'medium',
            due_date: nextWeek,
            assignee_id: userId,
            created_by: userId,
          },
          {
            workspace_id: workspaceId,
            project_id: proj2?.id || proj1.id,
            title: 'Conduct weekly retrospective & release notes preparation',
            description: 'Document changelog and prepare user feedback survey.',
            status: 'todo',
            priority: 'low',
            due_date: nextWeek,
            assignee_id: userId,
            created_by: userId,
          },
        ]);
      }

      await activityService.logActivity({
        workspace_id: workspaceId,
        user_id: userId,
        action: 'seeded_workspace',
        details: { message: 'Sample projects and tasks generated' },
      });
    } else {
      // Local reset
      localDb.resetToDefault();
    }
  },
};
