import React from 'react';
import { TaskStatus, TaskPriority, WorkspaceRole, ProjectStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'orange';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}) => {
  const variantStyles = {
    default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    primary: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    neutral: 'bg-zinc-800/70 text-zinc-400 border-zinc-700/50',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-mono font-medium rounded border',
    sm: 'text-[11px] px-2 py-0.5 font-mono font-medium rounded border',
    md: 'text-xs px-2.5 py-1 font-mono font-medium rounded border',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap leading-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'todo':
      return <Badge variant="neutral" size="xs">TO DO</Badge>;
    case 'in_progress':
      return <Badge variant="primary" size="xs">IN PROGRESS</Badge>;
    case 'review':
      return <Badge variant="warning" size="xs">REVIEW</Badge>;
    case 'done':
      return <Badge variant="success" size="xs">DONE</Badge>;
    default:
      return <Badge size="xs">{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case 'low':
      return <Badge variant="neutral" size="xs">LOW</Badge>;
    case 'medium':
      return <Badge variant="info" size="xs">MED</Badge>;
    case 'high':
      return <Badge variant="orange" size="xs">HIGH</Badge>;
    case 'urgent':
      return <Badge variant="danger" size="xs">URGENT</Badge>;
    default:
      return <Badge size="xs">{priority}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: WorkspaceRole }> = ({ role }) => {
  switch (role) {
    case 'owner':
      return <Badge variant="primary" size="xs">OWNER</Badge>;
    case 'admin':
      return <Badge variant="info" size="xs">ADMIN</Badge>;
    case 'member':
      return <Badge variant="neutral" size="xs">MEMBER</Badge>;
    default:
      return <Badge size="xs">{role}</Badge>;
  }
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  switch (status) {
    case 'active':
      return <Badge variant="success" size="xs">ACTIVE</Badge>;
    case 'completed':
      return <Badge variant="primary" size="xs">COMPLETED</Badge>;
    case 'on_hold':
      return <Badge variant="warning" size="xs">ON HOLD</Badge>;
    case 'archived':
      return <Badge variant="neutral" size="xs">ARCHIVED</Badge>;
    default:
      return <Badge size="xs">{status}</Badge>;
  }
};

