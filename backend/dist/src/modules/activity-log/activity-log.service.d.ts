import { PrismaService } from '../../prisma/prisma.service';
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        userId: string;
        projectId?: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
    getByProject(projectId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            projectId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import(".prisma/client/runtime/client").JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getByUser(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            projectId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import(".prisma/client/runtime/client").JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    purgeOldLogs(daysToKeep?: number): Promise<{
        deleted: number;
    }>;
}
