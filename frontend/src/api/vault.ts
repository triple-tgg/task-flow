import api from './axios';

// ─── Types ───────────────────────────────────────────

export interface VaultTool {
    id: string;
    name: string;
    category?: string;
    website?: string;
    iconUrl?: string;
    description?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    _count: { accounts: number };
}

export interface VaultAccount {
    id: string;
    toolId: string;
    accountType: 'PASSWORD' | 'ENVIRONMENT';
    name: string;
    website?: string;
    username?: string;
    email?: string;
    note?: string;
    projectId?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    tool?: { id: string; name: string; category?: string };
    secrets?: Array<{ id: string; key: string; keyVersion: number; note?: string; createdAt: string; updatedAt: string }>;
    _count: { secrets: number };
}

export interface VaultSecret {
    id: string;
    key: string;
    keyVersion: number;
    note?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface VaultAuditEntry {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    createdAt: string;
}

// ─── Vault Tools API ──────────────────────────────────

export const vaultToolsApi = {
    list: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
        api.get<{ data: VaultTool[]; pagination: Pagination }>('/vault/tools', { params }).then(r => r.data),

    getById: (id: string) =>
        api.get<VaultTool>(`/vault/tools/${id}`).then(r => r.data),

    create: (data: { name: string; category?: string; website?: string; iconUrl?: string; description?: string }) =>
        api.post<VaultTool>('/vault/tools', data).then(r => r.data),

    update: (id: string, data: { name?: string; category?: string; website?: string; iconUrl?: string; description?: string }) =>
        api.patch<VaultTool>(`/vault/tools/${id}`, data).then(r => r.data),

    remove: (id: string) =>
        api.delete(`/vault/tools/${id}`).then(r => r.data),
};

// ─── Vault Accounts API ──────────────────────────────

export const vaultAccountsApi = {
    listByTool: (toolId: string, params?: { page?: number; limit?: number; search?: string }) =>
        api.get<{ data: VaultAccount[]; pagination: Pagination }>(`/vault/tools/${toolId}/accounts`, { params }).then(r => r.data),

    getById: (id: string) =>
        api.get<VaultAccount>(`/vault/accounts/${id}`).then(r => r.data),

    create: (toolId: string, data: { name: string; accountType?: string; website?: string; username?: string; email?: string; note?: string; projectId?: string }) =>
        api.post<VaultAccount>(`/vault/tools/${toolId}/accounts`, data).then(r => r.data),

    update: (id: string, data: { name?: string; username?: string; email?: string; note?: string }) =>
        api.patch<VaultAccount>(`/vault/accounts/${id}`, data).then(r => r.data),

    remove: (id: string) =>
        api.delete(`/vault/accounts/${id}`).then(r => r.data),
};

// ─── Vault Secrets API ───────────────────────────────

export const vaultSecretsApi = {
    listByAccount: (accountId: string) =>
        api.get<VaultSecret[]>(`/vault/accounts/${accountId}/secrets`).then(r => r.data),

    decrypt: (id: string) =>
        api.get<{ id: string; key: string; value: string; note?: string }>(`/vault/secrets/${id}/decrypt`).then(r => r.data),

    create: (accountId: string, data: { key: string; value: string; note?: string }) =>
        api.post(`/vault/accounts/${accountId}/secrets`, data).then(r => r.data),

    update: (id: string, data: { value: string; note?: string }) =>
        api.patch(`/vault/secrets/${id}`, data).then(r => r.data),

    remove: (id: string) =>
        api.delete(`/vault/secrets/${id}`).then(r => r.data),
};

// ─── Vault Audit API ─────────────────────────────────

export const vaultAuditApi = {
    list: (params?: { page?: number; limit?: number; userId?: string; action?: string; entityType?: string }) =>
        api.get<{ data: VaultAuditEntry[]; pagination: Pagination }>('/vault/audit', { params }).then(r => r.data),
};
