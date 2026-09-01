import { DashboardStats, Project, Task } from '../types';
import { taskService } from './taskService';
import { projectService } from './projectService';

export const statsService = {
  async getDashboardStats(workspaceId: string, userId: string): Promise<DashboardStats> {
    // Fetch real projects and tasks
    const [projects, tasks] = await Promise.all([
      projectService.getProjects(workspaceId),
      taskService.getTasks(workspaceId),
    ]);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;

    const assignedToUserCount = tasks.filter(t => t.assignee_id === userId).length;

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 86400000);
    const dueSoonTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      const due = new Date(t.due_date);
      return due <= threeDaysFromNow;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const priorityDistribution = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
    };

    return {
      totalProjects: projects.length,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      reviewTasks,
      todoTasks,
      dueSoonTasks,
      assignedToUserCount,
      completionRate,
      priorityDistribution,
    };
  },
};
