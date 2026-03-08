import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../stores/projectsStore';
import { vaultAccountsApi } from '../api/vault';
import type { VaultAccount } from '../api/vault';
import Sidebar from '../components/Sidebar';
import {
    Home,
    ChevronRight,
    FolderKanban,
    Lock,
    Server,
    Key,
    ArrowRight,
    Search,
    ListTodo,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Users
} from 'lucide-react';

export default function ProjectOverviewPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, fetchProject, isLoading: isProjectLoading } = useProjectsStore();

    const [accounts, setAccounts] = useState<VaultAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (projectId) {
            fetchProject(projectId);
        }
    }, [projectId, fetchProject]);

    useEffect(() => {
        if (projectId) {
            setIsLoadingAccounts(true);
            vaultAccountsApi.listByProject(projectId, { search: search || undefined })
                .then(res => setAccounts(res.data))
                .catch(err => console.error(err))
                .finally(() => setIsLoadingAccounts(false));
        }
    }, [projectId, search]);

    const projectName = currentProject?.name || 'Loading Project...';

    // Calculate sum stats
    const stats = currentProject?.taskStats;
    const total = stats?.total ?? currentProject?._count?.tasks ?? 0;
    const done = stats?.done ?? 0;
    const overdue = stats?.overdue ?? 0;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                {/* Breadcrumb + Actions Bar */}
                <div className="project-topbar">
                    <div className="breadcrumb">
                        <button className="breadcrumb-item" onClick={() => navigate('/dashboard')}>
                            <Home size={14} />
                            <span>Dashboard</span>
                        </button>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <button className="breadcrumb-item" onClick={() => navigate('/projects')}>
                            <FolderKanban size={14} />
                            <span>Projects</span>
                        </button>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <button className="breadcrumb-item" onClick={() => navigate(`/projects/${projectId}`)}>
                            <span className="breadcrumb-current">{projectName}</span>
                        </button>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <span className="breadcrumb-current">Overview</span>
                    </div>
                </div>

                {isProjectLoading ? (
                    <div className="loading-state" style={{ marginTop: '2rem' }}>
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                    </div>
                ) : (
                    <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                        {/* Top Section: Hero + KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                            {/* Hero Header */}
                            <div style={{
                                background: 'linear-gradient(145deg, var(--bg-card), rgba(108, 99, 255, 0.05))',
                                borderRadius: '16px',
                                padding: '2rem',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-50px', right: '-50px', background: 'var(--accent-gradient)', width: '200px', height: '200px', borderRadius: '50%', filter: 'blur(80px)', opacity: '0.15' }} />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        borderRadius: '12px',
                                        background: 'var(--accent-gradient)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff',
                                        boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)'
                                    }}>
                                        <FolderKanban size={24} />
                                    </div>
                                    <div>
                                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                            {currentProject?.name}
                                        </h1>
                                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                                            {currentProject?.createdAt && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Calendar size={14} /> Created {new Date(currentProject.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            {currentProject?.members && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Users size={14} /> {currentProject.members.length} Members
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {currentProject?.description && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '800px', marginTop: '0.5rem' }}>
                                        {currentProject.description}
                                    </p>
                                )}

                                {/* Progress Bar overall */}
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Project Completion</span>
                                        <span style={{ color: completionRate === 100 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 700 }}>{completionRate}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${completionRate}%`,
                                            background: completionRate === 100 ? 'var(--success)' : 'var(--accent-gradient)',
                                            transition: 'width 1s ease-in-out',
                                            borderRadius: '4px'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* KPI Task Cards matching Dashboard */}
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                    <ListTodo size={20} style={{ color: 'var(--accent-primary)' }} /> Task Overview
                                </h2>
                                <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', flex: 1, gap: '1rem' }}>
                                    <div className="kpi-card">
                                        <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                                            <ListTodo size={20} style={{ color: '#3b82f6' }} />
                                        </div>
                                        <div className="kpi-info">
                                            <span className="kpi-value">{total}</span>
                                            <span className="kpi-label">Total Tasks</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card">
                                        <div className="kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
                                            <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
                                        </div>
                                        <div className="kpi-info">
                                            <span className="kpi-value" style={{ color: '#22c55e' }}>{done}</span>
                                            <span className="kpi-label">Completed</span>
                                        </div>
                                    </div>
                                    <div className="kpi-card">
                                        <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                                            <AlertCircle size={20} style={{ color: '#ef4444' }} />
                                        </div>
                                        <div className="kpi-info">
                                            <span className="kpi-value" style={{ color: '#ef4444' }}>{overdue}</span>
                                            <span className="kpi-label">Overdue</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vault Accounts Section */}
                        <div className="chart-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Lock size={20} style={{ color: 'var(--warning)' }} /> Vault Credentials
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Secure credentials array linked to the environment</p>
                                </div>

                                <div className="vault-search" style={{ width: '280px', margin: 0 }}>
                                    <Search size={16} />
                                    <input
                                        placeholder="Search accounts..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ background: 'transparent' }}
                                    />
                                </div>
                            </div>

                            {isLoadingAccounts ? (
                                <div className="vault-loading">
                                    <div className="spinner" style={{ width: 32, height: 32 }} />
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="empty-state" style={{ padding: '3rem 0', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                    <Key size={48} style={{ opacity: 0.2 }} />
                                    <h3>No Linked Credentials</h3>
                                    <p>Vault accounts tied to this project will appear here.</p>
                                </div>
                            ) : (
                                <div className="vault-accounts-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem', background: 'transparent', padding: 0 }}>
                                    {accounts.map(acc => (
                                        <div
                                            key={acc.id}
                                            className="vault-account-row"
                                            style={{
                                                border: '1px solid var(--border-subtle)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '12px',
                                                padding: '1.25rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            onClick={() => navigate(`/vault/accounts/${acc.id}`)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '40px', height: '40px',
                                                        borderRadius: '10px',
                                                        background: 'var(--bg-card-hover)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        {acc.tool?.iconUrl ? (
                                                            <img src={acc.tool.iconUrl} alt={acc.tool.name} style={{ width: 24, height: 24, borderRadius: 4 }} />
                                                        ) : acc.accountType === 'PASSWORD' ? <Lock size={20} /> : <Server size={20} />}
                                                    </div>

                                                    <div>
                                                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                                                            {acc.name}
                                                        </span>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {acc.tool?.name || (acc.accountType === 'PASSWORD' ? 'Password Auth' : 'Env Vars')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`vault-type-badge ${acc.accountType === 'PASSWORD' ? 'password' : 'environment'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                                    {acc.accountType === 'PASSWORD' ? 'Password' : 'Env'}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {acc.username && <div><span style={{ opacity: 0.6 }}>Username:</span> <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{acc.username}</span></div>}
                                                {acc.email && <div><span style={{ opacity: 0.6 }}>Email:</span> <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{acc.email}</span></div>}
                                            </div>

                                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    <Key size={14} />
                                                    <span>{acc._count?.secrets || 0} stored keys</span>
                                                </div>
                                                <ArrowRight size={16} style={{ color: 'var(--accent-primary)' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
