-- ==============================================================================
-- PROJECT MANAGEMENT SAAS - COMPLETE POSTGRESQL SCHEMA (SUPABASE)
-- ==============================================================================
-- This schema provisions all tables, foreign keys, indexes, triggers,
-- and Row-Level Security (RLS) policies for multi-tenant workspace isolation.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Tables (if re-running)
-- DROP TABLE IF EXISTS public.activities CASCADE;
-- DROP TABLE IF EXISTS public.comments CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.tasks CASCADE;
-- DROP TABLE IF EXISTS public.projects CASCADE;
-- DROP TABLE IF EXISTS public.workspace_members CASCADE;
-- DROP TABLE IF EXISTS public.workspaces CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- TABLE: PROFILES (User Profiles synchronized with Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- TABLE: WORKSPACES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- TABLE: WORKSPACE MEMBERS (Roles: owner, admin, member)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    invited_email TEXT,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- ==============================================================================
-- TABLE: PROJECTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
    color TEXT DEFAULT '#4F46E5',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- TABLE: TASKS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- TABLE: TASK COMMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- TABLE: NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- TABLE: ACTIVITIES (Audit Log & Timeline)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g. 'created_task', 'moved_task', 'assigned_task', 'added_comment', 'created_project', 'added_member'
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON public.activities(workspace_id);

-- ==============================================================================
-- HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Function to check if authenticated user belongs to workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = _workspace_id AND user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role in workspace
CREATE OR REPLACE FUNCTION public.get_workspace_role(_workspace_id UUID, _user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. WORKSPACES POLICIES
CREATE POLICY "Users can view workspaces they are members of" 
ON public.workspaces FOR SELECT TO authenticated 
USING (public.is_workspace_member(id, auth.uid()));

CREATE POLICY "Users can create workspaces" 
ON public.workspaces FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and Admins can update workspaces" 
ON public.workspaces FOR UPDATE TO authenticated 
USING (public.get_workspace_role(id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners can delete workspaces" 
ON public.workspaces FOR DELETE TO authenticated 
USING (auth.uid() = owner_id);

-- 3. WORKSPACE MEMBERS POLICIES
CREATE POLICY "Members can view other members in their workspaces" 
ON public.workspace_members FOR SELECT TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Owners and Admins can add members" 
ON public.workspace_members FOR INSERT TO authenticated 
WITH CHECK (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin') OR user_id = auth.uid());

CREATE POLICY "Owners and Admins can update member roles" 
ON public.workspace_members FOR UPDATE TO authenticated 
USING (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners, Admins or the member themselves can delete membership" 
ON public.workspace_members FOR DELETE TO authenticated 
USING (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin') OR user_id = auth.uid());

-- 4. PROJECTS POLICIES
CREATE POLICY "Workspace members can view projects" 
ON public.projects FOR SELECT TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can create projects" 
ON public.projects FOR INSERT TO authenticated 
WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can update projects" 
ON public.projects FOR UPDATE TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Owners and Admins can delete projects" 
ON public.projects FOR DELETE TO authenticated 
USING (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

-- 5. TASKS POLICIES
CREATE POLICY "Workspace members can view tasks" 
ON public.tasks FOR SELECT TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can create tasks" 
ON public.tasks FOR INSERT TO authenticated 
WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can update tasks" 
ON public.tasks FOR UPDATE TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can delete tasks" 
ON public.tasks FOR DELETE TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

-- 6. COMMENTS POLICIES
CREATE POLICY "Task workspace members can view comments" 
ON public.comments FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = comments.task_id AND public.is_workspace_member(t.workspace_id, auth.uid())
    )
);

CREATE POLICY "Task workspace members can create comments" 
ON public.comments FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = comments.task_id AND public.is_workspace_member(t.workspace_id, auth.uid())
    )
);

CREATE POLICY "Users can delete their own comments or workspace admins" 
ON public.comments FOR DELETE TO authenticated 
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = comments.task_id AND public.get_workspace_role(t.workspace_id, auth.uid()) IN ('owner', 'admin')
    )
);

-- 7. NOTIFICATIONS POLICIES
CREATE POLICY "Users can only view their own notifications" 
ON public.notifications FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark read)" 
ON public.notifications FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "System/Users can insert notifications" 
ON public.notifications FOR INSERT TO authenticated 
WITH CHECK (true);

-- 8. ACTIVITIES POLICIES
CREATE POLICY "Workspace members can view activity logs" 
ON public.activities FOR SELECT TO authenticated 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can insert activity logs" 
ON public.activities FOR INSERT TO authenticated 
WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON AUTH.SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon new auth.users insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- AUTO-ADD CREATOR AS WORKSPACE OWNER MEMBER TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();
