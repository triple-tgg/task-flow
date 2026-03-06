import api from './axios';

export const usersApi = {
    getProfile: () =>
        api.get('/users/me').then(r => r.data),

    updateProfile: (data: { name?: string }) =>
        api.put('/users/me', data).then(r => r.data),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/users/me/change-password', { currentPassword, newPassword }).then(r => r.data),
};
