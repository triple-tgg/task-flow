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

    // Share Link
    enableShare: (projectId: string) =>
        api.post(`/projects/${projectId}/share`).then(r => r.data),

    revokeShare: (projectId: string) =>
        api.delete(`/projects/${projectId}/share`).then(r => r.data),
};

// ─── Types ───────────────────────────────────────────

export interface AccessLink {
    id: string;
    groupId: string;
    name: string;
    url: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AccessGroup {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    links: AccessLink[];
    createdAt: string;
    updatedAt: string;
}

// ─── Public API (no auth — uses baseURL from shared instance) ─

export const publicApi = {
    getProject: (token: string) => {
        const baseURL = api.defaults.baseURL || 'http://localhost:3000/api/v1';
        return api.get(`${baseURL}/projects/public/${token}`, {
            // Skip auth interceptor for public endpoint
            headers: { Authorization: undefined },
        }).then(r => r.data);
    },
};

// ─── Access Groups API ───────────────────────────────

export const accessGroupsApi = {
    list: (projectId: string): Promise<AccessGroup[]> =>
        api.get(`/projects/${projectId}/access-groups`).then(r => r.data),

    create: (projectId: string, data: { name: string; description?: string }): Promise<AccessGroup> =>
        api.post(`/projects/${projectId}/access-groups`, data).then(r => r.data),

    update: (projectId: string, groupId: string, data: { name?: string; description?: string }): Promise<AccessGroup> =>
        api.patch(`/projects/${projectId}/access-groups/${groupId}`, data).then(r => r.data),

    remove: (projectId: string, groupId: string) =>
        api.delete(`/projects/${projectId}/access-groups/${groupId}`).then(r => r.data),

    // Links inside the groups
    createLink: (projectId: string, groupId: string, data: { name: string; url: string; description?: string }): Promise<AccessLink> =>
        api.post(`/projects/${projectId}/access-groups/${groupId}/links`, data).then(r => r.data),

    updateLink: (projectId: string, groupId: string, linkId: string, data: { name?: string; url?: string; description?: string }): Promise<AccessLink> =>
        api.patch(`/projects/${projectId}/access-groups/${groupId}/links/${linkId}`, data).then(r => r.data),

    removeLink: (projectId: string, groupId: string, linkId: string) =>
        api.delete(`/projects/${projectId}/access-groups/${groupId}/links/${linkId}`).then(r => r.data),
};

