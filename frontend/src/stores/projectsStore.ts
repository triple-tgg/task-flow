import { create } from 'zustand';
import { projectsApi } from '../api/projects';

interface Project {
    id: string;
    name: string;
    description?: string;
    myRole: string;
    createdAt: string;
    updatedAt: string;
    _count?: { tasks: number; members: number };
    taskStats?: { total: number; done: number; overdue: number };
}

interface ProjectsState {
    projects: Project[];
    currentProject: any | null;
    isLoading: boolean;
    error: string | null;
    meta: { total: number; page: number; totalPages: number } | null;

    fetchProjects: (page?: number) => Promise<void>;
    fetchProject: (id: string) => Promise<void>;
    createProject: (data: { name: string; description?: string }) => Promise<void>;
    updateProject: (id: string, data: { name?: string; description?: string }) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    meta: null,

    fetchProjects: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const result = await projectsApi.list(page);
            set({ projects: result.data, meta: result.meta, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to load projects', isLoading: false });
        }
    },

    fetchProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const project = await projectsApi.getById(id);
            set({ currentProject: project, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to load project', isLoading: false });
        }
    },

    createProject: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await projectsApi.create(data);
            await get().fetchProjects();
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to create project', isLoading: false });
            throw err;
        }
    },

    updateProject: async (id, data) => {
        set({ error: null });
        try {
            await projectsApi.update(id, data);
            await get().fetchProjects();
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to update project' });
            throw err;
        }
    },

    deleteProject: async (id) => {
        set({ error: null });
        try {
            await projectsApi.remove(id);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to delete project' });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
