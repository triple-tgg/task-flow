import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../stores/projectsStore';
import { useAuthStore } from '../stores/authStore';
import GlobalSearch from '../components/GlobalSearch';
import ThemeToggle from '../components/ThemeToggle';
import {
    Plus,
    FolderKanban,
    Users,
    ListTodo,
    LogOut,
    Search,
    MoreVertical,
    Trash2,
    Edit3,
    X,
    BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { projects, isLoading, fetchProjects, createProject, deleteProject, updateProject } = useProjectsStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filteredProjects = projects.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const roleColors: Record<string, string> = {
        owner: '#7c3aed',
        editor: '#2563eb',
        viewer: '#64748b',
    };

    return (
        <div className="dashboard-layout">
            {/* Top Navigation */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="logo-text">
                        <FolderKanban size={24} />
                        TaskFlow
                    </h1>
                    <GlobalSearch />
                </div>
                <div className="header-right">
                    <button className="btn-icon" onClick={() => navigate('/analytics')} title="Analytics">
                        <BarChart3 size={18} />
                    </button>
                    <ThemeToggle />
                    <div className="user-info">
                        <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <span className="user-name">{user?.name}</span>
                    </div>
                    <button className="btn-icon" onClick={handleLogout} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-content">
                    {/* Page Header */}
                    <div className="page-header">
                        <div>
                            <h2>My Projects</h2>
                            <p className="text-muted">
                                {projects.length} project{projects.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            New Project
                        </button>
                    </div>

                    {/* Search */}
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner" style={{ width: 32, height: 32 }} />
                        </div>
                    )}

                    {/* Projects Grid */}
                    {!isLoading && (
                        <div className="projects-grid">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="project-card"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <div className="project-card-header">
                                        <div className="project-card-icon">
                                            <FolderKanban size={20} />
                                        </div>
                                        <div
                                            className="project-menu-trigger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === project.id ? null : project.id);
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </div>
                                        {activeMenu === project.id && (
                                            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
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
                                    <h3 className="project-card-title">{project.name}</h3>
                                    {project.description && (
                                        <p className="project-card-desc">{project.description}</p>
                                    )}
                                    <div className="project-card-meta">
                                        <span className="meta-item">
                                            <ListTodo size={14} />
                                            {project._count?.tasks ?? 0} tasks
                                        </span>
                                        <span className="meta-item">
                                            <Users size={14} />
                                            {project._count?.members ?? 0} members
                                        </span>
                                        <span
                                            className="role-badge"
                                            style={{ background: roleColors[project.myRole] || '#64748b' }}
                                        >
                                            {project.myRole}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {filteredProjects.length === 0 && !isLoading && (
                                <div className="empty-state">
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
                </div>
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
