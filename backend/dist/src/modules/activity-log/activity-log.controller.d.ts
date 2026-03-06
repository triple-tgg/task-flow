import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ActivityLogController {
    private readonly activityLogService;
    private readonly prisma;
    constructor(activityLogService: ActivityLogService, prisma: PrismaService);
    getMyActivity(userId: string, page?: string, limit?: string): Promise<{
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
    getProjectActivity(projectId: string, userId: string, page?: string, limit?: string): Promise<{
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
}
