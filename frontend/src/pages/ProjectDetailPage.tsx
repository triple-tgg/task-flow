import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Clock,
    MessageSquare,
    X,
    ChevronRight,
    FolderKanban,
    Home,
    GripVertical,
    Trash2,
    Save,
    Tag,
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tasksApi } from '../api/tasks';
import type { Task, KanbanBoard } from '../api/tasks';
import { useProjectsStore } from '../stores/projectsStore';
import Sidebar from '../components/Sidebar';
import { TaskAttachments } from '../components/tasks/TaskAttachments';
import RichTextEditor from '../components/RichTextEditor';

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

// ─── Sortable Task Card ────────────────────────────────
function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="kanban-card" onClick={onClick}>
            <div className="kanban-card-drag" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
                <GripVertical size={14} />
            </div>
            <div className="priority-line" style={{ background: PRIORITY_CONFIG[task.priority]?.color }} />

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
                {task._count.comments > 0 && (
                    <span className="meta-item">
                        <MessageSquare size={12} />
                        {task._count.comments}
                    </span>
                )}
                {task.subTasks.length > 0 && (
                    <span className="meta-item">
                        {task.subTasks.filter((s) => s.status === 'done').length}/{task.subTasks.length}
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
    );
}

// ─── Task Card Overlay (for drag preview) ─────────────
function TaskCardOverlay({ task }: { task: Task }) {
    return (
        <div className="kanban-card dragging-overlay">
            <div className="priority-line" style={{ background: PRIORITY_CONFIG[task.priority]?.color }} />
            <h4 className="task-title">{task.title}</h4>
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
    );
}

// ─── Main Page ─────────────────────────────────────────
export default function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, fetchProject } = useProjectsStore();

    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStatus, setCreateStatus] = useState('todo');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Editable sidebar fields
    const [editPriority, setEditPriority] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

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
        if (projectId) fetchProject(projectId);
    }, [fetchBoard, projectId]);

    // When selecting a task, copy editable fields
    const openTaskDetail = (task: Task) => {
        setSelectedTask(task);
        setEditPriority(task.priority);
        setEditDescription(task.description || '');
        setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setTagInput('');
    };

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

    const handleSaveTaskEdits = async () => {
        if (!selectedTask || !projectId) return;
        setIsSaving(true);
        try {
            await tasksApi.update(selectedTask.id, projectId, {
                priority: editPriority,
                description: editDescription,
                dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
            });
            await fetchBoard();
            setSelectedTask({
                ...selectedTask,
                priority: editPriority,
                description: editDescription,
                dueDate: editDueDate ? new Date(editDueDate).toISOString() : selectedTask.dueDate,
            });
        } catch (err) {
            console.error('Failed to update task', err);
        } finally {
            setIsSaving(false);
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

    // ─── DnD Handlers ─────────────────────────────────
    const findColumnForTask = (taskId: string): string | null => {
        if (!board) return null;
        for (const [status, tasks] of Object.entries(board) as [string, Task[]][]) {
            if (tasks.some((t: Task) => t.id === taskId)) return status;
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const col = findColumnForTask(active.id as string);
        if (col && board) {
            const task = board[col as keyof KanbanBoard]?.find((t) => t.id === active.id);
            if (task) setActiveTask(task);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || !board) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeCol = findColumnForTask(activeId);
        // Check if overId is a column name
        const overCol = Object.keys(STATUS_CONFIG).includes(overId) ? overId : findColumnForTask(overId);

        if (!activeCol || !overCol || activeCol === overCol) return;

        // Move task between columns in local state for smooth UX
        setBoard((prev) => {
            if (!prev) return prev;
            const activeTasks = [...(prev[activeCol as keyof KanbanBoard] || [])];
            const overTasks = [...(prev[overCol as keyof KanbanBoard] || [])];
            const taskIndex = activeTasks.findIndex((t) => t.id === activeId);
            if (taskIndex === -1) return prev;

            const [movedTask] = activeTasks.splice(taskIndex, 1);
            movedTask.status = overCol;
            overTasks.push(movedTask);

            return {
                ...prev,
                [activeCol]: activeTasks,
                [overCol]: overTasks,
            };
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over || !board || !projectId) return;

        const activeId = active.id as string;
        const newCol = findColumnForTask(activeId);

        if (newCol) {
            // Persist status change to backend
            const task = board[newCol as keyof KanbanBoard]?.find((t) => t.id === activeId);
            if (task && task.status !== newCol) {
                // already updated locally, now persist
            }
            try {
                await tasksApi.update(activeId, projectId, { status: newCol });
            } catch (err) {
                console.error('Failed to move task', err);
                await fetchBoard(); // rollback
            }
        }
    };

    const totalTasks = board
        ? Object.values(board).reduce((sum, col) => sum + col.length, 0)
        : 0;

    const projectName = currentProject?.name || 'Project';

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Breadcrumb + Actions Bar */}
                <div className="project-topbar">
                    <div className="breadcrumb">
                        <button className="breadcrumb-item" onClick={() => navigate('/dashboard')}>
                            <Home size={14} />
                            <span>Dashboard</span>
                        </button>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <button className="breadcrumb-item" onClick={() => navigate('/dashboard')}>
                            <FolderKanban size={14} />
                            <span>Projects</span>
                        </button>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <span className="breadcrumb-current">{projectName}</span>
                        <span className="breadcrumb-count">{totalTasks} tasks</span>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setCreateStatus('todo');
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus size={16} />
                        Add Task
                    </button>
                </div>

                {/* Kanban Board with DnD */}
                <div className="kanban-container" style={{ flex: 1, overflow: 'auto' }}>
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner" style={{ width: 32, height: 32 }} />
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="kanban-board">
                                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                                    const columnTasks = board?.[status as keyof KanbanBoard] || [];
                                    return (
                                        <div key={status} className="kanban-column" id={status}>
                                            <div className="kanban-column-header">
                                                <div className="kanban-column-title">
                                                    <div className="status-dot" style={{ background: config.color }} />
                                                    <span>{config.label}</span>
                                                    <span className="kanban-count">{columnTasks.length}</span>
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

                                            <SortableContext
                                                items={columnTasks.map((t) => t.id)}
                                                strategy={verticalListSortingStrategy}
                                                id={status}
                                            >
                                                <div className="kanban-cards" data-column={status}>
                                                    {columnTasks.map((task) => (
                                                        <SortableTaskCard
                                                            key={task.id}
                                                            task={task}
                                                            onClick={() => openTaskDetail(task)}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </div>
                                    );
                                })}
                            </div>

                            <DragOverlay>
                                {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>

                {/* Editable Task Detail Sidebar */}
                {selectedTask && (
                    <div className="task-sidebar-overlay" onClick={() => setSelectedTask(null)}>
                        <div className="task-sidebar" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="ts-header">
                                <div className="ts-header-content">
                                    <h3 className="ts-title">{selectedTask.title}</h3>
                                    <div className="ts-badges">
                                        <span
                                            className="ts-status-badge"
                                            style={{
                                                color: STATUS_CONFIG[selectedTask.status]?.color,
                                                borderColor: STATUS_CONFIG[selectedTask.status]?.color,
                                                background: `${STATUS_CONFIG[selectedTask.status]?.color}15`,
                                            }}
                                        >
                                            <span className="ts-badge-dot" style={{ background: STATUS_CONFIG[selectedTask.status]?.color }} />
                                            {STATUS_CONFIG[selectedTask.status]?.label}
                                        </span>
                                        <span
                                            className="ts-priority-badge"
                                            style={{
                                                color: PRIORITY_CONFIG[selectedTask.priority]?.color,
                                                borderColor: PRIORITY_CONFIG[selectedTask.priority]?.color,
                                                background: `${PRIORITY_CONFIG[selectedTask.priority]?.color}15`,
                                            }}
                                        >
                                            {PRIORITY_CONFIG[selectedTask.priority]?.label}
                                        </span>
                                    </div>
                                </div>
                                <button className="ts-close-btn" onClick={() => setSelectedTask(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="ts-body">
                                {/* Properties Grid (2x2) */}
                                <div className="ts-props-grid">
                                    <div className="ts-prop-card">
                                        <label>Status</label>
                                        <select
                                            value={selectedTask.status}
                                            onChange={(e) => handleStatusChange(selectedTask, e.target.value)}
                                        >
                                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key}>{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="ts-prop-card">
                                        <label>Priority</label>
                                        <select
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value)}
                                        >
                                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key}>{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="ts-prop-card">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            value={editDueDate}
                                            onChange={(e) => setEditDueDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="ts-prop-card">
                                        <label>Assignee</label>
                                        <div className="ts-assignee">
                                            {selectedTask.assignee ? (
                                                <>
                                                    <div className="ts-avatar">{selectedTask.assignee.name.charAt(0).toUpperCase()}</div>
                                                    <span>{selectedTask.assignee.name}</span>
                                                </>
                                            ) : (
                                                <span className="ts-unassigned">Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description (Rich Text Editor) */}
                                <div className="ts-section">
                                    <label className="ts-section-label">Description</label>
                                    <RichTextEditor
                                        content={editDescription}
                                        onChange={(html) => setEditDescription(html)}
                                        placeholder="Add a description..."
                                    />
                                </div>

                                {/* Tags */}
                                <div className="ts-section">
                                    <label className="ts-section-label">
                                        <Tag size={12} />
                                        Tags
                                    </label>
                                    <div className="ts-tags">
                                        {selectedTask.tags.map((t) => (
                                            <span key={t.tag.id} className="ts-tag">
                                                {t.tag.name}
                                                <button
                                                    className="ts-tag-remove"
                                                    onClick={async () => {
                                                        if (!projectId) return;
                                                        const newTags = selectedTask.tags
                                                            .filter(tag => tag.tag.id !== t.tag.id)
                                                            .map(tag => tag.tag.name);
                                                        try {
                                                            const updated = await tasksApi.updateTags(selectedTask.id, projectId, newTags);
                                                            setSelectedTask(updated);
                                                            await fetchBoard();
                                                        } catch (err) {
                                                            console.error('Failed to remove tag', err);
                                                        }
                                                    }}
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            className="ts-tag-input"
                                            placeholder="+ Add tag"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && tagInput.trim() && projectId) {
                                                    e.preventDefault();
                                                    const currentTags = selectedTask.tags.map(t => t.tag.name);
                                                    if (currentTags.includes(tagInput.trim())) {
                                                        setTagInput('');
                                                        return;
                                                    }
                                                    try {
                                                        const updated = await tasksApi.updateTags(
                                                            selectedTask.id, projectId, [...currentTags, tagInput.trim()]
                                                        );
                                                        setSelectedTask(updated);
                                                        setTagInput('');
                                                        await fetchBoard();
                                                    } catch (err) {
                                                        console.error('Failed to add tag', err);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Subtasks */}
                                {selectedTask.subTasks.length > 0 && (
                                    <div className="ts-section">
                                        <label className="ts-section-label">
                                            Subtasks ({selectedTask.subTasks.filter(s => s.status === 'done').length}/{selectedTask.subTasks.length})
                                        </label>
                                        <div className="ts-subtasks">
                                            {selectedTask.subTasks.map((sub) => (
                                                <div key={sub.id} className={`ts-subtask ${sub.status === 'done' ? 'completed' : ''}`}>
                                                    <div className={`ts-check ${sub.status === 'done' ? 'checked' : ''}`} />
                                                    <span>{sub.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attachments */}
                                <TaskAttachments taskId={selectedTask.id} />

                                {/* Action Buttons Row */}
                                <div className="ts-action-row">
                                    <button
                                        className="ts-save-btn"
                                        onClick={handleSaveTaskEdits}
                                        disabled={isSaving || (
                                            editPriority === selectedTask.priority &&
                                            editDescription === (selectedTask.description || '') &&
                                            editDueDate === (selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : '')
                                        )}
                                    >
                                        {isSaving ? (
                                            <div className="spinner" style={{ width: 16, height: 16 }} />
                                        ) : (
                                            <>
                                                <Save size={14} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="ts-delete-btn"
                                        onClick={() => handleDeleteTask(selectedTask.id)}
                                    >
                                        <Trash2 size={14} />
                                        Delete Task
                                    </button>
                                </div>
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
                                                <option key={key} value={key}>{cfg.label}</option>
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
                                                <option key={key} value={key}>{cfg.label}</option>
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
            </main>
        </div>
    );
}
