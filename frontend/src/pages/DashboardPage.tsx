import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            padding: '2rem',
        }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem 1.5rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        TaskFlow
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--accent-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Welcome Card */}
            <div style={{
                padding: '2.5rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '0 auto',
            }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(108, 99, 255, 0.1)',
                    border: '2px solid var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <LayoutDashboard size={36} color="var(--accent-primary)" />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Welcome, {user.name}! 🎉
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
                    Your TaskFlow dashboard is ready. Project management features
                    are coming in the next phases.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginTop: '1.5rem',
                }}>
                    {[
                        { label: 'Role', value: user.role },
                        { label: 'Email', value: user.email },
                    ].map((item) => (
                        <div
                            key={item.label}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
