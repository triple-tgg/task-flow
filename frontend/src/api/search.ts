import api from './axios';

export const searchApi = {
    search: (query: string, limit = 20) =>
        api.get('/search', { params: { q: query, limit } }).then(r => r.data),
};

export const activityLogApi = {
    getMyActivity: (page = 1) =>
        api.get('/activity-log/me', { params: { page } }).then(r => r.data),

    getProjectActivity: (projectId: string, page = 1) =>
        api.get(`/activity-log/projects/${projectId}`, { params: { page } }).then(r => r.data),
};
