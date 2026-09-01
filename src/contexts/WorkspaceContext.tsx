import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Workspace, 
  WorkspaceMember, 
  WorkspaceRole, 
  Project, 
  Task, 
  Activity, 
  Notification, 
  TaskFilter, 
  CreateTaskInput, 
  UpdateTaskInput,
  TaskStatus
} from '../types';
import { workspaceService } from '../services/workspaceService';
import { projectService } from './../services/projectService';
import { taskService } from '../services/taskService';
import { memberService } from '../services/memberService';
import { activityService } from '../services/activityService';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentRole: WorkspaceRole;
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  members: WorkspaceMember[];
  activities: Activity[];
  notifications: Notification[];
  unreadNotificationCount: number;
  loading: boolean;
  filter: TaskFilter;
  setFilter: React.Dispatch<React.SetStateAction<TaskFilter>>;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentProject: (project: Project | null) => void;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (name: string, description?: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  createProject: (name: string, description?: string, color?: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createTask: (input: Omit<CreateTaskInput, 'workspace_id'>) => Promise<Task>;
  updateTask: (taskId: string, updates: UpdateTaskInput) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  inviteMember: (email: string, role: WorkspaceRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [filter, setFilter] = useState<TaskFilter>({
    status: 'all',
    priority: 'all',
    projectId: 'all',
    assigneeId: 'all',
    dueRange: 'all',
  });

  // Current Role in active workspace
  const currentRole: WorkspaceRole = currentWorkspace?.role || 
    (currentWorkspace?.owner_id === user?.id ? 'owner' : 'member');

  // Load Workspaces for current user
  const loadWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      return;
    }
    try {
      const list = await workspaceService.getWorkspaces(user.id);
      setWorkspaces(list);

      // Check saved workspace or select first
      const savedWsId = localStorage.getItem('SP_ACTIVE_WS_ID');
      const found = list.find(w => w.id === savedWsId);
      if (found) {
        setCurrentWorkspaceState(found);
      } else if (list.length > 0) {
        setCurrentWorkspaceState(list[0]);
        localStorage.setItem('SP_ACTIVE_WS_ID', list[0].id);
      } else {
        // Auto create first workspace if none exist
        const defaultName = `${user.user_metadata?.full_name || 'My'} Workspace`;
        const newWs = await workspaceService.createWorkspace(defaultName, 'Main workspace', user.id);
        setWorkspaces([newWs]);
        setCurrentWorkspaceState(newWs);
        localStorage.setItem('SP_ACTIVE_WS_ID', newWs.id);
      }
    } catch (err) {
      console.error('Error loading workspaces:', err);
    }
  }, [user]);

  // Load workspace data when active workspace changes
  const loadWorkspaceData = useCallback(async () => {
    if (!currentWorkspace || !user) {
      setProjects([]);
      setTasks([]);
      setMembers([]);
      setActivities([]);
      return;
    }

    try {
      setLoading(true);
      const [pList, mList, aList, nList] = await Promise.all([
        projectService.getProjects(currentWorkspace.id),
        memberService.getMembers(currentWorkspace.id),
        activityService.getActivities(currentWorkspace.id),
        notificationService.getNotifications(user.id),
      ]);

      setProjects(pList);
      setMembers(mList);
      setActivities(aList);
      setNotifications(nList);

      // Load tasks with current filters
      const tList = await taskService.getTasks(currentWorkspace.id, {
        ...filter,
        search: globalSearchQuery || filter.search,
      });
      setTasks(tList);
    } catch (err) {
      console.error('Error loading workspace data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, user, filter, globalSearchQuery]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const setCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('SP_ACTIVE_WS_ID', workspace.id);
      setCurrentProject(null); // Reset active project on workspace change
    } else {
      localStorage.removeItem('SP_ACTIVE_WS_ID');
    }
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace> => {
    if (!user) throw new Error('Not authenticated');
    const newWs = await workspaceService.createWorkspace(name, description, user.id);
    setWorkspaces(prev => [newWs, ...prev]);
    setCurrentWorkspace(newWs);
    return newWs;
  };

  const updateWorkspace = async (name: string, description?: string) => {
    if (!currentWorkspace || !user) return;
    const updated = await workspaceService.updateWorkspace(currentWorkspace.id, name, description, user.id);
    setCurrentWorkspaceState(prev => prev ? { ...prev, name: updated.name, description: updated.description } : null);
    setWorkspaces(prev => prev.map(w => w.id === currentWorkspace.id ? { ...w, name: updated.name, description: updated.description } : w));
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!user) return;
    await workspaceService.deleteWorkspace(workspaceId);
    const remaining = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(remaining);
    if (remaining.length > 0) {
      setCurrentWorkspace(remaining[0]);
    } else {
      setCurrentWorkspace(null);
    }
  };

  const createProject = async (name: string, description?: string, color?: string): Promise<Project> => {
    if (!currentWorkspace || !user) throw new Error('No active workspace');
    const newProj = await projectService.createProject({
      workspace_id: currentWorkspace.id,
      name,
      description,
      color: color || '#4F46E5',
      created_by: user.id,
    });
    setProjects(prev => [newProj, ...prev]);
    return newProj;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!currentWorkspace || !user) return;
    const updated = await projectService.updateProject(projectId, currentWorkspace.id, updates, user.id);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updated } : p));
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updated } : null);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!currentWorkspace || !user) return;
    await projectService.deleteProject(projectId, currentWorkspace.id, user.id);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.project_id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const createTask = async (input: Omit<CreateTaskInput, 'workspace_id'>): Promise<Task> => {
    if (!currentWorkspace || !user) throw new Error('No active workspace');
    const newTask = await taskService.createTask({
      ...input,
      workspace_id: currentWorkspace.id,
    }, user.id);
    setTasks(prev => [newTask, ...prev]);
    // Refresh activities in background
    activityService.getActivities(currentWorkspace.id).then(setActivities);
    return newTask;
  };

  const updateTask = async (taskId: string, updates: UpdateTaskInput): Promise<Task> => {
    if (!currentWorkspace || !user) throw new Error('No active workspace');
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

    try {
      const updated = await taskService.updateTask(taskId, currentWorkspace.id, updates, user.id);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      activityService.getActivities(currentWorkspace.id).then(setActivities);
      return updated;
    } catch (err) {
      // Revert on failure
      loadWorkspaceData();
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task> => {
    return updateTask(taskId, { status });
  };

  const deleteTask = async (taskId: string) => {
    if (!currentWorkspace || !user) return;
    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await taskService.deleteTask(taskId, currentWorkspace.id, user.id);
      activityService.getActivities(currentWorkspace.id).then(setActivities);
    } catch (err) {
      loadWorkspaceData();
      throw err;
    }
  };

  const inviteMember = async (email: string, role: WorkspaceRole) => {
    if (!currentWorkspace || !user) return;
    const newMember = await memberService.inviteMember({
      workspaceId: currentWorkspace.id,
      workspaceName: currentWorkspace.name,
      email,
      role,
      inviterId: user.id,
    });
    setMembers(prev => [...prev, newMember]);
    activityService.getActivities(currentWorkspace.id).then(setActivities);
  };

  const updateMemberRole = async (memberId: string, role: WorkspaceRole) => {
    if (!currentWorkspace || !user) return;
    await memberService.updateRole(currentWorkspace.id, memberId, role, user.id);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
  };

  const removeMember = async (memberId: string) => {
    if (!currentWorkspace || !user) return;
    await memberService.removeMember(currentWorkspace.id, memberId, user.id);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentRole,
        projects,
        currentProject,
        tasks,
        members,
        activities,
        notifications,
        unreadNotificationCount,
        loading,
        filter,
        setFilter,
        globalSearchQuery,
        setGlobalSearchQuery,
        setCurrentWorkspace,
        setCurrentProject,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        inviteMember,
        updateMemberRole,
        removeMember,
        markNotificationRead,
        markAllNotificationsRead,
        refreshAll: loadWorkspaceData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
