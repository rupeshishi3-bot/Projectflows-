import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Avatar } from '../common/Avatar';
import { EmptyState } from '../common/EmptyState';
import { 
  Activity as ActivityIcon, 
  CheckCircle2, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  UserPlus, 
  FolderPlus,
  ArrowRight,
  Clock
} from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { activities, currentWorkspace } = useWorkspace();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created_task':
        return <PlusCircle className="w-4 h-4 text-indigo-600" />;
      case 'completed_task':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'updated_task':
      case 'moved_task':
        return <Edit3 className="w-4 h-4 text-sky-600" />;
      case 'deleted_task':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'invited_member':
        return <UserPlus className="w-4 h-4 text-violet-600" />;
      case 'created_project':
        return <FolderPlus className="w-4 h-4 text-amber-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatActionMessage = (act: any) => {
    const details = act.details || {};
    const name = act.user?.full_name || act.user?.email?.split('@')[0] || 'User';

    switch (act.action) {
      case 'created_task':
        return (
          <span>
            <b>{name}</b> created task <span className="font-semibold text-indigo-600">"{details.task_title}"</span>
          </span>
        );
      case 'completed_task':
        return (
          <span>
            <b>{name}</b> completed task <span className="font-semibold text-emerald-600">"{details.task_title}"</span>
          </span>
        );
      case 'moved_task':
        return (
          <span>
            <b>{name}</b> moved task <span className="font-semibold text-indigo-600">"{details.task_title}"</span> to <b>{details.new_status?.replace('_', ' ')}</b>
          </span>
        );
      case 'updated_task':
        return (
          <span>
            <b>{name}</b> updated task <span className="font-semibold text-slate-800">"{details.task_title}"</span>
          </span>
        );
      case 'deleted_task':
        return (
          <span>
            <b>{name}</b> deleted task <span className="font-semibold text-rose-600">"{details.task_title}"</span>
          </span>
        );
      case 'created_project':
        return (
          <span>
            <b>{name}</b> created project <span className="font-semibold text-amber-600">"{details.project_name}"</span>
          </span>
        );
      case 'invited_member':
        return (
          <span>
            <b>{name}</b> invited <span className="font-semibold text-violet-600">{details.email}</span> as {details.role}
          </span>
        );
      case 'added_comment':
        return (
          <span>
            <b>{name}</b> commented on <span className="font-semibold text-indigo-600">"{details.task_title}"</span>
          </span>
        );
      default:
        return (
          <span>
            <b>{name}</b> performed {act.action.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800">
        <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Workspace Activity Audit Trail</h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Real-time event stream of actions, status changes, and team updates in {currentWorkspace?.name}
        </p>
      </div>

      <div className="bg-zinc-900 rounded-md border border-zinc-800 p-4 shadow-2xs">
        {activities.length === 0 ? (
          <EmptyState
            icon={ActivityIcon}
            title="No activity recorded yet"
            description="Actions taken across tasks, projects, and members will appear here chronologically."
          />
        ) : (
          <div className="relative pl-5 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
            {activities.map(act => (
              <div key={act.id} className="relative flex items-start gap-3 text-xs">
                {/* Timeline node icon */}
                <div className="absolute -left-5 mt-0.5 p-1 rounded-full bg-zinc-950 border border-zinc-800 shadow-xs">
                  {getActionIcon(act.action)}
                </div>

                <div className="flex-1 bg-zinc-950/70 p-2.5 rounded border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={act.user?.full_name || act.user?.email || 'User'} size="xs" />
                    <div className="text-zinc-300 font-sans">
                      {formatActionMessage(act)}
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-500 font-mono shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
