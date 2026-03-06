import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
    constructor(private prisma: PrismaService) { }

    /**
     * Log an activity. Called internally by other services.
     */
    async log(params: {
        userId: string;
        projectId?: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata?: Record<string, any>;
    }) {
        return this.prisma.activityLog.create({
            data: {
                userId: params.userId,
                projectId: params.projectId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                metadata: params.metadata || undefined,
            },
        });
    }

    /**
     * Get activity log for a project (requires membership check externally)
     */
    async getByProject(projectId: string, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where: { projectId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.activityLog.count({ where: { projectId } }),
        ]);

        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Get activity log for the current user
     */
    async getByUser(userId: string, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.activityLog.count({ where: { userId } }),
        ]);

        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Cleanup old logs (data retention — keep last 90 days)
     */
    async purgeOldLogs(daysToKeep = 90) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);

        const result = await this.prisma.activityLog.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });

        return { deleted: result.count };
    }
}
