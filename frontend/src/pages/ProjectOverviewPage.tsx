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
    Users,
    Link,
    Plus,
    Trash2,
    ExternalLink,
    Pencil
} from 'lucide-react';
import { accessGroupsApi, type AccessGroup } from '../api/projects';

export default function ProjectOverviewPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, fetchProject, isLoading: isProjectLoading } = useProjectsStore();

    const [accounts, setAccounts] = useState<VaultAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [search, setSearch] = useState('');

    const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);

    // Modal States
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [newLinkName, setNewLinkName] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkDesc, setNewLinkDesc] = useState('');

    // Edit Modal States
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
    const [editGroupId, setEditGroupId] = useState<string | null>(null);
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupDesc, setEditGroupDesc] = useState('');

    const [isEditLinkModalOpen, setIsEditLinkModalOpen] = useState(false);
    const [editLinkGroupId, setEditLinkGroupId] = useState<string | null>(null);
    const [editLinkId, setEditLinkId] = useState<string | null>(null);
    const [editLinkName, setEditLinkName] = useState('');
    const [editLinkUrl, setEditLinkUrl] = useState('');
    const [editLinkDesc, setEditLinkDesc] = useState('');

    const reloadGroups = () => {
        if (!projectId) return;
        setIsLoadingGroups(true);
        accessGroupsApi.list(projectId)
            .then(res => setAccessGroups(res))
            .catch(err => console.error(err))
            .finally(() => setIsLoadingGroups(false));
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !newGroupName.trim()) return;
        try {
            await accessGroupsApi.create(projectId, { name: newGroupName, description: newGroupDesc });
            setNewGroupName('');
            setNewGroupDesc('');
            setIsAddGroupModalOpen(false);
            reloadGroups();
        } catch (error) {
            console.error('Failed to create group:', error);
            alert('Failed to create group');
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!projectId || !confirm('Are you sure you want to delete this group and all its links?')) return;
        try {
            await accessGroupsApi.remove(projectId, groupId);
            reloadGroups();
        } catch (error) {
            console.error('Failed to delete group:', error);
            alert('Failed to delete group');
        }
    };

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !activeGroupId || !newLinkName.trim() || !newLinkUrl.trim()) return;
        try {
            let urlToSave = newLinkUrl;
            if (!/^https?:\/\//i.test(urlToSave)) {
                urlToSave = 'https://' + urlToSave;
            }
            await accessGroupsApi.createLink(projectId, activeGroupId, { name: newLinkName, url: urlToSave, description: newLinkDesc });
            setNewLinkName('');
            setNewLinkUrl('');
            setNewLinkDesc('');
            setIsAddLinkModalOpen(false);
            setActiveGroupId(null);
            reloadGroups();
        } catch (error) {
            console.error('Failed to create link:', error);
            alert('Failed to create link');
        }
    };

    const handleDeleteLink = async (groupId: string, linkId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!projectId || !confirm('Are you sure you want to delete this link?')) return;
        try {
            await accessGroupsApi.removeLink(projectId, groupId, linkId);
            reloadGroups();
        } catch (error) {
            console.error('Failed to delete link:', error);
            alert('Failed to delete link');
        }
    };

    const openEditGroup = (group: AccessGroup) => {
        setEditGroupId(group.id);
        setEditGroupName(group.name);
        setEditGroupDesc(group.description || '');
        setIsEditGroupModalOpen(true);
    };

    const handleEditGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !editGroupId || !editGroupName.trim()) return;
        try {
            await accessGroupsApi.update(projectId, editGroupId, { name: editGroupName, description: editGroupDesc });
            setIsEditGroupModalOpen(false);
            reloadGroups();
        } catch (error) {
            console.error('Failed to update group:', error);
            alert('Failed to update group');
        }
    };

    const openEditLink = (groupId: string, link: { id: string; name: string; url: string; description?: string }) => {
        setEditLinkGroupId(groupId);
        setEditLinkId(link.id);
        setEditLinkName(link.name);
        setEditLinkUrl(link.url);
        setEditLinkDesc(link.description || '');
        setIsEditLinkModalOpen(true);
    };

    const handleEditLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !editLinkGroupId || !editLinkId || !editLinkName.trim() || !editLinkUrl.trim()) return;
        try {
            let urlToSave = editLinkUrl;
            if (!/^https?:\/\//i.test(urlToSave)) urlToSave = 'https://' + urlToSave;
            await accessGroupsApi.updateLink(projectId, editLinkGroupId, editLinkId, { name: editLinkName, url: urlToSave, description: editLinkDesc });
            setIsEditLinkModalOpen(false);
            reloadGroups();
        } catch (error) {
            console.error('Failed to update link:', error);
            alert('Failed to update link');
        }
    };

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

            setIsLoadingGroups(true);
            accessGroupsApi.list(projectId)
                .then(res => setAccessGroups(res))
                .catch(err => console.error(err))
                .finally(() => setIsLoadingGroups(false));
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
                    <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                        {/* ═══ TOP: Hero + KPIs ═══ */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'stretch' }}>
                            {/* Hero Header */}
                            <div style={{
                                background: 'linear-gradient(145deg, var(--bg-card), rgba(108, 99, 255, 0.05))',
                                borderRadius: '14px',
                                padding: '1.75rem 2rem',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-50px', right: '-50px', background: 'var(--accent-gradient)', width: '180px', height: '180px', borderRadius: '50%', filter: 'blur(80px)', opacity: '0.12' }} />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        borderRadius: '10px',
                                        background: 'var(--accent-gradient)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff',
                                        boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
                                        flexShrink: 0
                                    }}>
                                        <FolderKanban size={22} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                                            {currentProject?.name}
                                        </h1>
                                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', alignItems: 'center', marginTop: '4px' }}>
                                            {currentProject?.createdAt && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Calendar size={12} /> {new Date(currentProject.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            {currentProject?.members && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Users size={12} /> {currentProject.members.length} Members
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {currentProject?.description && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, zIndex: 1 }}>
                                        {currentProject.description}
                                    </p>
                                )}

                                {/* Progress Bar */}
                                <div style={{ marginTop: '0.5rem', zIndex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Completion</span>
                                        <span style={{ color: completionRate === 100 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 700 }}>{completionRate}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${completionRate}%`,
                                            background: completionRate === 100 ? 'var(--success)' : 'var(--accent-gradient)',
                                            transition: 'width 1s ease-in-out',
                                            borderRadius: '3px'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* KPI Cards */}
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                                {[
                                    { label: 'Total Tasks', value: total, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: <ListTodo size={18} style={{ color: '#3b82f6' }} /> },
                                    { label: 'Completed', value: done, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', icon: <CheckCircle2 size={18} style={{ color: '#22c55e' }} /> },
                                    { label: 'Overdue', value: overdue, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: <AlertCircle size={18} style={{ color: '#ef4444' }} /> },
                                ].map((kpi) => (
                                    <div key={kpi.label} style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '1.25rem 1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        minWidth: '120px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ background: kpi.bg, borderRadius: '10px', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {kpi.icon}
                                        </div>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{kpi.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ═══ BOTTOM: Access Links (left) + Vault (right) ═══ */}
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'start' }}>

                            {/* LEFT — Access Links */}
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '14px',
                                overflow: 'hidden'
                            }}>
                                {/* Section Header */}
                                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                            <Link size={18} style={{ color: 'var(--accent-primary)' }} /> Access Links
                                        </h2>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick links categorized by groups</p>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setIsAddGroupModalOpen(true)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem' }}
                                    >
                                        <Plus size={14} /> Add Group
                                    </button>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '1rem 1.5rem' }}>
                                    {isLoadingGroups ? (
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} />
                                        </div>
                                    ) : accessGroups.length === 0 ? (
                                        <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                                            <Link size={40} style={{ opacity: 0.15, margin: '0 auto' }} />
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>No groups yet. Add one to get started.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {accessGroups.map(group => (
                                                <div key={group.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    {/* Group Header */}
                                                    <div style={{
                                                        padding: '0.75rem 1rem',
                                                        background: 'var(--bg-secondary)',
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }} title={group.description || undefined}>{group.name}</h3>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                                            <button onClick={() => { setActiveGroupId(group.id); setIsAddLinkModalOpen(true); }} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.3rem 0.6rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                                                                <Plus size={12} /> Link
                                                            </button>
                                                            <button onClick={() => openEditGroup(group)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.3rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Edit group">
                                                                <Pencil size={13} />
                                                            </button>
                                                            <button onClick={() => handleDeleteGroup(group.id)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.3rem', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete group">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Links as compact rows */}
                                                    <div>
                                                        {group.links && group.links.length > 0 ? (
                                                            group.links.map((link, idx) => (
                                                                <a
                                                                    key={link.id}
                                                                    href={link.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title={link.description || link.name}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.75rem',
                                                                        padding: '0.6rem 1rem',
                                                                        textDecoration: 'none',
                                                                        borderBottom: idx < group.links.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                                                        transition: 'background 0.15s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                                >
                                                                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '6px', padding: '0.35rem', display: 'flex', flexShrink: 0 }}>
                                                                        <Link size={14} style={{ color: 'var(--accent-primary)' }} />
                                                                    </div>
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{link.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.url}</div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                                                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditLink(group.id, link); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5, padding: '0.15rem', display: 'flex' }} title="Edit link">
                                                                            <Pencil size={13} />
                                                                        </button>
                                                                        <button onClick={(e) => handleDeleteLink(group.id, link.id, e)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.5, padding: '0.15rem', display: 'flex' }} title="Delete link">
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                        <ExternalLink size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                                                                    </div>
                                                                </a>
                                                            ))
                                                        ) : (
                                                            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                                No links yet
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT — Vault Credentials */}
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '14px',
                                overflow: 'hidden'
                            }}>
                                {/* Section Header */}
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                            <Lock size={18} style={{ color: 'var(--warning)' }} /> Vault
                                        </h2>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                                            {accounts.length} accounts
                                        </span>
                                    </div>
                                    <div className="vault-search" style={{ width: '100%', margin: '0.75rem 0 0 0' }}>
                                        <Search size={14} />
                                        <input
                                            placeholder="Search credentials..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{ background: 'transparent', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '0.5rem 0' }}>
                                    {isLoadingAccounts ? (
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} />
                                        </div>
                                    ) : accounts.length === 0 ? (
                                        <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                                            <Key size={40} style={{ opacity: 0.15, margin: '0 auto' }} />
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>No credentials linked</p>
                                        </div>
                                    ) : (
                                        accounts.map(acc => (
                                            <div
                                                key={acc.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s ease',
                                                    borderBottom: '1px solid var(--border-subtle)'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                onClick={() => navigate(`/vault/accounts/${acc.id}`)}
                                            >
                                                <div style={{
                                                    width: '36px', height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'var(--bg-secondary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--text-secondary)',
                                                    flexShrink: 0
                                                }}>
                                                    {acc.tool?.iconUrl ? (
                                                        <img src={acc.tool.iconUrl} alt={acc.tool.name} style={{ width: 20, height: 20, borderRadius: 3 }} />
                                                    ) : acc.accountType === 'PASSWORD' ? <Lock size={16} /> : <Server size={16} />}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{acc.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {acc.tool?.name || (acc.accountType === 'PASSWORD' ? 'Password' : 'Env')} · {acc._count?.secrets || 0} keys
                                                    </div>
                                                </div>
                                                <span className={`vault-type-badge ${acc.accountType === 'PASSWORD' ? 'password' : 'environment'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                                                    {acc.accountType === 'PASSWORD' ? 'Pass' : 'Env'}
                                                </span>
                                                <ArrowRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* ═══ Modal: Add Access Group ═══ */}
            {isAddGroupModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddGroupModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', maxWidth: '480px', width: '90vw' }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(108, 99, 255, 0.05))',
                            padding: '1.5rem 1.75rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '38px', height: '38px',
                                borderRadius: '10px',
                                background: 'var(--accent-gradient)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
                                flexShrink: 0
                            }}>
                                <FolderKanban size={18} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Access Group</h2>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organize your links into a category</p>
                            </div>
                        </div>
                        {/* Body */}
                        <form onSubmit={handleCreateGroup} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Group Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Production Infrastructure"
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    required
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                                <textarea
                                    placeholder="Brief details about this group..."
                                    value={newGroupDesc}
                                    onChange={e => setNewGroupDesc(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                                <button type="button" onClick={() => setIsAddGroupModalOpen(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!newGroupName.trim()} style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Create Group</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ Modal: Add Link ═══ */}
            {isAddLinkModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddLinkModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', maxWidth: '480px', width: '90vw' }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(108, 99, 255, 0.06))',
                            padding: '1.5rem 1.75rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '38px', height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #3b82f6, #6c63ff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                flexShrink: 0
                            }}>
                                <Link size={18} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add New Link</h2>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add an external resource to this group</p>
                            </div>
                        </div>
                        {/* Body */}
                        <form onSubmit={handleCreateLink} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Link Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. AWS Console"
                                    value={newLinkName}
                                    onChange={e => setNewLinkName(e.target.value)}
                                    required
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>URL <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="https://console.aws.amazon.com"
                                    value={newLinkUrl}
                                    onChange={e => setNewLinkUrl(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                                <textarea
                                    placeholder="What is this link used for?"
                                    value={newLinkDesc}
                                    onChange={e => setNewLinkDesc(e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                                <button type="button" onClick={() => setIsAddLinkModalOpen(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!newLinkName.trim() || !newLinkUrl.trim()} style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Add Link</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ Modal: Edit Group ═══ */}
            {isEditGroupModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditGroupModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', maxWidth: '480px', width: '90vw' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(108, 99, 255, 0.05))',
                            padding: '1.5rem 1.75rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)', flexShrink: 0 }}>
                                <Pencil size={18} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Group</h2>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update group name or description</p>
                            </div>
                        </div>
                        <form onSubmit={handleEditGroup} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Group Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input type="text" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} required autoFocus style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                                <textarea value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                                <button type="button" onClick={() => setIsEditGroupModalOpen(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!editGroupName.trim()} style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ Modal: Edit Link ═══ */}
            {isEditLinkModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditLinkModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', maxWidth: '480px', width: '90vw' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(108, 99, 255, 0.06))',
                            padding: '1.5rem 1.75rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6c63ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', flexShrink: 0 }}>
                                <Pencil size={18} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Link</h2>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update link details</p>
                            </div>
                        </div>
                        <form onSubmit={handleEditLink} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Link Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input type="text" value={editLinkName} onChange={e => setEditLinkName(e.target.value)} required autoFocus style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>URL <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input type="text" value={editLinkUrl} onChange={e => setEditLinkUrl(e.target.value)} required style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                                <textarea value={editLinkDesc} onChange={e => setEditLinkDesc(e.target.value)} rows={2} style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                                <button type="button" onClick={() => setIsEditLinkModalOpen(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!editLinkName.trim() || !editLinkUrl.trim()} style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
