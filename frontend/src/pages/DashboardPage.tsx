import { useState, useEffect } from 'react';
import {
    ListTodo,
    Clock,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    FolderKanban,
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import Sidebar from '../components/Sidebar';

interface DashboardStats {
    overview: {
        totalProjects: number;
        totalTasks: number;
        myAssignedTasks: number;
        overdueTasks: number;
        completionRate: number;
    };
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
    recentTasks: Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        project: { name: string };
        createdAt: string;
    }>;
}

interface TrendDay {
    date: string;
    created: number;
    completed: number;
}

const STATUS_LABELS: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
};

const STATUS_COLORS: Record<string, string> = {
    todo: '#64748b',
    in_progress: '#3b82f6',
    review: '#f59e0b',
    done: '#22c55e',
};

const PRIORITY_LABELS: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: '#64748b',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [trend, setTrend] = useState<TrendDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashData, trendData] = await Promise.all([
                    analyticsApi.getDashboard(),
                    analyticsApi.getTrend(),
                ]);
                setStats(dashData);
                setTrend(trendData);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate max value for chart scaling
    const trendMax = Math.max(1, ...trend.map((d) => Math.max(d.created, d.completed)));

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-top-bar">
                    <div>
                        <h1 className="page-title">Analytics</h1>
                        <p className="page-subtitle">Overview of your workspace performance.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                    </div>
                ) : stats ? (
                    <>
                        {/* KPI Cards */}
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: 'rgba(108, 99, 255, 0.12)' }}>
                                    <FolderKanban size={20} style={{ color: '#6c63ff' }} />
                                </div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{stats.overview.totalProjects}</span>
                                    <span className="kpi-label">Projects</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                                    <ListTodo size={20} style={{ color: '#3b82f6' }} />
                                </div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{stats.overview.totalTasks}</span>
                                    <span className="kpi-label">Total Tasks</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
                                    <TrendingUp size={20} style={{ color: '#22c55e' }} />
                                </div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{stats.overview.completionRate}%</span>
                                    <span className="kpi-label">Completion</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                                    <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                                </div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{stats.overview.overdueTasks}</span>
                                    <span className="kpi-label">Overdue</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                                    <Clock size={20} style={{ color: '#f59e0b' }} />
                                </div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{stats.overview.myAssignedTasks}</span>
                                    <span className="kpi-label">Assigned to Me</span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="charts-row">
                            {/* Tasks by Status */}
                            <div className="chart-card">
                                <h3 className="chart-title">Tasks by Status</h3>
                                <div className="horizontal-bars">
                                    {Object.entries(stats.tasksByStatus).map(([status, count]) => {
                                        const total = stats.overview.totalTasks || 1;
                                        const pct = Math.round((count / total) * 100);
                                        return (
                                            <div key={status} className="bar-row">
                                                <span className="bar-label">{STATUS_LABELS[status]}</span>
                                                <div className="bar-track">
                                                    <div
                                                        className="bar-fill"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: STATUS_COLORS[status],
                                                        }}
                                                    />
                                                </div>
                                                <span className="bar-value">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tasks by Priority */}
                            <div className="chart-card">
                                <h3 className="chart-title">Tasks by Priority</h3>
                                <div className="donut-container">
                                    <svg viewBox="0 0 120 120" className="donut-chart">
                                        {(() => {
                                            const total = Object.values(stats.tasksByPriority).reduce(
                                                (a, b) => a + b,
                                                0,
                                            );
                                            if (total === 0) {
                                                return (
                                                    <circle
                                                        cx="60"
                                                        cy="60"
                                                        r="45"
                                                        fill="none"
                                                        stroke="rgba(255,255,255,0.06)"
                                                        strokeWidth="12"
                                                    />
                                                );
                                            }
                                            let offset = 0;
                                            const circumference = 2 * Math.PI * 45;
                                            return Object.entries(stats.tasksByPriority).map(
                                                ([priority, count]) => {
                                                    const pct = count / total;
                                                    const dash = pct * circumference;
                                                    const gap = circumference - dash;
                                                    const el = (
                                                        <circle
                                                            key={priority}
                                                            cx="60"
                                                            cy="60"
                                                            r="45"
                                                            fill="none"
                                                            stroke={PRIORITY_COLORS[priority]}
                                                            strokeWidth="12"
                                                            strokeDasharray={`${dash} ${gap}`}
                                                            strokeDashoffset={-offset}
                                                            style={{ transition: 'all 0.5s ease' }}
                                                        />
                                                    );
                                                    offset += dash;
                                                    return el;
                                                },
                                            );
                                        })()}
                                        <text
                                            x="60"
                                            y="56"
                                            textAnchor="middle"
                                            fill="var(--text-primary)"
                                            fontSize="18"
                                            fontWeight="700"
                                        >
                                            {stats.overview.totalTasks}
                                        </text>
                                        <text
                                            x="60"
                                            y="72"
                                            textAnchor="middle"
                                            fill="var(--text-muted)"
                                            fontSize="9"
                                        >
                                            total
                                        </text>
                                    </svg>
                                    <div className="donut-legend">
                                        {Object.entries(stats.tasksByPriority).map(([p, count]) => (
                                            <div key={p} className="legend-item">
                                                <span
                                                    className="legend-dot"
                                                    style={{ background: PRIORITY_COLORS[p] }}
                                                />
                                                <span className="legend-label">{PRIORITY_LABELS[p]}</span>
                                                <span className="legend-value">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Completion Trend */}
                        <div className="chart-card trend-card">
                            <h3 className="chart-title">30-Day Trend</h3>
                            <div className="trend-chart">
                                <div className="trend-bars">
                                    {trend.map((d) => (
                                        <div key={d.date} className="trend-day" title={`${d.date}\nCreated: ${d.created}\nCompleted: ${d.completed}`}>
                                            <div className="trend-bar-stack">
                                                <div
                                                    className="trend-bar created"
                                                    style={{
                                                        height: `${(d.created / trendMax) * 100}%`,
                                                    }}
                                                />
                                                <div
                                                    className="trend-bar completed"
                                                    style={{
                                                        height: `${(d.completed / trendMax) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="trend-legend">
                                    <span className="legend-item">
                                        <span className="legend-dot" style={{ background: '#6c63ff' }} />
                                        Created
                                    </span>
                                    <span className="legend-item">
                                        <span className="legend-dot" style={{ background: '#22c55e' }} />
                                        Completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div className="chart-card">
                            <h3 className="chart-title">Recent Tasks (7 days)</h3>
                            <div className="recent-tasks-list">
                                {stats.recentTasks.length === 0 ? (
                                    <p className="text-muted" style={{ padding: '1rem 0' }}>
                                        No tasks created in the last 7 days
                                    </p>
                                ) : (
                                    stats.recentTasks.map((task) => (
                                        <div key={task.id} className="recent-task-row">
                                            <div
                                                className="status-dot"
                                                style={{ background: STATUS_COLORS[task.status] }}
                                            />
                                            <div className="recent-task-info">
                                                <span className="recent-task-title">{task.title}</span>
                                                <span className="recent-task-meta">
                                                    {task.project.name} ·{' '}
                                                    {new Date(task.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span
                                                className="priority-badge"
                                                style={{
                                                    color: PRIORITY_COLORS[task.priority],
                                                    borderColor: PRIORITY_COLORS[task.priority],
                                                }}
                                            >
                                                {PRIORITY_LABELS[task.priority]}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <BarChart3 size={48} />
                        <h3>No data available</h3>
                        <p>Create projects and tasks to see analytics</p>
                    </div>
                )}
            </main>
        </div>
    );
}
