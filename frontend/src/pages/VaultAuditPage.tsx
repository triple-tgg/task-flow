import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { vaultAuditApi } from '../api/vault';
import type { VaultAuditEntry } from '../api/vault';
import { ArrowLeft, Shield, Eye, Plus, Trash2, Edit2, Key } from 'lucide-react';

const ACTION_ICONS: Record<string, typeof Eye> = {
    DECRYPT: Eye,
    CREATE: Plus,
    DELETE: Trash2,
    UPDATE: Edit2,
    VIEW: Eye,
};

const ACTION_COLORS: Record<string, string> = {
    DECRYPT: '#f59e0b',
    CREATE: '#22c55e',
    DELETE: '#ef4444',
    UPDATE: '#6366f1',
    VIEW: '#8b5cf6',
};

export default function VaultAuditPage() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<VaultAuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await vaultAuditApi.list({ page, limit: 30 });
            setEntries(res.data);
            setTotalPages(res.pagination.totalPages);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [page]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="vault-page">
                    <div className="vault-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button className="vault-back-btn" onClick={() => navigate('/environments')}>
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h1 className="vault-title"><Shield size={24} /> Audit Log</h1>
                                <p className="vault-subtitle">Track all vault access and modifications</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="vault-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
                    ) : entries.length === 0 ? (
                        <div className="vault-empty">
                            <Shield size={48} style={{ opacity: 0.3 }} />
                            <p>No audit logs yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="vault-audit-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Entity</th>
                                            <th>Details</th>
                                            <th>IP</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(entry => {
                                            const Icon = ACTION_ICONS[entry.action] || Key;
                                            return (
                                                <tr key={entry.id}>
                                                    <td>
                                                        <span className="vault-audit-action" style={{ color: ACTION_COLORS[entry.action] || '#888' }}>
                                                            <Icon size={14} />
                                                            {entry.action}
                                                        </span>
                                                    </td>
                                                    <td><span className="vault-audit-entity">{entry.entityType}</span></td>
                                                    <td className="vault-audit-meta">
                                                        {entry.metadata ? JSON.stringify(entry.metadata).slice(0, 80) : '—'}
                                                    </td>
                                                    <td className="vault-audit-ip">{entry.ipAddress || '—'}</td>
                                                    <td className="vault-audit-time">{formatDate(entry.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="vault-pagination">
                                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                    <span>Page {page} of {totalPages}</span>
                                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
