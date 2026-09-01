import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Project } from '../../types';
import { ProjectStatusBadge } from '../common/Badge';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { EmptyState } from '../common/EmptyState';
import { 
  Folder, 
  Plus, 
  Settings, 
  CheckCircle2, 
  ListTodo, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface ProjectListViewProps {
  onSelectProjectForBoard?: (projectId: string) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ onSelectProjectForBoard }) => {
  const { projects, setCurrentProject, setFilter } = useWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleOpenProjectBoard = (project: Project) => {
    setCurrentProject(project);
    setFilter(prev => ({ ...prev, projectId: project.id }));
    if (onSelectProjectForBoard) {
      onSelectProjectForBoard(project.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-md border border-zinc-800">
        <div>
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Workspace Projects</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Active repositories, pipelines, and trackable milestones
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No projects in this workspace yet"
          description="Create your first project to start organizing tasks, roadmaps, and milestones."
          actionText="Create Project"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map(project => {
            const total = project.task_count || 0;
            const completed = project.completed_task_count || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-zinc-900 rounded-md border border-zinc-800 p-3.5 shadow-2xs hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Color Accent, Status, Settings */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      />
                      <ProjectStatusBadge status={project.status} />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                      className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-colors"
                      title="Project Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed font-sans">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress & Task Stats */}
                <div className="pt-2.5 border-t border-zinc-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <ListTodo className="w-3 h-3 text-zinc-500" />
                      {completed}/{total} tasks
                    </span>
                    <span className="text-blue-400 font-semibold">{progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Open Board Action */}
                  <button
                    onClick={() => handleOpenProjectBoard(project)}
                    className="w-full mt-1.5 py-1.5 px-2.5 text-xs font-mono text-zinc-300 bg-zinc-950 hover:bg-zinc-800 hover:text-zinc-100 border border-zinc-800 rounded transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Kanban Board</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ProjectSettingsModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
      />
    </div>
  );
};
