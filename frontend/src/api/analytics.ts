import api from './axios';

export const analyticsApi = {
    getDashboard: () =>
        api.get('/analytics/dashboard').then(r => r.data),

    getTrend: () =>
        api.get('/analytics/trend').then(r => r.data),
};
