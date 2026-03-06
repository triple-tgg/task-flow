import Sidebar from '../components/Sidebar';
import { BarChart3, Construction } from 'lucide-react';

export default function GanttPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-top-bar">
                    <div>
                        <h1 className="page-title">Gantt Chart</h1>
                        <p className="page-subtitle">Visualize project timelines and dependencies.</p>
                    </div>
                </div>
                <div className="coming-soon">
                    <div className="coming-soon-icon">
                        <BarChart3 size={48} />
                    </div>
                    <h2>Coming Soon</h2>
                    <p>Gantt chart view is under development. Stay tuned!</p>
                    <div className="coming-soon-badge">
                        <Construction size={14} />
                        <span>In Development</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
