import Sidebar from '../components/Sidebar';
import { ListTodo, Construction } from 'lucide-react';

export default function TasksPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-top-bar">
                    <div>
                        <h1 className="page-title">Tasks</h1>
                        <p className="page-subtitle">View and manage all your tasks in one place.</p>
                    </div>
                </div>
                <div className="coming-soon">
                    <div className="coming-soon-icon">
                        <ListTodo size={48} />
                    </div>
                    <h2>Coming Soon</h2>
                    <p>Tasks list view is under development. Stay tuned!</p>
                    <div className="coming-soon-badge">
                        <Construction size={14} />
                        <span>In Development</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
