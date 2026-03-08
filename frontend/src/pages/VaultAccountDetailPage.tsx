import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { vaultAccountsApi, vaultSecretsApi } from '../api/vault';
import type { VaultAccount, VaultSecret } from '../api/vault';
import { ArrowLeft, Plus, Eye, EyeOff, Copy, Trash2, Edit2, X, Key, Check, Shield, Lock, Server } from 'lucide-react';

export default function VaultAccountDetailPage() {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const [account, setAccount] = useState<VaultAccount | null>(null);
    const [secrets, setSecrets] = useState<VaultSecret[]>([]);
    const [loading, setLoading] = useState(true);
    const [decrypted, setDecrypted] = useState<Record<string, string>>({});
    const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showAddSecret, setShowAddSecret] = useState(false);
    const [editSecretId, setEditSecretId] = useState<string | null>(null);

    // For PASSWORD accounts: key, value, note — key is one of USERNAME, EMAIL, PASSWORD
    // For ENVIRONMENT accounts: key (user-entered), value, note
    const [secretForm, setSecretForm] = useState({ key: '', value: '', note: '' });
    const hideTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const isPassword = account?.accountType === 'PASSWORD';

    const fetchData = async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const acc = await vaultAccountsApi.getById(accountId);
            setAccount(acc);
            setSecrets(acc.secrets || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); return () => { Object.values(hideTimers.current).forEach(clearTimeout); }; }, [accountId]);

    const handleReveal = async (secretId: string) => {
        if (visibleIds.has(secretId)) {
            setVisibleIds(prev => { const n = new Set(prev); n.delete(secretId); return n; });
            return;
        }
        try {
            const res = await vaultSecretsApi.decrypt(secretId);
            setDecrypted(prev => ({ ...prev, [secretId]: res.value }));
            setVisibleIds(prev => new Set(prev).add(secretId));
            if (hideTimers.current[secretId]) clearTimeout(hideTimers.current[secretId]);
            hideTimers.current[secretId] = setTimeout(() => {
                setVisibleIds(prev => { const n = new Set(prev); n.delete(secretId); return n; });
            }, 60000);
        } catch (err) { console.error('Failed to decrypt', err); }
    };

    const handleCopy = async (secretId: string) => {
        let value = decrypted[secretId];
        if (!value) {
            const res = await vaultSecretsApi.decrypt(secretId);
            value = res.value;
            setDecrypted(prev => ({ ...prev, [secretId]: value }));
        }
        navigator.clipboard.writeText(value);
        setCopiedId(secretId);
        setTimeout(() => setCopiedId(null), 2000);
        setTimeout(() => navigator.clipboard.writeText(''), 30000);
    };

    const handleAddSecret = async () => {
        if (!secretForm.key.trim() || !secretForm.value.trim() || !accountId) return;
        try {
            await vaultSecretsApi.create(accountId, {
                key: secretForm.key.trim(),
                value: secretForm.value.trim(),
                note: secretForm.note.trim() || undefined,
            });
            setShowAddSecret(false);
            setSecretForm({ key: '', value: '', note: '' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleUpdateSecret = async () => {
        if (!editSecretId || !secretForm.value.trim()) return;
        try {
            await vaultSecretsApi.update(editSecretId, {
                value: secretForm.value.trim(),
                note: secretForm.note.trim() || undefined,
            });
            setEditSecretId(null);
            setSecretForm({ key: '', value: '', note: '' });
            setDecrypted(prev => { const n = { ...prev }; delete n[editSecretId]; return n; });
            setVisibleIds(prev => { const n = new Set(prev); n.delete(editSecretId); return n; });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteSecret = async (id: string) => {
        if (!confirm('Delete this secret?')) return;
        try { await vaultSecretsApi.remove(id); fetchData(); }
        catch (err) { console.error(err); }
    };

    const openEditSecret = (secret: VaultSecret) => {
        setEditSecretId(secret.id);
        setSecretForm({ key: secret.key, value: '', note: secret.note || '' });
    };

    // For Password accounts, provide fixed key options
    const PASSWORD_KEYS = ['USERNAME', 'EMAIL', 'PASSWORD'];

    const openAddForPassword = (key: string) => {
        setShowAddSecret(true);
        setSecretForm({ key, value: '', note: '' });
    };

    const getSecretByKey = (key: string) => secrets.find(s => s.key === key);

    // UI label for secret key
    const keyLabel = (key: string) => {
        const map: Record<string, string> = { USERNAME: 'Username', EMAIL: 'Email', PASSWORD: 'Password' };
        return map[key] || key;
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="vault-page">
                    <div className="vault-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button className="vault-back-btn" onClick={() => account?.toolId ? navigate(`/vault/tools/${account.toolId}`) : navigate('/vault')}>
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h1 className="vault-title">
                                    {isPassword ? <Lock size={20} /> : <Server size={20} />}
                                    {account?.name || 'Loading...'}
                                    {account && (
                                        <span className={`vault-type-badge ${isPassword ? 'password' : 'environment'}`}>
                                            {isPassword ? 'Password' : 'Env'}
                                        </span>
                                    )}
                                </h1>
                                <p className="vault-subtitle">
                                    {account?.tool?.name && `${account.tool.name} · `}
                                    {account?.username && `@${account.username} · `}
                                    {account?.email || ''}
                                    {account?.website && ` · ${account.website}`}
                                </p>
                            </div>
                        </div>
                        {!isPassword && (
                            <button className="btn-primary" onClick={() => { setShowAddSecret(true); setSecretForm({ key: '', value: '', note: '' }); }}>
                                <Plus size={16} /> Add Secret
                            </button>
                        )}
                    </div>

                    {account?.note && (
                        <div className="vault-note"><p>{account.note}</p></div>
                    )}

                    {loading ? (
                        <div className="vault-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
                    ) : isPassword ? (
                        /* ─── PASSWORD ACCOUNT: Structured View ─── */
                        <div className="vault-secrets-list">
                            {PASSWORD_KEYS.map(pkey => {
                                const secret = getSecretByKey(pkey);
                                return (
                                    <div key={pkey} className="vault-secret-row">
                                        <div className="vault-secret-key">
                                            <Key size={14} />
                                            <span>{keyLabel(pkey)}</span>
                                        </div>
                                        <div className="vault-secret-value">
                                            {secret ? (
                                                visibleIds.has(secret.id)
                                                    ? <code>{decrypted[secret.id] || '...'}</code>
                                                    : <code className="masked">••••••••••••</code>
                                            ) : (
                                                <span className="vault-not-set">Not set</span>
                                            )}
                                        </div>
                                        <div className="vault-secret-actions">
                                            {secret ? (
                                                <>
                                                    <button className="vault-icon-btn" onClick={() => handleReveal(secret.id)} title={visibleIds.has(secret.id) ? 'Hide' : 'Reveal'}>
                                                        {visibleIds.has(secret.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                    <button className="vault-icon-btn" onClick={() => handleCopy(secret.id)} title="Copy">
                                                        {copiedId === secret.id ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                                                    </button>
                                                    <button className="vault-icon-btn" onClick={() => openEditSecret(secret)} title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="vault-icon-btn" onClick={() => handleDeleteSecret(secret.id)} title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="vault-icon-btn vault-add-inline" onClick={() => openAddForPassword(pkey)} title={`Add ${keyLabel(pkey)}`}>
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Show any extra secrets not in PASSWORD_KEYS */}
                            {secrets.filter(s => !PASSWORD_KEYS.includes(s.key)).map(secret => (
                                <div key={secret.id} className="vault-secret-row">
                                    <div className="vault-secret-key"><Key size={14} /><span>{secret.key}</span></div>
                                    <div className="vault-secret-value">
                                        {visibleIds.has(secret.id) ? <code>{decrypted[secret.id] || '...'}</code> : <code className="masked">••••••••••••</code>}
                                    </div>
                                    <div className="vault-secret-actions">
                                        <button className="vault-icon-btn" onClick={() => handleReveal(secret.id)}>{visibleIds.has(secret.id) ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                        <button className="vault-icon-btn" onClick={() => handleCopy(secret.id)}>{copiedId === secret.id ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}</button>
                                        <button className="vault-icon-btn" onClick={() => openEditSecret(secret)}><Edit2 size={14} /></button>
                                        <button className="vault-icon-btn" onClick={() => handleDeleteSecret(secret.id)}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : secrets.length === 0 ? (
                        /* ─── ENVIRONMENT ACCOUNT: Empty State ─── */
                        <div className="vault-empty">
                            <Shield size={48} style={{ opacity: 0.3 }} />
                            <p>No secrets stored. Add your first environment variable.</p>
                        </div>
                    ) : (
                        /* ─── ENVIRONMENT ACCOUNT: Key-Value List ─── */
                        <div className="vault-secrets-list">
                            {secrets.map(secret => (
                                <div key={secret.id} className="vault-secret-row">
                                    <div className="vault-secret-key"><Key size={14} /><span>{secret.key}</span></div>
                                    <div className="vault-secret-value">
                                        {visibleIds.has(secret.id) ? <code>{decrypted[secret.id] || '...'}</code> : <code className="masked">••••••••••••</code>}
                                    </div>
                                    {secret.note && <span className="vault-secret-note">{secret.note}</span>}
                                    <div className="vault-secret-actions">
                                        <button className="vault-icon-btn" onClick={() => handleReveal(secret.id)} title={visibleIds.has(secret.id) ? 'Hide' : 'Reveal'}>
                                            {visibleIds.has(secret.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button className="vault-icon-btn" onClick={() => handleCopy(secret.id)} title="Copy">
                                            {copiedId === secret.id ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                                        </button>
                                        <button className="vault-icon-btn" onClick={() => openEditSecret(secret)} title="Edit"><Edit2 size={14} /></button>
                                        <button className="vault-icon-btn" onClick={() => handleDeleteSecret(secret.id)} title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add/Edit Secret Modal */}
                {(showAddSecret || editSecretId) && (
                    <div className="vault-modal-overlay" onClick={() => { setShowAddSecret(false); setEditSecretId(null); }}>
                        <div className="vault-modal" onClick={e => e.stopPropagation()}>
                            <div className="vault-modal-header">
                                <h2>{editSecretId ? 'Update Secret' : 'Add Secret'}</h2>
                                <button onClick={() => { setShowAddSecret(false); setEditSecretId(null); }}><X size={18} /></button>
                            </div>
                            <div className="vault-modal-body">
                                {/* Key field */}
                                {!editSecretId && !isPassword && (
                                    <>
                                        <label>Key *</label>
                                        <input
                                            value={secretForm.key}
                                            onChange={e => setSecretForm({ ...secretForm, key: e.target.value.toUpperCase() })}
                                            placeholder="e.g. API_KEY, TOKEN, DATABASE_URL"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </>
                                )}
                                {(editSecretId || isPassword) && (
                                    <>
                                        <label>Key</label>
                                        <input value={keyLabel(secretForm.key)} disabled style={{ opacity: 0.6 }} />
                                    </>
                                )}

                                <label>Value *</label>
                                <input
                                    type="password"
                                    value={secretForm.value}
                                    onChange={e => setSecretForm({ ...secretForm, value: e.target.value })}
                                    placeholder={editSecretId ? 'Enter new value' : 'Secret value'}
                                />

                                <label>Note</label>
                                <textarea
                                    value={secretForm.note}
                                    onChange={e => setSecretForm({ ...secretForm, note: e.target.value })}
                                    placeholder="Optional note"
                                    rows={2}
                                />
                            </div>
                            <div className="vault-modal-footer">
                                <button className="vault-cancel-btn" onClick={() => { setShowAddSecret(false); setEditSecretId(null); }}>Cancel</button>
                                <button className="btn-primary" onClick={editSecretId ? handleUpdateSecret : handleAddSecret}>
                                    {editSecretId ? 'Update' : 'Add Secret'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
