import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Eye, AlertTriangle } from 'lucide-react';
import { publicApi } from '../api/projects';
import type { Task, KanbanBoard } from '../api/tasks';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    todo: { label: 'To Do', color: '#94a3b8' },
    in_progress: { label: 'In Progress', color: '#3b82f6' },
    review: { label: 'Review', color: '#f59e0b' },
    done: { label: 'Done', color: '#22c55e' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    low: { label: 'Low', color: '#64748b' },
    medium: { label: 'Medium', color: '#2563eb' },
    high: { label: 'High', color: '#f59e0b' },
    urgent: { label: 'Urgent', color: '#ef4444' },
};

export default function PublicProjectPage() {
    const { token } = useParams<{ token: string }>();
    const [project, setProject] = useState<{ id: string; name: string; description?: string } | null>(null);
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const load = async () => {
            try {
                const data = await publicApi.getProject(token);
                setProject(data.project);
                setBoard(data.board);
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosErr = err as { response?: { status: number } };
                    if (axiosErr.response?.status === 404) {
                        setError('This shared link is invalid or has been revoked.');
                    } else {
                        setError('Failed to load project.');
                    }
                } else {
                    setError('Failed to load project.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [token]);

    if (isLoading) {
        return (
            <div className="public-project-loading">
                <div className="spinner" style={{ width: 32, height: 32 }} />
                <p>Loading shared project...</p>
            </div>
        );
    }

    if (error || !project || !board) {
        return (
            <div className="public-project-error">
                <AlertTriangle size={48} />
                <h2>Link Not Found</h2>
                <p>{error || 'This shared link is invalid or has been revoked.'}</p>
            </div>
        );
    }

    return (
        <div className="public-project-page">
            {/* Banner */}
            <div className="public-banner">
                <Eye size={16} />
                <span>Read-only view — shared via public link</span>
            </div>

            {/* Header */}
            <div className="public-header">
                <h1>{project.name}</h1>
                {project.description && <p>{project.description}</p>}
            </div>

            {/* Kanban Board */}
            <div className="kanban-container" style={{ flex: 1, overflow: 'auto' }}>
                <div className="kanban-board">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                        const columnTasks = board[status as keyof KanbanBoard] || [];
                        return (
                            <div key={status} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div className="kanban-column-title">
                                        <div className="status-dot" style={{ background: config.color }} />
                                        <span>{config.label}</span>
                                        <span className="kanban-count">{columnTasks.length}</span>
                                    </div>
                                </div>

                                <div className="kanban-cards">
                                    {columnTasks.map((task: Task) => (
                                        <div key={task.id} className="kanban-card public-card">
                                            <div
                                                className="priority-line"
                                                style={{ background: PRIORITY_CONFIG[task.priority]?.color }}
                                            />

                                            {task.tags.length > 0 && (
                                                <div className="task-tags">
                                                    {task.tags.map((t) => (
                                                        <span key={t.tag.id} className="tag-badge">{t.tag.name}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <h4 className="task-title">{task.title}</h4>

                                            {task.description && (
                                                <p className="task-desc">
                                                    {task.description.substring(0, 80)}
                                                    {task.description.length > 80 ? '...' : ''}
                                                </p>
                                            )}

                                            <div className="task-meta">
                                                {task.dueDate && (
                                                    <span className="meta-item">
                                                        <Clock size={12} />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {task.assignee && (
                                                    <span className="meta-item">
                                                        <div className="mini-avatar">{task.assignee.name.charAt(0)}</div>
                                                        {task.assignee.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
