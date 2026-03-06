import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get dashboard analytics for the current user
     */
    async getDashboardStats(userId: string) {
        // Get user's project IDs
        const memberships = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true, role: true },
        });
        const projectIds = memberships.map((m) => m.projectId);

        if (projectIds.length === 0) {
            return this.emptyStats();
        }

        // Run all queries in parallel
        const [
            totalProjects,
            totalTasks,
            tasksByStatus,
            tasksByPriority,
            myAssignedTasks,
            overdueTasks,
            recentTasks,
            recentActivity,
        ] = await Promise.all([
            // Total projects
            this.prisma.project.count({
                where: { id: { in: projectIds }, deletedAt: null },
            }),

            // Total tasks across all projects
            this.prisma.task.count({
                where: { projectId: { in: projectIds }, deletedAt: null },
            }),

            // Tasks grouped by status
            this.prisma.task.groupBy({
                by: ['status'],
                where: { projectId: { in: projectIds }, deletedAt: null },
                _count: { id: true },
            }),

            // Tasks grouped by priority
            this.prisma.task.groupBy({
                by: ['priority'],
                where: { projectId: { in: projectIds }, deletedAt: null },
                _count: { id: true },
            }),

            // Tasks assigned to the current user
            this.prisma.task.count({
                where: {
                    assigneeId: userId,
                    deletedAt: null,
                    status: { not: 'done' },
                },
            }),

            // Overdue tasks
            this.prisma.task.count({
                where: {
                    projectId: { in: projectIds },
                    deletedAt: null,
                    status: { not: 'done' },
                    dueDate: { lt: new Date() },
                },
            }),

            // Recent tasks (last 7 days)
            this.prisma.task.findMany({
                where: {
                    projectId: { in: projectIds },
                    deletedAt: null,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    projectId: true,
                    project: { select: { name: true } },
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),

            // Recent activity (last 7 days)
            this.prisma.activityLog.findMany({
                where: {
                    projectId: { in: projectIds },
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
                orderBy: { createdAt: 'desc' },
                take: 15,
            }),
        ]);

        // Build status map
        const statusMap: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
        for (const group of tasksByStatus) {
            statusMap[group.status] = group._count.id;
        }

        // Build priority map
        const priorityMap: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
        for (const group of tasksByPriority) {
            priorityMap[group.priority] = group._count.id;
        }

        // Completion rate
        const completionRate = totalTasks > 0
            ? Math.round((statusMap.done / totalTasks) * 100)
            : 0;

        return {
            overview: {
                totalProjects,
                totalTasks,
                myAssignedTasks,
                overdueTasks,
                completionRate,
            },
            tasksByStatus: statusMap,
            tasksByPriority: priorityMap,
            recentTasks,
            recentActivity,
        };
    }

    /**
     * Get task completion trend (last 30 days)
     */
    async getCompletionTrend(userId: string) {
        const memberships = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true },
        });
        const projectIds = memberships.map((m) => m.projectId);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get tasks completed in the last 30 days (updatedAt when status changed to done)
        const completedTasks = await this.prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
                status: 'done',
                updatedAt: { gte: thirtyDaysAgo },
            },
            select: { updatedAt: true },
        });

        // Get tasks created in the last 30 days
        const createdTasks = await this.prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
                deletedAt: null,
                createdAt: { gte: thirtyDaysAgo },
            },
            select: { createdAt: true },
        });

        // Build daily buckets
        const days: Array<{ date: string; created: number; completed: number }> = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            days.push({ date: dateStr, created: 0, completed: 0 });
        }

        for (const t of createdTasks) {
            const dateStr = t.createdAt.toISOString().split('T')[0];
            const bucket = days.find((d) => d.date === dateStr);
            if (bucket) bucket.created++;
        }

        for (const t of completedTasks) {
            const dateStr = t.updatedAt.toISOString().split('T')[0];
            const bucket = days.find((d) => d.date === dateStr);
            if (bucket) bucket.completed++;
        }

        return days;
    }

    private emptyStats() {
        return {
            overview: {
                totalProjects: 0,
                totalTasks: 0,
                myAssignedTasks: 0,
                overdueTasks: 0,
                completionRate: 0,
            },
            tasksByStatus: { todo: 0, in_progress: 0, review: 0, done: 0 },
            tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
            recentTasks: [],
            recentActivity: [],
        };
    }
}
