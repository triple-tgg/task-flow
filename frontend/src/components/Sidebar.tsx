import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from './ThemeToggle';
import {
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Calendar,
    BarChart3,
    Users,
    LogOut,
    Plus,
} from 'lucide-react';

const MENU_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    { label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { label: 'Calendar', icon: Calendar, path: '/calendar' },
    { label: 'Gantt Chart', icon: BarChart3, path: '/gantt' },
    { label: 'Workload', icon: Users, path: '/workload' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/projects') {
            return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
        }
        if (path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/analytics';
        }
        return location.pathname === path;
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo" onClick={() => navigate('/projects')}>
                <div className="sidebar-logo-icon">
                    <FolderKanban size={18} />
                </div>
                <span className="sidebar-logo-text">TaskFlow</span>
            </div>

            {/* Search + Theme */}
            <div className="sidebar-tools">
                <GlobalSearch />
                <ThemeToggle />
            </div>

            {/* Menu */}
            <nav className="sidebar-nav">
                <span className="sidebar-section-label">MENU</span>
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.path}
                        className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Profile + New Task */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{user?.name}</span>
                        <span className="sidebar-user-email">{user?.email}</span>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
                <button
                    className="sidebar-new-task"
                    onClick={() => navigate('/projects')}
                >
                    <Plus size={16} />
                    New Task
                </button>
            </div>
        </aside>
    );
}
