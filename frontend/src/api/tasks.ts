import api from './axios';

export interface Attachment {
    id: string;
    taskId: string;
    userId: string;
    filename: string;
    storagePath: string;
    size: number;
    mimeType: string;
    url?: string;
    createdAt: string;
}


export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    position: number;
    creator: { id: string; name: string; email: string };
    assignee?: { id: string; name: string; email: string } | null;
    tags: Array<{ tag: { id: string; name: string; color?: string } }>;
    subTasks: Array<{ id: string; title: string; status: string; priority: string }>;
    attachments?: Attachment[];
    _count: { comments: number; attachments: number };
    createdAt: string;
    updatedAt: string;
}

export interface KanbanBoard {
    todo: Task[];
    in_progress: Task[];
    review: Task[];
    done: Task[];
}

// ─── Tasks API ───────────────────────────────────────

export const tasksApi = {
    create: (projectId: string, data: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string;
        tags?: string[];
    }) => api.post(`/projects/${projectId}/tasks`, data).then(r => r.data),

    list: (projectId: string, filters?: {
        status?: string;
        priority?: string;
        assigneeId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => api.get(`/projects/${projectId}/tasks`, { params: filters }).then(r => r.data),

    getBoard: (projectId: string): Promise<KanbanBoard> =>
        api.get(`/projects/${projectId}/tasks/board`).then(r => r.data),

    getById: (taskId: string, projectId: string) =>
        api.get(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data),

    update: (taskId: string, projectId: string, data: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string;
    }) => api.put(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data),

    reorder: (projectId: string, taskId: string, newPosition: number, newStatus?: string) =>
        api.post(`/projects/${projectId}/tasks/reorder`, { taskId, newPosition, newStatus }).then(r => r.data),

    updateTags: (taskId: string, projectId: string, tags: string[]) =>
        api.put(`/projects/${projectId}/tasks/${taskId}/tags`, { tags }).then(r => r.data),

    remove: (taskId: string, projectId: string) =>
        api.delete(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data),
};

// ─── Comments API ────────────────────────────────────

export const commentsApi = {
    create: (taskId: string, content: string) =>
        api.post(`/tasks/${taskId}/comments`, { content }).then(r => r.data),

    list: (taskId: string, page = 1) =>
        api.get(`/tasks/${taskId}/comments`, { params: { page } }).then(r => r.data),

    update: (taskId: string, commentId: string, content: string) =>
        api.put(`/tasks/${taskId}/comments/${commentId}`, { content }).then(r => r.data),

    remove: (taskId: string, commentId: string) =>
        api.delete(`/tasks/${taskId}/comments/${commentId}`).then(r => r.data),
};

// ─── Notifications API ───────────────────────────────

export const notificationsApi = {
    list: (page = 1) =>
        api.get('/notifications', { params: { page } }).then(r => r.data),

    markRead: (id: string) =>
        api.post(`/notifications/${id}/read`).then(r => r.data),

    markAllRead: () =>
        api.post('/notifications/read-all').then(r => r.data),
};

// ─── Attachments API ─────────────────────────────────

export const attachmentsApi = {
    upload: (taskId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/attachments/task/${taskId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(r => r.data);
    },

    list: (taskId: string) =>
        api.get(`/attachments/task/${taskId}`).then(r => r.data),

    remove: (attachmentId: string) =>
        api.delete(`/attachments/${attachmentId}`).then(r => r.data),
};
