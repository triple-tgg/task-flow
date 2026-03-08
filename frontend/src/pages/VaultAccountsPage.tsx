import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { vaultToolsApi, vaultAccountsApi } from '../api/vault';
import type { VaultTool, VaultAccount } from '../api/vault';
import { Plus, ArrowLeft, User, Trash2, Edit2, X, Key } from 'lucide-react';

export default function VaultAccountsPage() {
    const { toolId } = useParams<{ toolId: string }>();
    const navigate = useNavigate();
    const [tool, setTool] = useState<VaultTool | null>(null);
    const [accounts, setAccounts] = useState<VaultAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', username: '', email: '', note: '' });

    const fetch = async () => {
        if (!toolId) return;
        setLoading(true);
        try {
            const [t, a] = await Promise.all([
                vaultToolsApi.getById(toolId),
                vaultAccountsApi.listByTool(toolId),
            ]);
            setTool(t);
            setAccounts(a.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [toolId]);

    const handleSave = async () => {
        if (!form.name.trim() || !toolId) return;
        try {
            if (editId) {
                await vaultAccountsApi.update(editId, form);
            } else {
                await vaultAccountsApi.create(toolId, form);
            }
            setShowModal(false);
            setEditId(null);
            setForm({ name: '', username: '', email: '', note: '' });
            fetch();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this account and all its secrets?')) return;
        try { await vaultAccountsApi.remove(id); fetch(); }
        catch (err) { console.error(err); }
    };

    const openEdit = (acc: VaultAccount) => {
        setEditId(acc.id);
        setForm({ name: acc.name, username: acc.username || '', email: acc.email || '', note: acc.note || '' });
        setShowModal(true);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="vault-page">
                    <div className="vault-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button className="vault-back-btn" onClick={() => navigate('/vault')}>
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h1 className="vault-title">{tool?.name || 'Loading...'}</h1>
                                <p className="vault-subtitle">{tool?.category && `${tool.category} · `}{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button className="btn-primary" onClick={() => { setShowModal(true); setEditId(null); setForm({ name: '', username: '', email: '', note: '' }); }}>
                            <Plus size={16} /> Add Account
                        </button>
                    </div>

                    {loading ? (
                        <div className="vault-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
                    ) : accounts.length === 0 ? (
                        <div className="vault-empty">
                            <User size={48} style={{ opacity: 0.3 }} />
                            <p>No accounts yet. Add credentials for {tool?.name}.</p>
                        </div>
                    ) : (
                        <div className="vault-accounts-list">
                            {accounts.map(acc => (
                                <div key={acc.id} className="vault-account-row" onClick={() => navigate(`/vault/accounts/${acc.id}`)}>
                                    <div className="vault-account-avatar">
                                        <User size={18} />
                                    </div>
                                    <div className="vault-account-info">
                                        <span className="vault-account-name">{acc.name}</span>
                                        {acc.username && <span className="vault-account-meta">@{acc.username}</span>}
                                        {acc.email && <span className="vault-account-meta">{acc.email}</span>}
                                    </div>
                                    <div className="vault-account-secrets">
                                        <Key size={14} />
                                        <span>{acc._count.secrets} secret{acc._count.secrets !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="vault-account-actions" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => openEdit(acc)}><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(acc.id)}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showModal && (
                    <div className="vault-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="vault-modal" onClick={e => e.stopPropagation()}>
                            <div className="vault-modal-header">
                                <h2>{editId ? 'Edit Account' : 'Add Account'}</h2>
                                <button onClick={() => setShowModal(false)}><X size={18} /></button>
                            </div>
                            <div className="vault-modal-body">
                                <label>Account Name *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Team Account, Production" />
                                <label>Username</label>
                                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="@username" />
                                <label>Email</label>
                                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                                <label>Note</label>
                                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Optional notes" rows={3} />
                            </div>
                            <div className="vault-modal-footer">
                                <button className="vault-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn-primary" onClick={handleSave}>{editId ? 'Save' : 'Create'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
