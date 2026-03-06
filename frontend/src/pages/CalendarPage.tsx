import Sidebar from '../components/Sidebar';
import { Calendar, Construction } from 'lucide-react';

export default function CalendarPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-top-bar">
                    <div>
                        <h1 className="page-title">Calendar</h1>
                        <p className="page-subtitle">View tasks and deadlines on a calendar.</p>
                    </div>
                </div>
                <div className="coming-soon">
                    <div className="coming-soon-icon">
                        <Calendar size={48} />
                    </div>
                    <h2>Coming Soon</h2>
                    <p>Calendar view is under development. Stay tuned!</p>
                    <div className="coming-soon-badge">
                        <Construction size={14} />
                        <span>In Development</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
