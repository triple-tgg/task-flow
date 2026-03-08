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
    Search
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

            <main className="main-content">
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
                        <span className="breadcrumb-current">{projectName}</span>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <span className="breadcrumb-current">Overview</span>
                    </div>
                </div>

                {isProjectLoading ? (
                    <div className="loading-state" style={{ marginTop: '2rem' }}>
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px' }}>

                        {/* Project Header */}
                        <div>
                            <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{currentProject?.name}</h1>
                            {currentProject?.description && (
                                <p className="page-subtitle" style={{ fontSize: '1rem', maxWidth: '800px' }}>
                                    {currentProject.description}
                                </p>
                            )}
                        </div>

                        {/* Stats Section */}
                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h3>Total Tasks</h3>
                                <p className="dashboard-stat">{total}</p>
                            </div>
                            <div className="dashboard-card">
                                <h3>Completed Tasks</h3>
                                <p className="dashboard-stat" style={{ color: '#22c55e' }}>{done}</p>
                                <p className="dashboard-substat">{completionRate}% Completion Rate</p>
                            </div>
                            <div className="dashboard-card">
                                <h3>Overdue Tasks</h3>
                                <p className="dashboard-stat" style={{ color: '#ef4444' }}>{overdue}</p>
                            </div>
                        </div>

                        {/* Vault Accounts Section */}
                        <div className="vault-page" style={{ padding: 0, marginTop: '2rem' }}>
                            <div className="vault-header">
                                <div>
                                    <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Lock size={20} /> Project Vault Accounts
                                    </h2>
                                    <p className="vault-subtitle">Credentials and environment variables linked to this project</p>
                                </div>
                            </div>

                            <div className="vault-filters" style={{ marginTop: '1rem' }}>
                                <div className="vault-search">
                                    <Search size={16} />
                                    <input
                                        placeholder="Search accounts..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {isLoadingAccounts ? (
                                <div className="vault-loading">
                                    <div className="spinner" style={{ width: 32, height: 32 }} />
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="empty-state">
                                    <Key size={48} style={{ opacity: 0.3 }} />
                                    <h3>No Vault Accounts</h3>
                                    <p>There are no vault accounts assigned to this project yet.</p>
                                </div>
                            ) : (
                                <div className="vault-accounts-list">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="vault-account-row" onClick={() => navigate(`/vault/accounts/${acc.id}`)}>
                                            <div className="vault-account-avatar">
                                                {acc.tool?.iconUrl ? (
                                                    <img src={acc.tool.iconUrl} alt={acc.tool.name} style={{ width: 24, height: 24, borderRadius: 4 }} />
                                                ) : acc.accountType === 'PASSWORD' ? <Lock size={18} /> : <Server size={18} />}
                                            </div>
                                            <div className="vault-account-info">
                                                <span className="vault-account-name">
                                                    {acc.name}
                                                    {acc.tool && <span className="vault-type-badge password" style={{ background: '#3b82f620', color: '#93c5fd', border: 'none' }}>{acc.tool.name}</span>}
                                                    <span className={`vault-type-badge ${acc.accountType === 'PASSWORD' ? 'password' : 'environment'}`}>
                                                        {acc.accountType === 'PASSWORD' ? 'Password' : 'Env'}
                                                    </span>
                                                </span>
                                                {acc.username && <span className="vault-account-meta">@{acc.username}</span>}
                                                {acc.email && <span className="vault-account-meta">{acc.email}</span>}
                                                {acc.website && <span className="vault-account-meta">{acc.website}</span>}
                                            </div>
                                            <div className="vault-account-secrets">
                                                <Key size={14} />
                                                <span>{acc._count?.secrets || 0} secret{(acc._count?.secrets || 0) !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="vault-account-actions">
                                                <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
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
