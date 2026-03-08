import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAction } from '@prisma/client';
export declare class VaultAuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(params: {
        userId: string;
        action: VaultAction;
        entityType: string;
        entityId: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        ipAddress: string | null;
        action: import("@prisma/client").$Enums.VaultAction;
        entityType: string;
        entityId: string;
        metadata: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: VaultAction;
        entityType?: string;
    }): Promise<{
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
