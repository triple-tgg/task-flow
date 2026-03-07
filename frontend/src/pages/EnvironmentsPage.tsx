import Sidebar from '../components/Sidebar';
import { Server } from 'lucide-react';

export default function EnvironmentsPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <Server size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                    }}>
                        Coming Soon
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        maxWidth: 400,
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        Environment management is under development. Stay tuned for updates!
                    </p>
                </div>
            </main>
        </div>
    );
}
