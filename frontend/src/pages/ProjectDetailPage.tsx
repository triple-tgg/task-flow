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
    Link2,
    Maximize2,
    Minimize2,
    Send,
    UserPlus,
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tasksApi, commentsApi } from '../api/tasks';
import type { Task, KanbanBoard } from '../api/tasks';
import { useProjectsStore } from '../stores/projectsStore';
import Sidebar from '../components/Sidebar';
import { TaskAttachments } from '../components/tasks/TaskAttachments';
import RichTextEditor from '../components/RichTextEditor';
import ShareModal from '../components/ShareModal';

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

// ─── Droppable Column Wrapper ──────────────────────────
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className="kanban-cards"
            data-column={id}
            style={{ background: isOver ? 'rgba(108, 99, 255, 0.06)' : undefined, borderRadius: '8px', transition: 'background 150ms ease' }}
        >
            {children}
        </div>
    );
}

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

            {task.description && (() => {
                const plainText = task.description.replace(/<[^>]*>/g, '').trim();
                return plainText ? (
                    <p className="task-desc">
                        {plainText.substring(0, 80)}
                        {plainText.length > 80 ? '...' : ''}
                    </p>
                ) : null;
            })()}

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
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [isProjectPublic, setIsProjectPublic] = useState(false);
    const [comments, setComments] = useState<Array<{ id: string; content: string; createdAt: string; user: { id: string; name: string } }>>([]);
    const [commentText, setCommentText] = useState('');
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'detail' | 'description' | 'comments' | 'activities'>('detail');
    const [isExpanded, setIsExpanded] = useState(false);
    const [todoInput, setTodoInput] = useState('');
    const [editSubTasks, setEditSubTasks] = useState<Array<{ id: string; title: string; status: string; priority: string; _new?: boolean; _deleted?: boolean }>>([]);

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
        setEditSubTasks(task.subTasks.map(s => ({ id: s.id, title: s.title, status: s.status, priority: s.priority })));
        setTagInput('');
        setTodoInput('');
        setCommentText('');
        // Fetch comments
        commentsApi.list(task.id).then((res: { data: typeof comments }) => {
            setComments(res.data || []);
        }).catch(() => setComments([]));
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
            // Save task fields
            await tasksApi.update(selectedTask.id, projectId, {
                priority: editPriority,
                description: editDescription,
                dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
            });

            // Save subtask changes
            const originalIds = new Set(selectedTask.subTasks.map(s => s.id));
            const activeEdits = editSubTasks.filter(s => !s._deleted);

            // Create new subtasks
            for (const sub of activeEdits.filter(s => s._new)) {
                await tasksApi.create(projectId, {
                    title: sub.title,
                    parentId: selectedTask.id,
                } as any);
            }

            // Delete removed subtasks
            for (const sub of editSubTasks.filter(s => s._deleted && originalIds.has(s.id))) {
                await tasksApi.remove(sub.id, projectId);
            }

            // Update toggled subtasks
            for (const sub of activeEdits.filter(s => !s._new && originalIds.has(s.id))) {
                const original = selectedTask.subTasks.find(o => o.id === sub.id);
                if (original && original.status !== sub.status) {
                    await tasksApi.update(sub.id, projectId, { status: sub.status });
                }
            }

            await fetchBoard();
            // Re-fetch task to get updated subtasks with real IDs
            const updatedTask = await tasksApi.getById(selectedTask.id, projectId);
            setSelectedTask(updatedTask);
            setEditSubTasks(updatedTask.subTasks.map((s: any) => ({ id: s.id, title: s.title, status: s.status, priority: s.priority })));
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

        if (!newCol) return;

        try {
            await tasksApi.update(activeId, projectId, { status: newCol });
            await fetchBoard(); // refetch to ensure consistency
        } catch (err) {
            console.error('Failed to move task', err);
            await fetchBoard(); // rollback on error
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
                        <button className="breadcrumb-item" onClick={() => navigate('/projects')}>
                            <FolderKanban size={14} />
                            <span>Projects</span>
                        </button>
                        <ChevronRight size={14} className="breadcrumb-sep" />
                        <span className="breadcrumb-current">{projectName}</span>
                        <span className="breadcrumb-count">{totalTasks} tasks</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => setShowShareModal(true)}
                        >
                            <Link2 size={16} />
                            Share
                        </button>
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
                        {/* <button
                            className="sidebar-new-task"
                            onClick={() => navigate('/projects')}
                        >
                            <Plus size={16} />
                            New Task
                        </button> */}
                    </div>
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
                            collisionDetection={pointerWithin}
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
                                                <DroppableColumn id={status}>
                                                    {columnTasks.map((task) => (
                                                        <SortableTaskCard
                                                            key={task.id}
                                                            task={task}
                                                            onClick={() => openTaskDetail(task)}
                                                        />
                                                    ))}
                                                </DroppableColumn>
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
                        <div className={`task-sidebar ${isExpanded ? 'expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="ts-header">
                                <h2 className="ts-title-lg">{selectedTask.title}</h2>
                                <div className="ts-header-actions">
                                    <button className="ts-expand-btn" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Collapse' : 'Expand'}>
                                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                    <button className="ts-close-btn" onClick={() => { setSelectedTask(null); setIsExpanded(false); }}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="ts-body">

                                {/* Tab Navigation */}
                                <div className="ts-tab-nav">
                                    <button
                                        className={`ts-tab ${sidebarTab === 'detail' ? 'active' : ''}`}
                                        onClick={() => setSidebarTab('detail')}
                                    >
                                        Detail
                                    </button>
                                    <button
                                        className={`ts-tab ${sidebarTab === 'description' ? 'active' : ''}`}
                                        onClick={() => setSidebarTab('description')}
                                    >
                                        Description
                                    </button>
                                    <button
                                        className={`ts-tab ${sidebarTab === 'comments' ? 'active' : ''}`}
                                        onClick={() => setSidebarTab('comments')}
                                    >
                                        Comments {comments.length > 0 && <span className="ts-tab-count">{comments.length}</span>}
                                    </button>
                                    <button
                                        className={`ts-tab ${sidebarTab === 'activities' ? 'active' : ''}`}
                                        onClick={() => setSidebarTab('activities')}
                                    >
                                        Activities
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="ts-tab-content">
                                    {sidebarTab === 'detail' && (
                                        <>
                                            <div className="ts-prop-rows">
                                                <div className="ts-prop-row">
                                                    <span className="ts-prop-label">Priority</span>
                                                    <div className="ts-prop-value">
                                                        <select
                                                            className="ts-inline-select"
                                                            value={editPriority}
                                                            onChange={(e) => setEditPriority(e.target.value)}
                                                        >
                                                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                                                <option key={key} value={key}>{cfg.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="ts-prop-row" style={{ alignItems: 'flex-start' }}>
                                                    <span className="ts-prop-label">Assignees</span>
                                                    <div className="ts-prop-value" style={{ position: 'relative' }}>
                                                        <div className="ts-assignees-chips">
                                                            {(selectedTask.assignees || []).map((a: any) => (
                                                                <div key={a.user.id} className="ts-assignee-chip">
                                                                    <div className="ts-avatar-sm">{a.user.name.charAt(0).toUpperCase()}</div>
                                                                    <span>{a.user.name}</span>
                                                                    <button
                                                                        className="ts-chip-remove"
                                                                        onClick={async () => {
                                                                            if (!projectId) return;
                                                                            await tasksApi.removeAssignee(selectedTask.id, projectId, a.user.id);
                                                                            setSelectedTask({
                                                                                ...selectedTask,
                                                                                assignees: selectedTask.assignees.filter((x: any) => x.user.id !== a.user.id),
                                                                            });
                                                                            await fetchBoard();
                                                                        }}
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                className="ts-add-assignee-btn"
                                                                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                                                            >
                                                                <UserPlus size={14} />
                                                            </button>
                                                        </div>
                                                        {showAssigneeDropdown && (
                                                            <div className="ts-assignee-dropdown">
                                                                {currentProject?.members
                                                                    ?.filter((m: any) => !(selectedTask.assignees || []).some((a: any) => a.user.id === m.user.id))
                                                                    .map((m: any) => (
                                                                        <div
                                                                            key={m.user.id}
                                                                            className="ts-assignee-option"
                                                                            onClick={async () => {
                                                                                if (!projectId) return;
                                                                                await tasksApi.addAssignee(selectedTask.id, projectId, m.user.id);
                                                                                setSelectedTask({
                                                                                    ...selectedTask,
                                                                                    assignees: [...(selectedTask.assignees || []), { user: m.user }],
                                                                                });
                                                                                setShowAssigneeDropdown(false);
                                                                                await fetchBoard();
                                                                            }}
                                                                        >
                                                                            <div className="ts-avatar-sm">{m.user.name.charAt(0).toUpperCase()}</div>
                                                                            <span>{m.user.name}</span>
                                                                        </div>
                                                                    ))}
                                                                {currentProject?.members
                                                                    ?.filter((m: any) => !(selectedTask.assignees || []).some((a: any) => a.user.id === m.user.id))
                                                                    .length === 0 && (
                                                                        <div className="ts-assignee-option" style={{ opacity: 0.5, pointerEvents: 'none' }}>No more members</div>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ts-prop-row">
                                                    <span className="ts-prop-label">Due date</span>
                                                    <div className="ts-prop-value">
                                                        <input
                                                            type="date"
                                                            className="ts-inline-date"
                                                            value={editDueDate}
                                                            onChange={(e) => setEditDueDate(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="ts-prop-row">
                                                    <span className="ts-prop-label">Status</span>
                                                    <div className="ts-prop-value">
                                                        <select
                                                            className="ts-inline-select"
                                                            value={selectedTask.status}
                                                            onChange={(e) => handleStatusChange(selectedTask, e.target.value)}
                                                        >
                                                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                                <option key={key} value={key}>{cfg.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="ts-prop-row">
                                                    <span className="ts-prop-label">Tags</span>
                                                    <div className="ts-prop-value">
                                                        <div className="ts-tags-inline">
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
                                                                className="ts-tag-input-inline"
                                                                placeholder="Add more"
                                                                value={tagInput}
                                                                onChange={(e) => setTagInput(e.target.value)}
                                                                onKeyDown={async (e) => {
                                                                    if (e.key === 'Enter' && tagInput.trim() && projectId) {
                                                                        e.preventDefault();
                                                                        const currentTags = selectedTask.tags.map(t => t.tag.name);
                                                                        if (currentTags.includes(tagInput.trim())) { setTagInput(''); return; }
                                                                        try {
                                                                            const updated = await tasksApi.updateTags(
                                                                                selectedTask.id, projectId, [...currentTags, tagInput.trim()]
                                                                            );
                                                                            setSelectedTask(updated);
                                                                            setTagInput('');
                                                                            await fetchBoard();
                                                                        } catch (err) { console.error('Failed to add tag', err); }
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ts-prop-row">
                                                    <span className="ts-prop-label">Created by</span>
                                                    <div className="ts-prop-value">
                                                        <div className="ts-assignee-chip">
                                                            <div className="ts-avatar-sm">{selectedTask.creator.name.charAt(0).toUpperCase()}</div>
                                                            <span>{selectedTask.creator.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            {editSubTasks.filter(s => !s._deleted).length > 0 && (
                                                <div className="ts-prop-row" style={{ alignItems: 'flex-start', borderBottom: 'none' }}>
                                                    <span className="ts-prop-label">Subtasks</span>
                                                    <div className="ts-prop-value">
                                                        <div className="ts-progress-container">
                                                            <div className="ts-progress-bar">
                                                                <div
                                                                    className="ts-progress-fill"
                                                                    style={{ width: `${Math.round((editSubTasks.filter(s => !s._deleted && s.status === 'done').length / editSubTasks.filter(s => !s._deleted).length) * 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="ts-progress-text">
                                                                {editSubTasks.filter(s => !s._deleted && s.status === 'done').length}/{editSubTasks.filter(s => !s._deleted).length} done
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Attachments */}
                                            <div className="ts-todo-section" style={{ borderTop: 'none' }}>
                                                <TaskAttachments taskId={selectedTask.id} />
                                            </div>
                                        </>
                                    )}
                                    {sidebarTab === 'description' && (
                                        <div className="ts-description-tab">
                                            <RichTextEditor
                                                content={editDescription}
                                                onChange={(html) => setEditDescription(html)}
                                                placeholder="Add a description..."
                                            />

                                            {/* Subtasks Checklist */}
                                            <div className="ts-todo-section">
                                                <div className="ts-todo-header">
                                                    <h4 className="ts-todo-title">Subtasks ({editSubTasks.filter(s => !s._deleted && s.status === 'done').length}/{editSubTasks.filter(s => !s._deleted).length})</h4>
                                                </div>

                                                <div className="ts-todo-list">
                                                    {editSubTasks.filter(s => !s._deleted).map((sub) => (
                                                        <div key={sub.id} className={`ts-todo-item ${sub.status === 'done' ? 'completed' : ''}`}>
                                                            <button
                                                                className={`ts-todo-check ${sub.status === 'done' ? 'checked' : ''}`}
                                                                onClick={() => {
                                                                    const newStatus = sub.status === 'done' ? 'todo' : 'done';
                                                                    setEditSubTasks(editSubTasks.map(s =>
                                                                        s.id === sub.id ? { ...s, status: newStatus } : s
                                                                    ));
                                                                }}
                                                            >
                                                                {sub.status === 'done' && (
                                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <span className="ts-todo-text">{sub.title}</span>
                                                            <span className={`ts-todo-priority ${sub.priority}`}>
                                                                {PRIORITY_CONFIG[sub.priority as keyof typeof PRIORITY_CONFIG]?.label || sub.priority}
                                                            </span>
                                                            <button
                                                                className="ts-todo-delete"
                                                                onClick={() => {
                                                                    if (sub._new) {
                                                                        setEditSubTasks(editSubTasks.filter(s => s.id !== sub.id));
                                                                    } else {
                                                                        setEditSubTasks(editSubTasks.map(s =>
                                                                            s.id === sub.id ? { ...s, _deleted: true } : s
                                                                        ));
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="ts-todo-add">
                                                    <input
                                                        className="ts-todo-input"
                                                        placeholder="Add a subtask..."
                                                        value={todoInput}
                                                        onChange={(e) => setTodoInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && todoInput.trim()) {
                                                                e.preventDefault();
                                                                setEditSubTasks([...editSubTasks, {
                                                                    id: `new-${Date.now()}`,
                                                                    title: todoInput.trim(),
                                                                    status: 'todo',
                                                                    priority: 'medium',
                                                                    _new: true,
                                                                }]);
                                                                setTodoInput('');
                                                            }
                                                        }}
                                                    />
                                                    <Plus size={14} className="ts-todo-add-icon" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {sidebarTab === 'comments' && (
                                        <div className="ts-comments-tab">
                                            <div className="comment-input-row">
                                                <input
                                                    className="comment-input"
                                                    placeholder="Write a comment..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter' && commentText.trim() && !isSendingComment) {
                                                            e.preventDefault();
                                                            setIsSendingComment(true);
                                                            try {
                                                                await commentsApi.create(selectedTask.id, commentText.trim());
                                                                setCommentText('');
                                                                const res = await commentsApi.list(selectedTask.id);
                                                                setComments(res.data || []);
                                                            } catch (err) { console.error('Failed to post comment', err); }
                                                            finally { setIsSendingComment(false); }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    className="comment-send-btn"
                                                    disabled={!commentText.trim() || isSendingComment}
                                                    onClick={async () => {
                                                        if (!commentText.trim() || isSendingComment) return;
                                                        setIsSendingComment(true);
                                                        try {
                                                            await commentsApi.create(selectedTask.id, commentText.trim());
                                                            setCommentText('');
                                                            const res = await commentsApi.list(selectedTask.id);
                                                            setComments(res.data || []);
                                                        } catch (err) { console.error('Failed to post comment', err); }
                                                        finally { setIsSendingComment(false); }
                                                    }}
                                                >
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                            {comments.length > 0 && (
                                                <div className="comment-list">
                                                    {comments.map((c) => (
                                                        <div key={c.id} className="comment-item">
                                                            <div className="comment-header">
                                                                <div className="comment-avatar">{c.user.name.charAt(0).toUpperCase()}</div>
                                                                <div className="comment-meta">
                                                                    <span className="comment-author">{c.user.name}</span>
                                                                    <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <button className="comment-delete-btn"
                                                                    onClick={async () => {
                                                                        try { await commentsApi.remove(selectedTask.id, c.id); setComments(prev => prev.filter(x => x.id !== c.id)); }
                                                                        catch (err) { console.error('Failed to delete comment', err); }
                                                                    }}
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                            <p className="comment-content">{c.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {comments.length === 0 && (
                                                <p className="ts-empty-state">No comments yet</p>
                                            )}
                                        </div>
                                    )}

                                    {sidebarTab === 'activities' && (
                                        <p className="ts-empty-state">No activities recorded</p>
                                    )}
                                </div>


                            </div>

                            {/* Action Footer - outside scrollable body */}
                            <div className="ts-action-row">
                                <button
                                    className="ts-save-btn"
                                    onClick={handleSaveTaskEdits}
                                    disabled={isSaving || (
                                        editPriority === selectedTask.priority &&
                                        editDescription === (selectedTask.description || '') &&
                                        editDueDate === (selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : '') &&
                                        JSON.stringify(editSubTasks.filter(s => !s._deleted).map(s => ({ id: s.id, status: s.status }))) ===
                                        JSON.stringify(selectedTask.subTasks.map(s => ({ id: s.id, status: s.status })))
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
                )
                }

                {/* Create Task Modal */}
                {
                    showCreateModal && (
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
                    )
                }
            </main >

            {/* Share Modal */}
            {
                showShareModal && projectId && (
                    <ShareModal
                        projectId={projectId}
                        projectName={projectName}
                        currentShareToken={shareToken}
                        isPublic={isProjectPublic}
                        onClose={() => setShowShareModal(false)}
                        onUpdate={(token, pub) => {
                            setShareToken(token);
                            setIsProjectPublic(pub);
                        }}
                    />
                )
            }
        </div >
    );
}
