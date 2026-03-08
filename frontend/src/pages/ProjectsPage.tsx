import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../stores/projectsStore';
import Sidebar from '../components/Sidebar';
import {
    Plus,
    FolderKanban,
    MoreVertical,
    Trash2,
    Edit3,
    X,
    Info,
} from 'lucide-react';

export default function ProjectsPage() {
    const navigate = useNavigate();
    const { projects, isLoading, fetchProjects, createProject, deleteProject, updateProject } = useProjectsStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        try {
            await createProject({ name: newProjectName, description: newProjectDesc });
            setShowCreateModal(false);
            setNewProjectName('');
            setNewProjectDesc('');
        } catch { /* error handled in store */ }
    };

    const handleUpdateProject = async (id: string) => {
        try {
            await updateProject(id, { name: editName, description: editDesc });
            setShowEditModal(null);
        } catch { /* error handled in store */ }
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(id);
        }
    };

    // Get project stats from API data
    const getProjectStats = (project: typeof projects[0]) => {
        const stats = project.taskStats;
        const total = stats?.total ?? project._count?.tasks ?? 0;
        const done = stats?.done ?? 0;
        const overdue = stats?.overdue ?? 0;
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, overdue, completionRate };
    };

    const formatProjectId = (id: string) => {
        return id.substring(0, 8) + '...';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                {/* Page Header */}
                <div className="page-top-bar">
                    <div>
                        <h1 className="page-title">Projects</h1>
                        <p className="page-subtitle">Organize your tasks into projects.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} />
                        New Project
                    </button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="loading-state">
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                    </div>
                )}

                {/* Projects Grid */}
                {!isLoading && (
                    <div className="projects-grid-v2">
                        {projects.map((project) => {
                            const stats = getProjectStats(project);
                            return (
                                <div
                                    key={project.id}
                                    className="project-card-v2"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    {/* Card Header: icon + name + percentage */}
                                    <div className="pcard-header">
                                        <div className="pcard-name">
                                            <FolderKanban size={16} className="pcard-icon" />
                                            <span>{project.name}</span>
                                        </div>
                                        <div className="pcard-actions">
                                            <span className="pcard-pct">{stats.completionRate}%</span>
                                            <div
                                                className="pcard-menu-trigger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === project.id ? null : project.id);
                                                }}
                                            >
                                                <MoreVertical size={14} />
                                            </div>
                                            {activeMenu === project.id && (
                                                <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/projects/${project.id}/overview`);
                                                            setActiveMenu(null);
                                                        }}
                                                    >
                                                        <Info size={14} />
                                                        Overview
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditName(project.name);
                                                            setEditDesc(project.description || '');
                                                            setShowEditModal(project.id);
                                                            setActiveMenu(null);
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                        Edit
                                                    </button>
                                                    {project.myRole === 'owner' && (
                                                        <button
                                                            className="danger"
                                                            onClick={() => {
                                                                handleDeleteProject(project.id);
                                                                setActiveMenu(null);
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="pcard-stats">
                                        <span className="pcard-stat">
                                            <span className="pcard-stat-value done">{stats.done}</span> Done
                                        </span>
                                        <span className="pcard-stat">
                                            <span className="pcard-stat-value overdue">{stats.overdue}</span> Overdue
                                        </span>
                                        <span className="pcard-total">{stats.total} total</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="pcard-progress">
                                        <div
                                            className="pcard-progress-fill"
                                            style={{
                                                width: `${stats.completionRate}%`,
                                                background: stats.completionRate === 100
                                                    ? '#22c55e'
                                                    : stats.completionRate > 0
                                                        ? '#3b82f6'
                                                        : '#6c63ff',
                                            }}
                                        />
                                    </div>

                                    {/* Footer: project ID + date */}
                                    <div className="pcard-footer">
                                        <span className="pcard-id">Project ID: {formatProjectId(project.id)}</span>
                                        <span className="pcard-date">Updated {formatDate(project.updatedAt)}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {projects.length === 0 && !isLoading && (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <FolderKanban size={48} />
                                <h3>No projects yet</h3>
                                <p>Create your first project to get started</p>
                                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} />
                                    Create Project
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Project</h3>
                            <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Project Name</label>
                                <input
                                    type="text"
                                    placeholder="My Awesome Project"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (optional)</label>
                                <textarea
                                    placeholder="What's this project about?"
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCreateProject}
                                disabled={!newProjectName.trim()}
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Project</h3>
                            <button className="btn-icon" onClick={() => setShowEditModal(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Project Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setShowEditModal(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => handleUpdateProject(showEditModal)}
                                disabled={!editName.trim()}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
