import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Clock,
    MessageSquare,
    X,
} from 'lucide-react';
import { tasksApi } from '../api/tasks';
import type { Task, KanbanBoard } from '../api/tasks';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    todo: { label: 'To Do', color: '#64748b' },
    in_progress: { label: 'In Progress', color: '#2563eb' },
    review: { label: 'Review', color: '#f59e0b' },
    done: { label: 'Done', color: '#22c55e' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    low: { label: 'Low', color: '#64748b' },
    medium: { label: 'Medium', color: '#2563eb' },
    high: { label: 'High', color: '#f59e0b' },
    urgent: { label: 'Urgent', color: '#ef4444' },
};

export default function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStatus, setCreateStatus] = useState('todo');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchBoard = useCallback(async () => {
        if (!projectId) return;
        try {
            const data = await tasksApi.getBoard(projectId);
            setBoard(data);
        } catch (err) {
            console.error('Failed to load board', err);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim() || !projectId) return;
        try {
            await tasksApi.create(projectId, {
                title: newTaskTitle,
                description: newTaskDesc,
                status: createStatus,
                priority: newTaskPriority,
            });
            setShowCreateModal(false);
            setNewTaskTitle('');
            setNewTaskDesc('');
            setNewTaskPriority('medium');
            await fetchBoard();
        } catch (err) {
            console.error('Failed to create task', err);
        }
    };

    const handleStatusChange = async (task: Task, newStatus: string) => {
        if (!projectId) return;
        try {
            await tasksApi.update(task.id, projectId, { status: newStatus });
            await fetchBoard();
            if (selectedTask?.id === task.id) {
                setSelectedTask({ ...task, status: newStatus });
            }
        } catch (err) {
            console.error('Failed to update task', err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!projectId || !confirm('Delete this task?')) return;
        try {
            await tasksApi.remove(taskId, projectId);
            setSelectedTask(null);
            await fetchBoard();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const totalTasks = board
        ? Object.values(board).reduce((sum, col) => sum + col.length, 0)
        : 0;

    return (
        <div className="dashboard-layout">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="logo-text">Project Board</h1>
                    <span className="text-muted" style={{ marginLeft: 8 }}>
                        {totalTasks} tasks
                    </span>
                </div>
                <div className="header-right">
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setCreateStatus('todo');
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus size={18} />
                        Add Task
                    </button>
                </div>
            </header>

            {/* Kanban Board */}
            <main className="kanban-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                    </div>
                ) : (
                    <div className="kanban-board">
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <div key={status} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div className="kanban-column-title">
                                        <div
                                            className="status-dot"
                                            style={{ background: config.color }}
                                        />
                                        <span>{config.label}</span>
                                        <span className="kanban-count">
                                            {board?.[status as keyof KanbanBoard]?.length || 0}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-icon-sm"
                                        onClick={() => {
                                            setCreateStatus(status);
                                            setShowCreateModal(true);
                                        }}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="kanban-cards">
                                    {board?.[status as keyof KanbanBoard]?.map((task) => (
                                        <div
                                            key={task.id}
                                            className="kanban-card"
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            {/* Priority indicator */}
                                            <div
                                                className="priority-line"
                                                style={{ background: PRIORITY_CONFIG[task.priority]?.color }}
                                            />

                                            {/* Tags */}
                                            {task.tags.length > 0 && (
                                                <div className="task-tags">
                                                    {task.tags.map((t) => (
                                                        <span key={t.tag.id} className="tag-badge">
                                                            {t.tag.name}
                                                        </span>
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
                                                {task._count.comments > 0 && (
                                                    <span className="meta-item">
                                                        <MessageSquare size={12} />
                                                        {task._count.comments}
                                                    </span>
                                                )}
                                                {task.subTasks.length > 0 && (
                                                    <span className="meta-item">
                                                        {task.subTasks.filter((s) => s.status === 'done').length}/
                                                        {task.subTasks.length}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="task-footer">
                                                {task.assignee ? (
                                                    <div className="assignee-avatar" title={task.assignee.name}>
                                                        {task.assignee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ) : (
                                                    <div />
                                                )}
                                                <span
                                                    className="priority-badge"
                                                    style={{
                                                        color: PRIORITY_CONFIG[task.priority]?.color,
                                                        borderColor: PRIORITY_CONFIG[task.priority]?.color,
                                                    }}
                                                >
                                                    {PRIORITY_CONFIG[task.priority]?.label}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Task Detail Sidebar */}
            {selectedTask && (
                <div className="task-sidebar-overlay" onClick={() => setSelectedTask(null)}>
                    <div className="task-sidebar" onClick={(e) => e.stopPropagation()}>
                        <div className="sidebar-header">
                            <h3>{selectedTask.title}</h3>
                            <button className="btn-icon" onClick={() => setSelectedTask(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="sidebar-body">
                            {/* Status */}
                            <div className="sidebar-field">
                                <label>Status</label>
                                <select
                                    value={selectedTask.status}
                                    onChange={(e) => handleStatusChange(selectedTask, e.target.value)}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>
                                            {cfg.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div className="sidebar-field">
                                <label>Priority</label>
                                <span
                                    className="priority-badge"
                                    style={{
                                        color: PRIORITY_CONFIG[selectedTask.priority]?.color,
                                        borderColor: PRIORITY_CONFIG[selectedTask.priority]?.color,
                                    }}
                                >
                                    {PRIORITY_CONFIG[selectedTask.priority]?.label}
                                </span>
                            </div>

                            {/* Assignee */}
                            <div className="sidebar-field">
                                <label>Assignee</label>
                                <span>{selectedTask.assignee?.name || 'Unassigned'}</span>
                            </div>

                            {/* Description */}
                            {selectedTask.description && (
                                <div className="sidebar-field">
                                    <label>Description</label>
                                    <p className="text-muted">{selectedTask.description}</p>
                                </div>
                            )}

                            {/* Due Date */}
                            {selectedTask.dueDate && (
                                <div className="sidebar-field">
                                    <label>Due Date</label>
                                    <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}

                            {/* Tags */}
                            {selectedTask.tags.length > 0 && (
                                <div className="sidebar-field">
                                    <label>Tags</label>
                                    <div className="task-tags">
                                        {selectedTask.tags.map((t) => (
                                            <span key={t.tag.id} className="tag-badge">
                                                {t.tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subtasks */}
                            {selectedTask.subTasks.length > 0 && (
                                <div className="sidebar-field">
                                    <label>Subtasks ({selectedTask.subTasks.filter(s => s.status === 'done').length}/{selectedTask.subTasks.length})</label>
                                    {selectedTask.subTasks.map((sub) => (
                                        <div key={sub.id} className="subtask-item">
                                            <span className={sub.status === 'done' ? 'completed' : ''}>
                                                {sub.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Delete */}
                            <button
                                className="btn-danger"
                                onClick={() => handleDeleteTask(selectedTask.id)}
                                style={{ marginTop: 24 }}
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Task</h3>
                            <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Describe this task..."
                                    value={newTaskDesc}
                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={createStatus}
                                        onChange={(e) => setCreateStatus(e.target.value)}
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>
                                                {cfg.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                    >
                                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>
                                                {cfg.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCreateTask}
                                disabled={!newTaskTitle.trim()}
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
