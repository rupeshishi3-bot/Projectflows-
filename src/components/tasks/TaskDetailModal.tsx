import React, { useState, useEffect } from 'react';
import { Task, Comment, TaskPriority, TaskStatus } from '../../types';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { commentService } from '../../services/commentService';
import { Avatar } from '../common/Avatar';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { 
  X, 
  Trash2, 
  Send, 
  Calendar, 
  User, 
  Flag, 
  Folder, 
  CheckSquare, 
  MessageSquare, 
  Clock, 
  Check,
  Edit2
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { user } = useWorkspace();
  const { currentWorkspace, projects, members, updateTask, deleteTask } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee_id || '');
      setProjectId(task.project_id);
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');

      // Load comments
      loadComments(task.id);
    }
  }, [task]);

  const loadComments = async (taskId: string) => {
    try {
      setLoadingComments(true);
      const list = await commentService.getComments(taskId);
      setComments(list);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleUpdateField = async (updates: Partial<Task>) => {
    if (!task) return;
    try {
      await updateTask(task.id, updates);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !currentWorkspace) return;

    try {
      setSavingComment(true);
      const added = await commentService.addComment({
        taskId: task.id,
        workspaceId: currentWorkspace.id,
        userId: user.id,
        content: newComment.trim(),
        taskTitle: task.title,
      });
      setComments(prev => [...prev, added]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-zinc-900 rounded-md shadow-2xl border border-zinc-800 overflow-hidden my-6 max-h-[90vh] flex flex-col font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              {task.project?.name || 'GENERAL'}
            </span>
            <span className="text-zinc-600">•</span>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDeleteTask}
              title="Delete Task"
              className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Info (Left 2 cols) */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-base font-bold text-zinc-100 px-2 py-1 bg-zinc-950 border border-blue-500 rounded focus:outline-none font-sans"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      handleUpdateField({ title });
                    }}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-start justify-between cursor-pointer"
                >
                  <h2 className="text-base font-bold text-zinc-100 group-hover:text-blue-400 transition-colors font-sans">
                    {title}
                  </h2>
                  <Edit2 className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                DESCRIPTION
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={() => handleUpdateField({ description })}
                placeholder="Add a detailed description or requirements..."
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200 leading-relaxed font-sans"
              />
            </div>

            {/* Comments Thread */}
            <div className="pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                DISCUSSION ({comments.length})
              </h3>

              {/* Comment input */}
              <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                <Avatar name={user?.user_metadata?.full_name || 'Me'} size="xs" />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full pl-2.5 pr-8 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-200 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={savingComment || !newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 disabled:opacity-40 p-0.5"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Comment list */}
              {loadingComments ? (
                <p className="text-xs text-zinc-500 font-mono">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono italic">No comments yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {comments.map(c => (
                    <div key={c.id} className="p-2 bg-zinc-950 rounded border border-zinc-800/80 flex items-start justify-between group">
                      <div className="flex items-start gap-2">
                        <Avatar name={c.user?.full_name || c.user?.email || 'User'} size="xs" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-200 font-sans">
                              {c.user?.full_name || c.user?.email || 'User'}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed font-sans">{c.content}</p>
                        </div>
                      </div>

                      {c.user_id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Properties Sidebar (Right 1 col) */}
          <div className="space-y-3 bg-zinc-950/80 p-3 rounded border border-zinc-800 text-xs font-mono">
            
            {/* Status */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1.5 text-[10px]">
                <CheckSquare className="w-3 h-3 text-zinc-500" /> STATUS
              </label>
              <select
                value={status}
                onChange={e => {
                  const s = e.target.value as TaskStatus;
                  setStatus(s);
                  handleUpdateField({ status: s });
                }}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:border-blue-500"
              >
                <option value="todo">TO DO</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="review">REVIEW</option>
                <option value="done">DONE</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1.5 text-[10px]">
                <Flag className="w-3 h-3 text-zinc-500" /> PRIORITY
              </label>
              <select
                value={priority}
                onChange={e => {
                  const p = e.target.value as TaskPriority;
                  setPriority(p);
                  handleUpdateField({ priority: p });
                }}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:border-blue-500"
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
                <option value="urgent">URGENT</option>
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1.5 text-[10px]">
                <Folder className="w-3 h-3 text-zinc-500" /> PROJECT
              </label>
              <select
                value={projectId}
                onChange={e => {
                  const pid = e.target.value;
                  setProjectId(pid);
                  handleUpdateField({ project_id: pid });
                }}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:border-blue-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1.5 text-[10px]">
                <User className="w-3 h-3 text-zinc-500" /> ASSIGNEE
              </label>
              <select
                value={assigneeId}
                onChange={e => {
                  const aid = e.target.value;
                  setAssigneeId(aid);
                  handleUpdateField({ assignee_id: aid || null });
                }}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:border-blue-500"
              >
                <option value="">UNASSIGNED</option>
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profile?.full_name || m.invited_email || 'Member'}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1.5 text-[10px]">
                <Calendar className="w-3 h-3 text-zinc-500" /> DUE DATE
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => {
                  const d = e.target.value;
                  setDueDate(d);
                  handleUpdateField({ due_date: d ? new Date(d).toISOString() : null });
                }}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:border-blue-500 text-xs"
              />
            </div>

            {/* Timestamps */}
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 space-y-0.5">
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Created: {new Date(task.created_at).toLocaleDateString()}
              </div>
              <div>
                Updated: {new Date(task.updated_at).toLocaleDateString()}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
