import { VaultAuditService } from '../services/vault-audit.service';
import { VaultAction } from '@prisma/client';
export declare class VaultAuditController {
    private readonly auditService;
    constructor(auditService: VaultAuditService);
    findAll(page?: string, limit?: string, userId?: string, action?: VaultAction, entityType?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            ipAddress: string | null;
            action: import("@prisma/client").$Enums.VaultAction;
            entityType: string;
            entityId: string;
            metadata: import(".prisma/client/runtime/client").JsonValue | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
}
