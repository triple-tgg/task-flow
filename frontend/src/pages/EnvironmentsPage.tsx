import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { vaultToolsApi } from '../api/vault';
import type { VaultTool } from '../api/vault';
import { Plus, Search, Server, Globe, Trash2, Edit2, X } from 'lucide-react';

const CATEGORIES = ['All', 'Design', 'Development', 'Cloud', 'Marketing', 'Communication', 'Analytics', 'Other'];

export default function EnvironmentsPage() {
    const navigate = useNavigate();
    const [tools, setTools] = useState<VaultTool[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editTool, setEditTool] = useState<VaultTool | null>(null);
    const [form, setForm] = useState({ name: '', category: '', website: '', description: '' });

    const fetchTools = async () => {
        setLoading(true);
        try {
            const res = await vaultToolsApi.list({
                search: search || undefined,
                category: activeCategory !== 'All' ? activeCategory.toLowerCase() : undefined,
            });
            setTools(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTools(); }, [search, activeCategory]);

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        try {
            await vaultToolsApi.create({
                name: form.name.trim(),
                category: form.category || undefined,
                website: form.website || undefined,
                description: form.description || undefined,
            });
            setShowCreateModal(false);
            setForm({ name: '', category: '', website: '', description: '' });
            fetchTools();
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async () => {
        if (!editTool || !form.name.trim()) return;
        try {
            await vaultToolsApi.update(editTool.id, {
                name: form.name.trim(),
                category: form.category || undefined,
                website: form.website || undefined,
                description: form.description || undefined,
            });
            setEditTool(null);
            setForm({ name: '', category: '', website: '', description: '' });
            fetchTools();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this tool and all its accounts/secrets?')) return;
        try {
            await vaultToolsApi.remove(id);
            fetchTools();
        } catch (err) { console.error(err); }
    };

    const openEdit = (tool: VaultTool) => {
        setEditTool(tool);
        setForm({ name: tool.name, category: tool.category || '', website: tool.website || '', description: tool.description || '' });
    };

    const isModalOpen = showCreateModal || editTool !== null;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="vault-page">
                    {/* Header */}
                    <div className="vault-header">
                        <div>
                            <h1 className="vault-title">
                                <Server size={24} />
                                Vault
                            </h1>
                            <p className="vault-subtitle">Securely manage your team's credentials and API keys</p>
                        </div>
                        <div className="vault-header-actions">
                            <button className="vault-audit-btn" onClick={() => navigate('/environments/audit')}>
                                Audit Log
                            </button>
                            <button className="btn-primary" onClick={() => { setShowCreateModal(true); setForm({ name: '', category: '', website: '', description: '' }); }}>
                                <Plus size={16} />
                                Add Tool
                            </button>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="vault-filters">
                        <div className="vault-search">
                            <Search size={16} />
                            <input
                                placeholder="Search tools..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="vault-categories">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    className={`vault-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tools Grid */}
                    {loading ? (
                        <div className="vault-loading">
                            <div className="spinner" style={{ width: 32, height: 32 }} />
                        </div>
                    ) : tools.length === 0 ? (
                        <div className="vault-empty">
                            <Server size={48} style={{ opacity: 0.3 }} />
                            <p>No tools found. Add your first tool to get started.</p>
                        </div>
                    ) : (
                        <div className="vault-grid">
                            {tools.map(tool => (
                                <div key={tool.id} className="vault-card" onClick={() => navigate(`/environments/tools/${tool.id}`)}>
                                    <div className="vault-card-header">
                                        <div className="vault-card-icon">
                                            {tool.iconUrl ? <img src={tool.iconUrl} alt="" /> : <Server size={20} />}
                                        </div>
                                        <div className="vault-card-actions" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => openEdit(tool)}><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(tool.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <h3 className="vault-card-name">{tool.name}</h3>
                                    {tool.category && <span className="vault-card-category">{tool.category}</span>}
                                    {tool.description && <p className="vault-card-desc">{tool.description}</p>}
                                    <div className="vault-card-footer">
                                        <span>{tool._count.accounts} account{tool._count.accounts !== 1 ? 's' : ''}</span>
                                        {tool.website && (
                                            <a href={tool.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                                                <Globe size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="vault-modal-overlay" onClick={() => { setShowCreateModal(false); setEditTool(null); }}>
                        <div className="vault-modal" onClick={e => e.stopPropagation()}>
                            <div className="vault-modal-header">
                                <h2>{editTool ? 'Edit Tool' : 'Add Tool'}</h2>
                                <button onClick={() => { setShowCreateModal(false); setEditTool(null); }}><X size={18} /></button>
                            </div>
                            <div className="vault-modal-body">
                                <label>Name *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. AWS, Figma, GitHub" />
                                <label>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c.toLowerCase()}>{c}</option>
                                    ))}
                                </select>
                                <label>Website</label>
                                <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={3} />
                            </div>
                            <div className="vault-modal-footer">
                                <button className="vault-cancel-btn" onClick={() => { setShowCreateModal(false); setEditTool(null); }}>Cancel</button>
                                <button className="btn-primary" onClick={editTool ? handleUpdate : handleCreate}>
                                    {editTool ? 'Save Changes' : 'Create Tool'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
