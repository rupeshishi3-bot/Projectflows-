// TypeScript Type Definitions for Project Management SaaS

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'on_hold';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  role?: WorkspaceRole;
  member_count?: number;
  project_count?: number;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_email?: string;
  joined_at: string;
  profile?: UserProfile;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Aggregated fields
  task_count?: number;
  completed_task_count?: number;
}

export interface Task {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
  created_by: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee?: UserProfile | null;
  creator?: UserProfile | null;
  project?: Project | null;
  comments_count?: number;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  workspace_id?: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  task_id?: string | null;
  user_id?: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
  user?: UserProfile | null;
  project?: Project | null;
  task?: Task | null;
}

export interface TaskFilter {
  search?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  projectId?: string | 'all';
  assigneeId?: string | 'all';
  dueRange?: 'all' | 'today' | 'this_week' | 'overdue';
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  todoTasks: number;
  dueSoonTasks: number;
  assignedToUserCount: number;
  completionRate: number;
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export interface CreateProjectInput {
  workspace_id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}

export interface CreateTaskInput {
  workspace_id: string;
  project_id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
  project_id?: string;
  order_index?: number;
}
