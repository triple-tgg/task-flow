import api from './axios';

// ─── Projects API ────────────────────────────────────

export const projectsApi = {
    create: (data: { name: string; description?: string }) =>
        api.post('/projects', data).then(r => r.data),

    list: (page = 1, limit = 20) =>
        api.get('/projects', { params: { page, limit } }).then(r => r.data),

    getById: (id: string) =>
        api.get(`/projects/${id}`).then(r => r.data),

    update: (id: string, data: { name?: string; description?: string }) =>
        api.put(`/projects/${id}`, data).then(r => r.data),

    remove: (id: string) =>
        api.delete(`/projects/${id}`).then(r => r.data),

    // Members
    addMember: (projectId: string, userId: string, role = 'editor') =>
        api.post(`/projects/${projectId}/members`, { userId, role }).then(r => r.data),

    updateMemberRole: (projectId: string, userId: string, role: string) =>
        api.put(`/projects/${projectId}/members/${userId}`, { role }).then(r => r.data),

    removeMember: (projectId: string, userId: string) =>
        api.delete(`/projects/${projectId}/members/${userId}`).then(r => r.data),
};
