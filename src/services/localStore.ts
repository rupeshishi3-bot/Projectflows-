import { 
  UserProfile, 
  Workspace, 
  WorkspaceMember, 
  Project, 
  Task, 
  Comment, 
  Notification, 
  Activity 
} from '../types';

// In-Memory / Local Storage Database Engine (PostgreSQL replica for Sandbox/Offline preview)
const DB_STORAGE_KEY = 'PROJECT_MGMT_SAAS_DB_V1';

interface DatabaseSchema {
  profiles: UserProfile[];
  workspaces: Workspace[];
  workspace_members: WorkspaceMember[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
  activities: Activity[];
}

const getInitialDB = (): DatabaseSchema => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse local database', e);
      }
    }
  }

  // Initial demo seed for instant evaluation if no data exists
  const now = new Date().toISOString();
  const demoUserId = 'demo-user-001';
  const teamMemberId1 = 'demo-member-002';
  const teamMemberId2 = 'demo-member-003';
  const workspaceId = 'ws-core-001';
  const projectId1 = 'proj-core-001';
  const projectId2 = 'proj-core-002';

  const defaultProfiles: UserProfile[] = [
    {
      id: demoUserId,
      email: 'alex.rivera@example.com',
      full_name: 'Alex Rivera (You)',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: now,
      updated_at: now,
    },
    {
      id: teamMemberId1,
      email: 'sarah.chen@example.com',
      full_name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      created_at: now,
      updated_at: now,
    },
    {
      id: teamMemberId2,
      email: 'marcus.vance@example.com',
      full_name: 'Marcus Vance',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: now,
      updated_at: now,
    }
  ];

  const defaultWorkspaces: Workspace[] = [
    {
      id: workspaceId,
      name: 'Acme Product Studio',
      slug: 'acme-product-studio',
      description: 'Main product engineering and design workspace',
      owner_id: demoUserId,
      created_at: now,
      updated_at: now,
    }
  ];

  const defaultMembers: WorkspaceMember[] = [
    {
      id: 'wm-001',
      workspace_id: workspaceId,
      user_id: demoUserId,
      role: 'owner',
      joined_at: now,
    },
    {
      id: 'wm-002',
      workspace_id: workspaceId,
      user_id: teamMemberId1,
      role: 'admin',
      joined_at: now,
    },
    {
      id: 'wm-003',
      workspace_id: workspaceId,
      user_id: teamMemberId2,
      role: 'member',
      joined_at: now,
    }
  ];

  const defaultProjects: Project[] = [
    {
      id: projectId1,
      workspace_id: workspaceId,
      name: 'V2 Platform Redesign',
      description: 'Core web app UI refresh, performance optimization, and mobile support',
      status: 'active',
      color: '#4F46E5',
      created_by: demoUserId,
      created_at: now,
      updated_at: now,
    },
    {
      id: projectId2,
      workspace_id: workspaceId,
      name: 'Mobile App Beta',
      description: 'React Native companion app for on-the-go notifications and task updates',
      status: 'active',
      color: '#0D9488',
      created_by: demoUserId,
      created_at: now,
      updated_at: now,
    }
  ];

  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString();
  const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString();

  const defaultTasks: Task[] = [
    {
      id: 'task-001',
      workspace_id: workspaceId,
      project_id: projectId1,
      title: 'Architect PostgreSQL schema & RLS security policies',
      description: 'Finalize multi-tenant isolation rules, foreign key cascades, and indexing strategy.',
      status: 'done',
      priority: 'high',
      due_date: now,
      assignee_id: demoUserId,
      created_by: demoUserId,
      order_index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'task-002',
      workspace_id: workspaceId,
      project_id: projectId1,
      title: 'Implement interactive Kanban drag-and-drop board',
      description: 'Ensure optimistic state updates with real database synchronization and error rollback.',
      status: 'in_progress',
      priority: 'urgent',
      due_date: tomorrow,
      assignee_id: demoUserId,
      created_by: demoUserId,
      order_index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'task-003',
      workspace_id: workspaceId,
      project_id: projectId1,
      title: 'Build Workspace & Member management RBAC permissions',
      description: 'Allow owners and admins to invite users, change roles, and regulate access.',
      status: 'review',
      priority: 'high',
      due_date: nextWeek,
      assignee_id: teamMemberId1,
      created_by: demoUserId,
      order_index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'task-004',
      workspace_id: workspaceId,
      project_id: projectId1,
      title: 'Setup real-time notification dispatch and audit logs',
      description: 'Log state transitions, assignments, and thread discussions across the workspace.',
      status: 'todo',
      priority: 'medium',
      due_date: nextWeek,
      assignee_id: teamMemberId2,
      created_by: demoUserId,
      order_index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'task-005',
      workspace_id: workspaceId,
      project_id: projectId2,
      title: 'Configure Push Notification credentials for iOS/Android',
      description: 'Setup APNS and FCM certificates for mobile notification delivery.',
      status: 'todo',
      priority: 'low',
      due_date: null,
      assignee_id: teamMemberId1,
      created_by: demoUserId,
      order_index: 0,
      created_at: now,
      updated_at: now,
    }
  ];

  const defaultComments: Comment[] = [
    {
      id: 'comm-001',
      task_id: 'task-002',
      user_id: teamMemberId1,
      content: 'Kanban columns need to support instant keyboard navigation and drag-drop touch handles on mobile as well!',
      created_at: now,
      updated_at: now,
    }
  ];

  const defaultActivities: Activity[] = [
    {
      id: 'act-001',
      workspace_id: workspaceId,
      project_id: projectId1,
      task_id: 'task-002',
      user_id: demoUserId,
      action: 'moved_task',
      details: { task_title: 'Implement interactive Kanban drag-and-drop board', from: 'todo', to: 'in_progress' },
      created_at: now,
    },
    {
      id: 'act-002',
      workspace_id: workspaceId,
      project_id: projectId1,
      task_id: 'task-001',
      user_id: demoUserId,
      action: 'completed_task',
      details: { task_title: 'Architect PostgreSQL schema & RLS security policies' },
      created_at: now,
    }
  ];

  const defaultNotifications: Notification[] = [
    {
      id: 'notif-001',
      user_id: demoUserId,
      workspace_id: workspaceId,
      title: 'Welcome to SyncPlan SaaS',
      message: 'Your production workspace is active. Create projects, invite team members, and track tasks!',
      read: false,
      created_at: now,
    }
  ];

  return {
    profiles: defaultProfiles,
    workspaces: defaultWorkspaces,
    workspace_members: defaultMembers,
    projects: defaultProjects,
    tasks: defaultTasks,
    comments: defaultComments,
    notifications: defaultNotifications,
    activities: defaultActivities,
  };
};

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = getInitialDB();
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  public resetToDefault() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_STORAGE_KEY);
    }
    this.data = getInitialDB();
    this.save();
  }

  // --- Profiles ---
  getProfile(userId: string): UserProfile | null {
    return this.data.profiles.find(p => p.id === userId) || null;
  }

  getAllProfiles(): UserProfile[] {
    return [...this.data.profiles];
  }

  upsertProfile(profile: Partial<UserProfile> & { id: string; email: string }): UserProfile {
    const idx = this.data.profiles.findIndex(p => p.id === profile.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      this.data.profiles[idx] = {
        ...this.data.profiles[idx],
        ...profile,
        updated_at: now,
      };
      this.save();
      return this.data.profiles[idx];
    } else {
      const newP: UserProfile = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || profile.email.split('@')[0],
        avatar_url: profile.avatar_url || '',
        created_at: now,
        updated_at: now,
      };
      this.data.profiles.push(newP);
      this.save();
      return newP;
    }
  }

  // --- Workspaces ---
  getUserWorkspaces(userId: string): Workspace[] {
    const memberWorkspaceIds = this.data.workspace_members
      .filter(m => m.user_id === userId)
      .map(m => m.workspace_id);

    return this.data.workspaces
      .filter(w => memberWorkspaceIds.includes(w.id) || w.owner_id === userId)
      .map(w => {
        const mem = this.data.workspace_members.find(m => m.workspace_id === w.id && m.user_id === userId);
        const memberCount = this.data.workspace_members.filter(m => m.workspace_id === w.id).length;
        const projectCount = this.data.projects.filter(p => p.workspace_id === w.id).length;
        return {
          ...w,
          role: mem ? mem.role : (w.owner_id === userId ? 'owner' : 'member'),
          member_count: memberCount,
          project_count: projectCount,
        };
      });
  }

  getWorkspaceById(workspaceId: string): Workspace | null {
    const w = this.data.workspaces.find(item => item.id === workspaceId);
    if (!w) return null;
    const memberCount = this.data.workspace_members.filter(m => m.workspace_id === w.id).length;
    const projectCount = this.data.projects.filter(p => p.workspace_id === w.id).length;
    return {
      ...w,
      member_count: memberCount,
      project_count: projectCount,
    };
  }

  createWorkspace(name: string, description: string, ownerId: string): Workspace {
    const now = new Date().toISOString();
    const id = 'ws-' + Math.random().toString(36).substring(2, 9);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newWs: Workspace = {
      id,
      name,
      slug: slug || 'workspace',
      description,
      owner_id: ownerId,
      created_at: now,
      updated_at: now,
      role: 'owner',
      member_count: 1,
      project_count: 0,
    };

    this.data.workspaces.push(newWs);

    // Add owner to members table
    this.data.workspace_members.push({
      id: 'wm-' + Math.random().toString(36).substring(2, 9),
      workspace_id: id,
      user_id: ownerId,
      role: 'owner',
      joined_at: now,
    });

    this.save();
    return newWs;
  }

  updateWorkspace(id: string, name: string, description?: string): Workspace {
    const ws = this.data.workspaces.find(w => w.id === id);
    if (!ws) throw new Error('Workspace not found');
    ws.name = name;
    if (description !== undefined) ws.description = description;
    ws.updated_at = new Date().toISOString();
    this.save();
    return ws;
  }

  deleteWorkspace(id: string) {
    this.data.workspaces = this.data.workspaces.filter(w => w.id !== id);
    this.data.workspace_members = this.data.workspace_members.filter(m => m.workspace_id !== id);
    this.data.projects = this.data.projects.filter(p => p.workspace_id !== id);
    this.data.tasks = this.data.tasks.filter(t => t.workspace_id !== id);
    this.data.activities = this.data.activities.filter(a => a.workspace_id !== id);
    this.data.notifications = this.data.notifications.filter(n => n.workspace_id !== id);
    this.save();
  }

  // --- Members ---
  getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    return this.data.workspace_members
      .filter(m => m.workspace_id === workspaceId)
      .map(m => ({
        ...m,
        profile: this.getProfile(m.user_id) || undefined,
      }));
  }

  addWorkspaceMember(workspaceId: string, email: string, role: 'admin' | 'member'): WorkspaceMember {
    // Check if user already exists
    let existingUser = this.data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    const now = new Date().toISOString();

    if (!existingUser) {
      // Create user profile for the invited member
      const newUserId = 'user-' + Math.random().toString(36).substring(2, 9);
      existingUser = {
        id: newUserId,
        email: email.toLowerCase(),
        full_name: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        created_at: now,
        updated_at: now,
      };
      this.data.profiles.push(existingUser);
    }

    const alreadyMember = this.data.workspace_members.find(
      m => m.workspace_id === workspaceId && m.user_id === existingUser!.id
    );

    if (alreadyMember) {
      throw new Error('User is already a member of this workspace');
    }

    const member: WorkspaceMember = {
      id: 'wm-' + Math.random().toString(36).substring(2, 9),
      workspace_id: workspaceId,
      user_id: existingUser.id,
      role: role,
      invited_email: email,
      joined_at: now,
      profile: existingUser,
    };

    this.data.workspace_members.push(member);
    this.save();
    return member;
  }

  updateMemberRole(workspaceId: string, memberId: string, role: 'admin' | 'member' | 'owner') {
    const mem = this.data.workspace_members.find(m => m.id === memberId && m.workspace_id === workspaceId);
    if (!mem) throw new Error('Member not found');
    mem.role = role;
    this.save();
    return mem;
  }

  removeWorkspaceMember(workspaceId: string, memberId: string) {
    this.data.workspace_members = this.data.workspace_members.filter(
      m => !(m.id === memberId && m.workspace_id === workspaceId)
    );
    this.save();
  }

  // --- Projects ---
  getProjects(workspaceId: string): Project[] {
    return this.data.projects
      .filter(p => p.workspace_id === workspaceId)
      .map(p => {
        const tasks = this.data.tasks.filter(t => t.project_id === p.id);
        const completed = tasks.filter(t => t.status === 'done').length;
        return {
          ...p,
          task_count: tasks.length,
          completed_task_count: completed,
        };
      });
  }

  createProject(workspaceId: string, name: string, description: string = '', color: string = '#4F46E5', createdBy?: string): Project {
    const now = new Date().toISOString();
    const newP: Project = {
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      workspace_id: workspaceId,
      name,
      description,
      status: 'active',
      color,
      created_by: createdBy,
      created_at: now,
      updated_at: now,
      task_count: 0,
      completed_task_count: 0,
    };
    this.data.projects.push(newP);
    this.save();
    return newP;
  }

  updateProject(id: string, updates: Partial<Project>): Project {
    const p = this.data.projects.find(item => item.id === id);
    if (!p) throw new Error('Project not found');
    Object.assign(p, updates);
    p.updated_at = new Date().toISOString();
    this.save();
    return p;
  }

  deleteProject(id: string) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.data.tasks = this.data.tasks.filter(t => t.project_id !== id);
    this.save();
  }

  // --- Tasks ---
  getTasks(workspaceId: string, projectId?: string): Task[] {
    let tasks = this.data.tasks.filter(t => t.workspace_id === workspaceId);
    if (projectId && projectId !== 'all') {
      tasks = tasks.filter(t => t.project_id === projectId);
    }
    return tasks.map(t => ({
      ...t,
      assignee: t.assignee_id ? this.getProfile(t.assignee_id) : null,
      creator: t.created_by ? this.getProfile(t.created_by) : null,
      project: this.data.projects.find(p => p.id === t.project_id) || null,
      comments_count: this.data.comments.filter(c => c.task_id === t.id).length,
    }));
  }

  getTaskById(taskId: string): Task | null {
    const t = this.data.tasks.find(item => item.id === taskId);
    if (!t) return null;
    return {
      ...t,
      assignee: t.assignee_id ? this.getProfile(t.assignee_id) : null,
      creator: t.created_by ? this.getProfile(t.created_by) : null,
      project: this.data.projects.find(p => p.id === t.project_id) || null,
      comments_count: this.data.comments.filter(c => c.task_id === t.id).length,
    };
  }

  createTask(data: {
    workspace_id: string;
    project_id: string;
    title: string;
    description?: string;
    status?: Task['status'];
    priority?: Task['priority'];
    due_date?: string | null;
    assignee_id?: string | null;
    created_by: string;
  }): Task {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      workspace_id: data.workspace_id,
      project_id: data.project_id,
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      due_date: data.due_date || null,
      assignee_id: data.assignee_id || null,
      created_by: data.created_by,
      order_index: this.data.tasks.filter(t => t.project_id === data.project_id && t.status === (data.status || 'todo')).length,
      created_at: now,
      updated_at: now,
    };

    this.data.tasks.push(newTask);
    this.save();

    return {
      ...newTask,
      assignee: newTask.assignee_id ? this.getProfile(newTask.assignee_id) : null,
      creator: this.getProfile(newTask.created_by),
      project: this.data.projects.find(p => p.id === newTask.project_id) || null,
      comments_count: 0,
    };
  }

  updateTask(id: string, updates: Partial<Task>): Task {
    const task = this.data.tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    Object.assign(task, updates);
    task.updated_at = new Date().toISOString();
    this.save();
    return {
      ...task,
      assignee: task.assignee_id ? this.getProfile(task.assignee_id) : null,
      creator: task.created_by ? this.getProfile(task.created_by) : null,
      project: this.data.projects.find(p => p.id === task.project_id) || null,
      comments_count: this.data.comments.filter(c => c.task_id === task.id).length,
    };
  }

  deleteTask(id: string) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.data.comments = this.data.comments.filter(c => c.task_id !== id);
    this.save();
  }

  // --- Comments ---
  getComments(taskId: string): Comment[] {
    return this.data.comments
      .filter(c => c.task_id === taskId)
      .map(c => ({
        ...c,
        user: this.getProfile(c.user_id) || undefined,
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addComment(taskId: string, userId: string, content: string): Comment {
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: 'comm-' + Math.random().toString(36).substring(2, 9),
      task_id: taskId,
      user_id: userId,
      content,
      created_at: now,
      updated_at: now,
      user: this.getProfile(userId) || undefined,
    };
    this.data.comments.push(newComment);
    this.save();
    return newComment;
  }

  deleteComment(commentId: string) {
    this.data.comments = this.data.comments.filter(c => c.id !== commentId);
    this.save();
  }

  // --- Activities ---
  getActivities(workspaceId: string, projectId?: string): Activity[] {
    let acts = this.data.activities.filter(a => a.workspace_id === workspaceId);
    if (projectId && projectId !== 'all') {
      acts = acts.filter(a => a.project_id === projectId);
    }
    return acts
      .map(a => ({
        ...a,
        user: a.user_id ? this.getProfile(a.user_id) : null,
        project: a.project_id ? this.data.projects.find(p => p.id === a.project_id) || null : null,
        task: a.task_id ? this.data.tasks.find(t => t.id === a.task_id) || null : null,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  logActivity(data: {
    workspace_id: string;
    project_id?: string | null;
    task_id?: string | null;
    user_id?: string | null;
    action: string;
    details: Record<string, any>;
  }): Activity {
    const now = new Date().toISOString();
    const act: Activity = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      workspace_id: data.workspace_id,
      project_id: data.project_id || null,
      task_id: data.task_id || null,
      user_id: data.user_id || null,
      action: data.action,
      details: data.details,
      created_at: now,
    };
    this.data.activities.unshift(act);
    // Keep max 200 activities
    if (this.data.activities.length > 200) {
      this.data.activities = this.data.activities.slice(0, 200);
    }
    this.save();
    return act;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  markNotificationAsRead(id: string) {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  markAllNotificationsAsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.user_id === userId) n.read = true;
    });
    this.save();
  }

  createNotification(data: {
    user_id: string;
    workspace_id?: string;
    title: string;
    message: string;
    link?: string;
  }): Notification {
    const now = new Date().toISOString();
    const n: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      title: data.title,
      message: data.message,
      link: data.link,
      read: false,
      created_at: now,
    };
    this.data.notifications.unshift(n);
    this.save();
    return n;
  }
}

export const localDb = new LocalDatabase();
