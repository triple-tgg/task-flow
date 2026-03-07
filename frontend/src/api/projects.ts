import api from './axios';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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

    // Share Link
    enableShare: (projectId: string) =>
        api.post(`/projects/${projectId}/share`).then(r => r.data),

    revokeShare: (projectId: string) =>
        api.delete(`/projects/${projectId}/share`).then(r => r.data),
};

// ─── Public API (no auth) ────────────────────────────

export const publicApi = {
    getProject: (token: string) =>
        axios.get(`${API_BASE_URL}/projects/public/${token}`).then(r => r.data),
};
