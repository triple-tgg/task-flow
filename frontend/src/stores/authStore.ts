import { create } from 'zustand';
import { authApi } from '../api/auth';
import { setAccessToken } from '../api/axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<string>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login({ email, password });
            const { accessToken, user } = response.data;
            setAccessToken(accessToken);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const message =
                error.response?.data?.message || 'Login failed. Please try again.';
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.register({ name, email, password });
            set({ isLoading: false });
            return response.data.message;
        } catch (error: any) {
            const message =
                error.response?.data?.message || 'Registration failed. Please try again.';
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        }
        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
    },

    refreshAuth: async () => {
        try {
            const response = await authApi.refresh();
            const { accessToken, user } = response.data;
            setAccessToken(accessToken);
            set({ user, isAuthenticated: true });
        } catch {
            setAccessToken(null);
            set({ user: null, isAuthenticated: false });
        }
    },

    clearError: () => set({ error: null }),
}));
