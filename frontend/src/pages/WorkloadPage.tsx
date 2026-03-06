import Sidebar from '../components/Sidebar';
import { Users, Construction } from 'lucide-react';

export default function WorkloadPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-top-bar">
                    <div>
                        <h1 className="page-title">Workload</h1>
                        <p className="page-subtitle">Manage team capacity and task distribution.</p>
                    </div>
                </div>
                <div className="coming-soon">
                    <div className="coming-soon-icon">
                        <Users size={48} />
                    </div>
                    <h2>Coming Soon</h2>
                    <p>Workload management is under development. Stay tuned!</p>
                    <div className="coming-soon-badge">
                        <Construction size={14} />
                        <span>In Development</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
