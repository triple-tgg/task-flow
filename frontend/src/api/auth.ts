import api from './axios';

export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export interface RegisterResponse {
    message: string;
    userId: string;
}

export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post<RegisterResponse>('/auth/register', data),

    verifyEmail: (token: string) =>
        api.post('/auth/verify-email', { token }),

    resendVerification: (email: string) =>
        api.post('/auth/resend-verification', { email }),

    login: (data: { email: string; password: string }) =>
        api.post<LoginResponse>('/auth/login', data),

    refresh: () =>
        api.post<LoginResponse>('/auth/refresh'),

    logout: () =>
        api.post('/auth/logout'),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    validateResetToken: (token: string) =>
        api.get<{ valid: boolean; message?: string }>(`/auth/reset-password/validate?token=${token}`),

    resetPassword: (data: { token: string; newPassword: string }) =>
        api.post('/auth/reset-password', data),
};
